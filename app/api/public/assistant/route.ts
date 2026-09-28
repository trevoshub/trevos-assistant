import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const publicApiKey = searchParams.get("apiKey");

    if (!publicApiKey) {
      return NextResponse.json(
        { error: "Public API key is required." },
        { status: 400 }
      );
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        publicApiKey,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        status: true,
        welcomeMessage: true,
        leadCaptureEnabled: true,
        collectName: true,
        collectEmail: true,
        collectPhone: true,
        collectInterest: true,
        leadCaptureMessage: true,
      },
    });

    if (!assistant) {
      return NextResponse.json(
        { error: "Assistant not found or inactive." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      assistant,
    });
  } catch (error) {
    console.error("Public assistant error:", error);

    return NextResponse.json(
      { error: "Unable to load assistant." },
      { status: 500 }
    );
  }
}