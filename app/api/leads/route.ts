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

    const leads = await prisma.lead.findMany({
      where: {
        assistantId: assistant.id,
      },
      include: {
        conversation: {
          select: {
            id: true,
            visitorName: true,
            visitorEmail: true,
            visitorPhone: true,
            startedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return NextResponse.json(
      { error: "Unable to load leads." },
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

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : null;

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : null;

    const interest =
      typeof body.interest === "string"
        ? body.interest.trim()
        : null;

    const conversationId =
      body.conversationId !== undefined &&
      body.conversationId !== null
        ? Number(body.conversationId)
        : null;

    if (!name) {
      return NextResponse.json(
        { error: "Lead name is required." },
        { status: 400 }
      );
    }

    if (email === "" && phone === "") {
      return NextResponse.json(
        {
          error:
            "At least an email address or phone number is required.",
        },
        { status: 400 }
      );
    }

    let validConversationId: number | null = null;

    if (conversationId !== null) {
      if (!conversationId) {
        return NextResponse.json(
          { error: "Invalid conversation ID." },
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

      validConversationId = conversation.id;
    }

    const lead = await prisma.lead.create({
      data: {
        assistantId: assistant.id,
        conversationId: validConversationId,
        name,
        email: email || null,
        phone: phone || null,
        interest: interest || null,
      },
    });

    return NextResponse.json(
      {
        message: "Lead created successfully.",
        lead,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create lead error:", error);

    return NextResponse.json(
      { error: "Unable to create lead." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if (result.error) {
      return result.error;
    }

    const { assistant } = result;

    const body = await request.json();

    const leadId = Number(body.leadId);

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required." },
        { status: 400 }
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        assistantId: assistant.id,
      },
    });

    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found." },
        { status: 404 }
      );
    }

    const validStatuses = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "CONVERTED",
      "LOST",
    ];

    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid lead status." },
        { status: 400 }
      );
    }

    const updatedLead = await prisma.lead.update({
      where: {
        id: lead.id,
      },
      data: {
        status: status as
          | "NEW"
          | "CONTACTED"
          | "QUALIFIED"
          | "CONVERTED"
          | "LOST",
      },
    });

    return NextResponse.json({
      message: "Lead updated successfully.",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return NextResponse.json(
      { error: "Unable to update lead." },
      { status: 500 }
    );
  }
}