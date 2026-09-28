import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const companies = await prisma.company.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            users: true,
            assistants: true,
          },
        },
      },
    });

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Get companies error:", error);

    return NextResponse.json(
      { error: "Unable to load companies." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
      },
    });

    return NextResponse.json(
      {
        message: "Company created successfully.",
        company,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create company error:", error);

    return NextResponse.json(
      { error: "Unable to create company." },
      { status: 500 }
    );
  }
}