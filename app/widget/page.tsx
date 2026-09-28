"use client";

import { useEffect, useState } from "react";

type Assistant = {
  name: string;
  welcomeMessage: string | null;
  leadCaptureEnabled: boolean;
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  collectInterest: boolean;
  leadCaptureMessage: string | null;
};

type ChatMessage = {
  sender: "assistant" | "visitor";
  content: string;
};

export default function WidgetPage() {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);

  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorInterest, setVisitorInterest] = useState("");

  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("apiKey");

    if (key === null) {
      setError("Public API key is missing.");
      setLoading(false);
      return;
    }

    const validApiKey: string = key;

    setApiKey(validApiKey);

    async function loadAssistant() {
      try {
        const response = await fetch(
          `/api/public/assistant?apiKey=${encodeURIComponent(validApiKey)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load assistant.");
        }

        const loadedAssistant = data.assistant;

        setAssistant(loadedAssistant);

        if (loadedAssistant.welcomeMessage) {
          setMessages([
            {
              sender: "assistant",
              content: loadedAssistant.welcomeMessage,
            },
          ]);
        }
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load assistant."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssistant();
  }, []);

  async function createConversation() {
    const response = await fetch("/api/public/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-trevos-api-key": apiKey,
      },
      body: JSON.stringify({
        action: "create",
        visitorName: visitorName.trim() || null,
        visitorEmail: visitorEmail.trim() || null,
        visitorPhone: visitorPhone.trim() || null,
        interest: visitorInterest.trim() || null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Unable to start conversation."
      );
    }

    setConversationId(data.conversation.id);

    if (data.lead) {
      setLeadSubmitted(true);
      setShowLeadForm(false);
    }

    return data.conversation.id;
  }

  async function submitLead() {
    if (!assistant || submittingLead) {
      return;
    }

    if (!conversationId) {
      setError("No active conversation was found.");
      return;
    }

    if (assistant.collectName && !visitorName.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (assistant.collectEmail && !visitorEmail.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (assistant.collectPhone && !visitorPhone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    if (assistant.collectInterest && !visitorInterest.trim()) {
      setError("Please tell us what you're interested in.");
      return;
    }

    setSubmittingLead(true);
    setError("");

    try {
      const response = await fetch("/api/public/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-trevos-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "submitLead",
          conversationId,
          visitorName: visitorName.trim(),
          visitorEmail: visitorEmail.trim() || null,
          visitorPhone: visitorPhone.trim() || null,
          interest: visitorInterest.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to submit your details."
        );
      }

      setLeadSubmitted(true);
      setShowLeadForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your details."
      );
    } finally {
      setSubmittingLead(false);
    }
  }

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || sending || !apiKey) {
      return;
    }

    setSending(true);
    setError("");

    try {
      let activeConversationId = conversationId;

      if (!activeConversationId) {
        activeConversationId = await createConversation();
      }

      const response = await fetch("/api/public/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-trevos-api-key": apiKey,
        },
        body: JSON.stringify({
          action: "message",
          conversationId: activeConversationId,
          content: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to send message."
        );
      }

      setMessages((current) => [
        ...current,
        {
          sender: "visitor",
          content: data.visitorMessage.content,
        },
        {
          sender: "assistant",
          content: data.message.content,
        },
      ]);

      setMessage("");

      if (data.leadCapture === true && assistant?.leadCaptureEnabled) {
        setShowLeadForm(true);
      }
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white px-6 py-5 shadow">
          Loading assistant...
        </div>
      </main>
    );
  }

  if (!assistant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white px-6 py-5 text-red-600 shadow">
          {error || "Unable to load assistant."}
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <section className="flex h-[650px] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <header className="bg-gray-900 px-5 py-4 text-white">
          <h1 className="text-lg font-semibold">
            {assistant.name}
          </h1>

          <p className="text-sm text-gray-300">
            We&apos;re here to help.
          </p>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
          {messages.map((item, index) => (
            <div
              key={index}
              className={`flex ${
                item.sender === "visitor"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  item.sender === "visitor"
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-800 shadow-sm"
                }`}
              >
                {item.content}
              </div>
            </div>
          ))}

          {assistant.leadCaptureEnabled &&
            !leadSubmitted &&
            showLeadForm && (
              <div className="rounded-xl bg-white p-4 shadow-sm">
                <p className="mb-4 text-sm font-medium text-gray-800">
                  {assistant.leadCaptureMessage ||
                    "Please provide your details and we'll get back to you."}
                </p>

                <div className="space-y-3">
                  {assistant.collectName && (
                    <input
                      type="text"
                      value={visitorName}
                      onChange={(event) =>
                        setVisitorName(event.target.value)
                      }
                      placeholder="Your name"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  )}

                  {assistant.collectEmail && (
                    <input
                      type="email"
                      value={visitorEmail}
                      onChange={(event) =>
                        setVisitorEmail(event.target.value)
                      }
                      placeholder="Your email"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  )}

                  {assistant.collectPhone && (
                    <input
                      type="tel"
                      value={visitorPhone}
                      onChange={(event) =>
                        setVisitorPhone(event.target.value)
                      }
                      placeholder="Your phone number"
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  )}

                  {assistant.collectInterest && (
                    <textarea
                      value={visitorInterest}
                      onChange={(event) =>
                        setVisitorInterest(event.target.value)
                      }
                      placeholder="What are you interested in?"
                      rows={3}
                      className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                    />
                  )}

                  <button
                    type="button"
                    onClick={submitLead}
                    disabled={submittingLead}
                    className="w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submittingLead
                      ? "Submitting..."
                      : "Submit Details"}
                  </button>
                </div>
              </div>
            )}

          {leadSubmitted && (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
              Thanks! Your details have been received. Our team will
              get back to you shortly.
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="border-t bg-white p-3">
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              disabled={sending}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-300 disabled:bg-gray-100"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !message.trim()}
              className="rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}