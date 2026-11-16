
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
    where: { companyId },
    orderBy: { createdAt: "asc" },
  });

  if (!assistant) {
    return {
      error: NextResponse.json(
        { error: "Assistant not found." },
        { status: 404 }
      ),
    };
  }

  return { assistant };
}

// GET: Paginated leads, search, filters and statistics
export async function GET(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if (result.error) return result.error;

    const { assistant } = result;
    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number(searchParams.get("page")) || 1
    );

    const pageSize = Math.min(
      50,
      Math.max(1, Number(searchParams.get("pageSize")) || 10)
    );

    const search = (searchParams.get("search") || "").trim();
    const status = (searchParams.get("status") || "ALL").toUpperCase();

    const validStatuses = [
      "NEW",
      "CONTACTED",
      "QUALIFIED",
      "CONVERTED",
      "LOST",
    ];

    if (status !== "ALL" && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid lead status filter." },
        { status: 400 }
      );
    }

    const searchConditions = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { interest: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const where = {
      assistantId: assistant.id,
      ...(status !== "ALL"
        ? { status: status as
            | "NEW"
            | "CONTACTED"
            | "QUALIFIED"
            | "CONVERTED"
            | "LOST" }
        : {}),
      ...searchConditions,
    };

    const [leads, total, totalLeads, statusCounts] =
      await prisma.$transaction([
        prisma.lead.findMany({
          where,
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
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),

        prisma.lead.count({ where }),

        prisma.lead.count({
          where: { assistantId: assistant.id },
        }),

        prisma.lead.groupBy({
  by: ["status"],
  where: { assistantId: assistant.id },
  orderBy: { status: "asc" },
  _count: { _all: true },
}),
      ]);

    const counts = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      CONVERTED: 0,
      LOST: 0,
    };

   for (const item of statusCounts) {
  const count =
    typeof item._count === "object" && item._count !== null
      ? item._count._all ?? 0
      : 0;

  counts[item.status] = count;
}

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      leads,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      stats: {
        total: totalLeads,
        new: counts.NEW,
        inProgress: counts.CONTACTED + counts.QUALIFIED,
        converted: counts.CONVERTED,
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return NextResponse.json(
      { error: "Unable to load leads." },
      { status: 500 }
    );
  }
}

// POST: Create a lead
export async function POST(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if (result.error) return result.error;

    const { assistant } = result;
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim() : null;

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : null;

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

// PATCH: Update lead status
export async function PATCH(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if (result.error) return result.error;

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
      where: { id: lead.id },
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
