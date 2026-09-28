import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
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

    if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company not assigned." },
        { status: 400 }
      );
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ assistant });
  } catch (error) {
    console.error("Get assistant error:", error);

    return NextResponse.json(
      { error: "Unable to load assistant." },
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

    if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company not assigned." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    if (!name) {
      return NextResponse.json(
        { error: "Assistant name is required." },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found." },
        { status: 404 }
      );
    }

    const existingAssistant = await prisma.assistant.findFirst({
      where: {
        companyId,
      },
    });

    if (existingAssistant) {
      return NextResponse.json(
        {
          error: "Your company already has an assistant.",
          assistant: existingAssistant,
        },
        { status: 409 }
      );
    }

    const assistant = await prisma.assistant.create({
      data: {
        companyId,
        name,
      },
    });

    return NextResponse.json(
      {
        message: "Assistant created successfully.",
        assistant,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create assistant error:", error);

    return NextResponse.json(
      { error: "Unable to create assistant." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "COMPANY_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const companyId = session.user.companyId;

    if (!companyId) {
      return NextResponse.json(
        { error: "Company not assigned." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const assistantId = Number(body.assistantId);

    if (!assistantId) {
      return NextResponse.json(
        { error: "Assistant ID is required." },
        { status: 400 }
      );
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        id: assistantId,
        companyId,
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found." },
        { status: 404 }
      );
    }

    const data: {
      welcomeMessage?: string | null;
      systemPrompt?: string | null;

      leadCaptureEnabled?: boolean;
      collectName?: boolean;
      collectEmail?: boolean;
      collectPhone?: boolean;
      collectInterest?: boolean;
      leadCaptureMessage?: string | null;

      notificationsEnabled?: boolean;
      emailNotificationsEnabled?: boolean;
      notificationEmail?: string | null;
      whatsappNotificationsEnabled?: boolean;
      notificationWhatsapp?: string | null;
      notificationMessage?: string | null;
    } = {};

    if (typeof body.welcomeMessage === "string") {
      data.welcomeMessage =
        body.welcomeMessage.trim() || null;
    }

    if (typeof body.systemPrompt === "string") {
      data.systemPrompt =
        body.systemPrompt.trim() || null;
    }

    if (typeof body.leadCaptureEnabled === "boolean") {
      data.leadCaptureEnabled = body.leadCaptureEnabled;
    }

    if (typeof body.collectName === "boolean") {
      data.collectName = body.collectName;
    }

    if (typeof body.collectEmail === "boolean") {
      data.collectEmail = body.collectEmail;
    }

    if (typeof body.collectPhone === "boolean") {
      data.collectPhone = body.collectPhone;
    }

    if (typeof body.collectInterest === "boolean") {
      data.collectInterest = body.collectInterest;
    }

    if (typeof body.leadCaptureMessage === "string") {
      data.leadCaptureMessage =
        body.leadCaptureMessage.trim() || null;
    }

    if (typeof body.notificationsEnabled === "boolean") {
      data.notificationsEnabled =
        body.notificationsEnabled;
    }

    if (
      typeof body.emailNotificationsEnabled === "boolean"
    ) {
      data.emailNotificationsEnabled =
        body.emailNotificationsEnabled;
    }

    if (typeof body.notificationEmail === "string") {
      data.notificationEmail =
        body.notificationEmail.trim() || null;
    }

    if (
      typeof body.whatsappNotificationsEnabled ===
      "boolean"
    ) {
      data.whatsappNotificationsEnabled =
        body.whatsappNotificationsEnabled;
    }

    if (typeof body.notificationWhatsapp === "string") {
      data.notificationWhatsapp =
        body.notificationWhatsapp.trim() || null;
    }

    if (typeof body.notificationMessage === "string") {
      data.notificationMessage =
        body.notificationMessage.trim() || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        {
          error:
            "No valid assistant settings were provided.",
        },
        { status: 400 }
      );
    }

    const updatedAssistant =
      await prisma.assistant.update({
        where: {
          id: assistant.id,
        },
        data,
      });

    return NextResponse.json({
      message: "Assistant updated successfully.",
      assistant: updatedAssistant,
    });
  } catch (error) {
    console.error("Update assistant error:", error);

    return NextResponse.json(
      { error: "Unable to update assistant." },
      { status: 500 }
    );
  }
}