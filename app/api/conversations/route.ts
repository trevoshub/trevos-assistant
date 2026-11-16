
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

// GET: Paginated conversation list and individual conversation history
export async function GET(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if (result.error) {
      return result.error;
    }

    const { assistant } = result;
    const { searchParams } = new URL(request.url);

    // Load a specific conversation with its complete message history.
    if (searchParams.has("conversationId")) {
      const conversationId = Number(
        searchParams.get("conversationId")
      );

      if (
        !Number.isInteger(conversationId) ||
        conversationId <= 0
      ) {
        return NextResponse.json(
          { error: "Invalid conversation ID." },
          { status: 400 }
        );
      }

      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
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
      });

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        conversation,
      });
    }

    // Read pagination and search parameters.
    const requestedPage = Number(
      searchParams.get("page")
    );

    const requestedPageSize = Number(
      searchParams.get("pageSize")
    );

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const pageSize =
      Number.isInteger(requestedPageSize) &&
      requestedPageSize > 0
        ? Math.min(requestedPageSize, 50)
        : 10;

    const search = (
      searchParams.get("search") || ""
    ).trim();

    // Build company-specific search conditions.
    const where = {
      assistantId: assistant.id,
      ...(search
        ? {
            OR: [
              {
                visitorName: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                visitorEmail: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                visitorPhone: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    // Retrieve only the conversations needed for this page.
    const [conversations, total] = await prisma.$transaction([
      prisma.conversation.findMany({
        where,
        select: {
          id: true,
          assistantId: true,
          visitorName: true,
          visitorEmail: true,
          visitorPhone: true,
          startedAt: true,
          updatedAt: true,
          _count: {
            select: {
              messages: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),

      prisma.conversation.count({
        where,
      }),
    ]);

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        assistantId: conversation.assistantId,
        visitorName: conversation.visitorName,
        visitorEmail: conversation.visitorEmail,
        visitorPhone: conversation.visitorPhone,
        startedAt: conversation.startedAt,
        updatedAt: conversation.updatedAt,
        messageCount: conversation._count.messages,
      })),

      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return NextResponse.json(
      { error: "Unable to load conversations." },
      { status: 500 }
    );
  }
}

// POST: Create conversations and add messages.
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

    // Add a message to an existing conversation.
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

    // Create a new conversation.
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
