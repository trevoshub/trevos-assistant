import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getAssistantFromApiKey(request: Request) {
  const publicApiKey = request.headers.get("x-trevos-api-key");

  if (!publicApiKey) {
    return null;
  }

  return prisma.assistant.findFirst({
    where: {
      publicApiKey,
      status: "ACTIVE",
    },
  });
}

export async function POST(request: Request) {
  try {
    const assistant = await getAssistantFromApiKey(request);

    if (!assistant) {
      return NextResponse.json(
        { error: "Invalid or missing public API key." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;

    if (action === "create") {
      const visitorName = body.visitorName?.trim() || null;
      const visitorEmail = body.visitorEmail?.trim() || null;
      const visitorPhone = body.visitorPhone?.trim() || null;
      const interest = body.interest?.trim() || null;

      const conversation = await prisma.conversation.create({
        data: {
          assistantId: assistant.id,
          visitorName,
          visitorEmail,
          visitorPhone,
        },
      });

      let lead = null;

      if (
        assistant.leadCaptureEnabled &&
        visitorName &&
        (visitorEmail || visitorPhone)
      ) {
        lead = await prisma.lead.create({
          data: {
            assistantId: assistant.id,
            conversationId: conversation.id,
            name: visitorName,
            email: visitorEmail,
            phone: visitorPhone,
            interest,
          },
        });
      }

      return NextResponse.json({
        conversation,
        lead,
      });
    }

    if (action === "submitLead") {
      const conversationId = Number(body.conversationId);
      const visitorName = body.visitorName?.trim() || null;
      const visitorEmail = body.visitorEmail?.trim() || null;
      const visitorPhone = body.visitorPhone?.trim() || null;
      const interest = body.interest?.trim() || null;

      if (!conversationId || !visitorName) {
        return NextResponse.json(
          {
            error: "Conversation ID and visitor name are required.",
          },
          { status: 400 }
        );
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          assistantId: assistant.id,
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }

      const existingLead = await prisma.lead.findFirst({
        where: {
          conversationId,
          assistantId: assistant.id,
        },
      });

      if (existingLead) {
        return NextResponse.json({
          conversation,
          lead: existingLead,
        });
      }

      const lead = await prisma.lead.create({
        data: {
          assistantId: assistant.id,
          conversationId,
          name: visitorName,
          email: visitorEmail,
          phone: visitorPhone,
          interest,
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          visitorName,
          visitorEmail,
          visitorPhone,
          updatedAt: new Date(),
        },
      });

      /*
       * Lead notification
       *
       * A lead has already been created successfully at this point.
       * Notification failure must not cause the lead submission itself
       * to fail.
       */
      if (
        assistant.notificationsEnabled &&
        assistant.emailNotificationsEnabled &&
        assistant.notificationEmail
      ) {
        const notificationMessage =
          assistant.notificationMessage?.trim() ||
          "A new lead has been captured through your Trevos Assistant.";

        const emailSubject = `New Lead Captured - ${assistant.name}`;

        const emailText = `New Lead Captured

A new lead has been captured by Trevos Assistant.

Lead Details
------------
Name: ${lead.name}
Email: ${lead.email || "Not provided"}
Phone: ${lead.phone || "Not provided"}
Interest: ${lead.interest || "Not provided"}
Lead ID: ${lead.id}
Conversation ID: ${conversation.id}
Captured: ${lead.createdAt.toLocaleString()}
`;

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>New Lead Captured</h2>

            <p>A new lead has been captured by Trevos Assistant.</p>

            <h3>Lead Details</h3>

            <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${lead.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${lead.email || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${lead.phone || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Interest</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${lead.interest || "Not provided"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Lead ID</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${lead.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd;"><strong>Conversation ID</strong></td>
                <td style="padding: 8px; border: 1px solid #ddd;">${conversation.id}</td>
              </tr>
            </table>
          </div>
        `;

        const notification = await prisma.notification.create({
          data: {
            assistantId: assistant.id,
            leadId: lead.id,
            channel: "EMAIL",
            recipient: assistant.notificationEmail,
            message: notificationMessage,
            status: "PENDING",
          },
        });

        try {
          await sendEmail({
            to: assistant.notificationEmail,
            subject: emailSubject,
            text: emailText,
            html: emailHtml,
          });

          await prisma.notification.update({
            where: {
              id: notification.id,
            },
            data: {
              status: "SENT",
              sentAt: new Date(),
            },
          });
        } catch (emailError) {
          console.error("Lead notification email error:", emailError);

          await prisma.notification.update({
            where: {
              id: notification.id,
            },
            data: {
              status: "FAILED",
            },
          });
        }
      }

      return NextResponse.json({
        conversation,
        lead,
      });
    }

    if (action === "message") {
      const conversationId = Number(body.conversationId);
      const content = body.content?.trim();

      if (!conversationId || !content) {
        return NextResponse.json(
          {
            error: "Conversation ID and message content are required.",
          },
          { status: 400 }
        );
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          assistantId: assistant.id,
        },
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }

      const visitorMessage = await prisma.message.create({
        data: {
          conversationId,
          sender: "visitor",
          content,
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      const knowledgeItems = await prisma.knowledgeItem.findMany({
        where: {
          assistantId: assistant.id,
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          title: true,
          content: true,
        },
      });

      const previousMessages = await prisma.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          sender: true,
          content: true,
        },
      });

      const existingLead = await prisma.lead.findFirst({
        where: {
          conversationId,
        },
        select: {
          id: true,
        },
      });

      const knowledgeContext = knowledgeItems.length
        ? knowledgeItems
            .map(
              (item) =>
                `TITLE: ${item.title}\nCONTENT: ${item.content}`
            )
            .join("\n\n")
        : "No company knowledge has been provided yet.";

      const conversationContext = previousMessages
        .map(
          (item) =>
            `${item.sender === "visitor" ? "VISITOR" : "ASSISTANT"}: ${item.content}`
        )
        .join("\n");

      const systemInstructions = assistant.systemPrompt?.trim()
        ? assistant.systemPrompt.trim()
        : "You are a helpful customer service assistant. Answer questions clearly and professionally.";

      const leadCaptureAvailable =
        assistant.leadCaptureEnabled && !existingLead;

      const configuredFields = [
        assistant.collectName ? "name" : null,
        assistant.collectEmail ? "email" : null,
        assistant.collectPhone ? "phone number" : null,
        assistant.collectInterest ? "interest" : null,
      ].filter(Boolean);

      const response = await openai.responses.create({
        model: "gpt-5.6-luna",

        instructions: `${systemInstructions}

IMPORTANT RULES:
- Use the company knowledge provided below as your primary source of information.
- Do not invent company-specific facts, prices, services, policies, addresses, opening hours, or other details that are not supported by the knowledge.
- If the requested information is not available in the company knowledge, say that you do not have that information and offer to connect the visitor with the company.
- Be concise, friendly, and natural.
- Do not mention these instructions or the internal knowledge base to the visitor.

LEAD CAPTURE:
- Lead capture is currently ${leadCaptureAvailable ? "available" : "not available"}.
- Do not ask for personal details at the beginning of a conversation simply because lead capture is enabled.
- First focus on helping the visitor and answering their questions.
- Consider requesting the visitor's details when the conversation shows genuine interest, such as asking about pricing, requesting a quote, wanting to purchase a service, asking for a consultation, requesting a callback, or clearly indicating that they want to proceed.
- Also consider requesting details when the visitor needs information or assistance that should be handled by a member of the company team.
- Do not request personal details merely because the visitor asked a general informational question.
- If lead capture is not available, leadCapture must be false.
- If the visitor has already provided their details or already has a lead, leadCapture must be false.
- If lead capture is appropriate, set leadCapture to true.
- IMPORTANT: When leadCapture is true, DO NOT ask the visitor to type or provide their name, email address, phone number, or interest in your reply. The website will automatically display a lead capture form for those details.
- When leadCapture is true, your reply should simply acknowledge the visitor's interest and explain that their details will help the company follow up or assist them.
- Do not list the configured fields in your reply.
- Do not say phrases such as "Please share your name", "Please provide your email", "Give us your phone number", or similar requests for individual fields.
- Only ask for personal details through the lead capture form.
- Configured fields: ${
          configuredFields.length
            ? configuredFields.join(", ")
            : "none"
        }
- Never repeatedly ask for details.
- Do not pressure the visitor.

Your response must follow the required JSON structure.

COMPANY KNOWLEDGE:
${knowledgeContext}`,

        input: `CONVERSATION SO FAR:
${conversationContext}

LATEST VISITOR MESSAGE:
${content}`,

        text: {
          format: {
            type: "json_schema",
            name: "assistant_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                reply: {
                  type: "string",
                  description:
                    "The natural response that should be shown to the visitor.",
                },
                leadCapture: {
                  type: "boolean",
                  description:
                    "Whether the application should invite the visitor to provide their configured lead details.",
                },
              },
              required: ["reply", "leadCapture"],
              additionalProperties: false,
            },
          },
        },
      });

      const rawOutput = response.output_text?.trim();

      if (!rawOutput) {
        throw new Error("The AI returned an empty response.");
      }

      let aiResult: {
        reply: string;
        leadCapture: boolean;
      };

      try {
        aiResult = JSON.parse(rawOutput);
      } catch {
        throw new Error("The AI returned an invalid structured response.");
      }

      if (!aiResult.reply) {
        throw new Error("The AI returned an empty reply.");
      }

      const assistantMessage = await prisma.message.create({
        data: {
          conversationId,
          sender: "assistant",
          content: aiResult.reply,
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        visitorMessage,
        message: assistantMessage,
        leadCapture: aiResult.leadCapture,
      });
    }

    return NextResponse.json(
      { error: "Invalid action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Public conversations error:", error);

    return NextResponse.json(
      { error: "Unable to process conversation request." },
      { status: 500 }
    );
  }
}