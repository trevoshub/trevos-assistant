import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCompanyAssistant() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "COMPANY_ADMIN") {
    return {
      error: NextResponse.json(
        {
          error:
            "Only company administrators can manage the knowledge base.",
        },
        { status: 403 }
      ),
    };
  }

  if (!session.user.companyId) {
    return {
      error: NextResponse.json(
        { error: "No company is associated with this account." },
        { status: 400 }
      ),
    };
  }

  const assistant = await prisma.assistant.findFirst({
    where: {
      companyId: session.user.companyId,
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

  return { assistant };
}

export async function GET() {
  try {
    const result = await getCompanyAssistant();

    if ("error" in result) {
      return result.error;
    }

    const knowledgeItems = await prisma.knowledgeItem.findMany({
      where: {
        assistantId: result.assistant.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(knowledgeItems);
  } catch (error) {
    console.error("Get knowledge items error:", error);

    return NextResponse.json(
      { error: "Unable to load knowledge items." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if ("error" in result) {
      return result.error;
    }

    const body = await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        { error: "Knowledge item title is required." },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Knowledge item content is required." },
        { status: 400 }
      );
    }

    const knowledgeItem = await prisma.knowledgeItem.create({
      data: {
        assistantId: result.assistant.id,
        title,
        content,
      },
    });

    return NextResponse.json(
      knowledgeItem,
      { status: 201 }
    );
  } catch (error) {
    console.error("Create knowledge item error:", error);

    return NextResponse.json(
      { error: "Unable to create knowledge item." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if ("error" in result) {
      return result.error;
    }

    const body = await request.json();

    const id = Number(body.knowledgeId);

    if (!id) {
      return NextResponse.json(
        { error: "Knowledge item ID is required." },
        { status: 400 }
      );
    }

    const existingItem =
      await prisma.knowledgeItem.findFirst({
        where: {
          id,
          assistantId: result.assistant.id,
        },
      });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Knowledge item not found." },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      content?: string;
      isActive?: boolean;
    } = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();

      if (!title) {
        return NextResponse.json(
          { error: "Knowledge item title cannot be empty." },
          { status: 400 }
        );
      }

      data.title = title;
    }

    if (typeof body.content === "string") {
      const content = body.content.trim();

      if (!content) {
        return NextResponse.json(
          { error: "Knowledge item content cannot be empty." },
          { status: 400 }
        );
      }

      data.content = content;
    }

    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "No valid knowledge item changes were provided." },
        { status: 400 }
      );
    }

    const updatedItem =
      await prisma.knowledgeItem.update({
        where: {
          id: existingItem.id,
        },
        data,
      });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Update knowledge item error:", error);

    return NextResponse.json(
      { error: "Unable to update knowledge item." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await getCompanyAssistant();

    if ("error" in result) {
      return result.error;
    }

    const body = await request.json();

const id = Number(body.knowledgeId);

    if (!id) {
      return NextResponse.json(
        { error: "Knowledge item ID is required." },
        { status: 400 }
      );
    }

    const existingItem =
      await prisma.knowledgeItem.findFirst({
        where: {
          id,
          assistantId: result.assistant.id,
        },
      });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Knowledge item not found." },
        { status: 404 }
      );
    }

    await prisma.knowledgeItem.delete({
      where: {
        id: existingItem.id,
      },
    });

    return NextResponse.json({
      message: "Knowledge item deleted successfully.",
    });
  } catch (error) {
    console.error("Delete knowledge item error:", error);

    return NextResponse.json(
      { error: "Unable to delete knowledge item." },
      { status: 500 }
    );
  }
}