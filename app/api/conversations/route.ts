import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCompanyAssistant() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "COMPANY_ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  const companyId = session.user.companyId;

  if (!companyId) {
    return {
      error: NextResponse.json(
        { error: "Company not assigned." },
        { status: 400 }
      ),
    };
  }

  const assistant = await prisma.assistant.findFirst({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (!assistant) {
    return {
      error: NextResponse.json(
        { error: "Assistant not found." },
        { status: 404 }
      ),
    };
  }

  return {
    assistant,
  };
}

export async function GET() {
  try {
    const result = await getCompanyAssistant();

    if (result.error) {
      return result.error;
    }

    const { assistant } = result;

    const conversations = await prisma.conversation.findMany({
      where: {
        assistantId: assistant.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        leads: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return NextResponse.json(
      { error: "Unable to load conversations." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if (result.error) {
      return result.error;
    }

    const { assistant } = result;

    const body = await request.json();

    const action =
      typeof body.action === "string"
        ? body.action.trim()
        : "create";

    if (action === "message") {
      const conversationId = Number(body.conversationId);

      if (!conversationId) {
        return NextResponse.json(
          { error: "Conversation ID is required." },
          { status: 400 }
        );
      }

      const sender =
        typeof body.sender === "string"
          ? body.sender.trim().toLowerCase()
          : "";

      const content =
        typeof body.content === "string"
          ? body.content.trim()
          : "";

      if (!sender) {
        return NextResponse.json(
          { error: "Message sender is required." },
          { status: 400 }
        );
      }

      if (!["visitor", "assistant"].includes(sender)) {
        return NextResponse.json(
          {
            error:
              "Message sender must be visitor or assistant.",
          },
          { status: 400 }
        );
      }

      if (!content) {
        return NextResponse.json(
          { error: "Message content is required." },
          { status: 400 }
        );
      }

      const conversation =
        await prisma.conversation.findFirst({
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

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          sender,
          content,
        },
      });

      await prisma.conversation.update({
        where: {
          id: conversation.id,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          message: "Message added successfully.",
          data: message,
        },
        { status: 201 }
      );
    }

    if (action !== "create") {
      return NextResponse.json(
        { error: "Invalid conversation action." },
        { status: 400 }
      );
    }

    const visitorName =
      typeof body.visitorName === "string"
        ? body.visitorName.trim()
        : null;

    const visitorEmail =
      typeof body.visitorEmail === "string"
        ? body.visitorEmail.trim()
        : null;

    const visitorPhone =
      typeof body.visitorPhone === "string"
        ? body.visitorPhone.trim()
        : null;

    const interest =
      typeof body.interest === "string"
        ? body.interest.trim()
        : null;

    const conversation = await prisma.conversation.create({
      data: {
        assistantId: assistant.id,
        visitorName: visitorName || null,
        visitorEmail: visitorEmail || null,
        visitorPhone: visitorPhone || null,
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
          email: visitorEmail || null,
          phone: visitorPhone || null,
          interest: interest || null,
          status: "NEW",
        },
      });
    }

    return NextResponse.json(
      {
        message: "Conversation created successfully.",
        conversation,
        lead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Conversation API error:", error);

    return NextResponse.json(
      { error: "Unable to process conversation request." },
      { status: 500 }
    );
  }
}