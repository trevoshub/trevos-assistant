"use client";

import { useEffect, useState } from "react";

type Message = {
  id: number;
  conversationId: number;
  sender: string;
  content: string;
  createdAt: string;
};

type Conversation = {
  id: number;
  assistantId: number;
  visitorName: string | null;
  visitorEmail: string | null;
  visitorPhone: string | null;
  startedAt: string;
  updatedAt: string;
  messages: Message[];
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/conversations");

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Unable to load conversations."
        );
        return;
      }

      const loadedConversations =
        data.conversations || [];

      setConversations(loadedConversations);

      const params = new URLSearchParams(
        window.location.search
      );

      const conversationId = Number(
        params.get("conversationId")
      );

      if (conversationId) {
        const matchingConversation =
          loadedConversations.find(
            (conversation: Conversation) =>
              conversation.id === conversationId
          );

        if (matchingConversation) {
          setSelectedConversation(matchingConversation);
        }
      }
    } catch (error) {
      console.error(error);
      setError("Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  }

  function selectConversation(
    conversation: Conversation
  ) {
    setSelectedConversation(conversation);

    const params = new URLSearchParams(
      window.location.search
    );

    params.set(
      "conversationId",
      String(conversation.id)
    );

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Conversations
          </h1>

          <p className="mt-2 text-gray-600">
            View conversations between visitors and your
            Trevos Assistant.
          </p>
        </div>

        {loading && (
          <div className="rounded-lg border bg-white p-6">
            <p className="text-gray-600">
              Loading conversations...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          conversations.length === 0 && (
            <div className="rounded-lg border bg-white p-8 text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                No conversations yet
              </h2>

              <p className="mt-2 text-gray-600">
                Conversations will appear here when visitors
                interact with your assistant.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          conversations.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="overflow-hidden rounded-lg border bg-white lg:col-span-1">
                <div className="border-b p-4">
                  <h2 className="font-semibold text-gray-900">
                    Conversations
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {conversations.length} conversation
                    {conversations.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        selectConversation(conversation)
                      }
                      className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                        selectedConversation?.id ===
                        conversation.id
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {conversation.visitorName ||
                              "Anonymous Visitor"}
                          </p>

                          {conversation.visitorEmail && (
                            <p className="mt-1 truncate text-sm text-gray-500">
                              {
                                conversation.visitorEmail
                              }
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {conversation.messages.length}{" "}
                          {conversation.messages.length ===
                          1
                            ? "message"
                            : "messages"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(
                          conversation.updatedAt
                        )}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border bg-white lg:col-span-2">
                {!selectedConversation ? (
                  <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Select a conversation
                      </h2>

                      <p className="mt-2 text-gray-600">
                        Select a conversation from the list
                        to view its messages.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="border-b p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {selectedConversation.visitorName ||
                              "Anonymous Visitor"}
                          </h2>

                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            {selectedConversation.visitorEmail && (
                              <p>
                                Email:{" "}
                                {
                                  selectedConversation.visitorEmail
                                }
                              </p>
                            )}

                            {selectedConversation.visitorPhone && (
                              <p>
                                Phone:{" "}
                                {
                                  selectedConversation.visitorPhone
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-sm text-gray-500">
                          Started{" "}
                          {formatDate(
                            selectedConversation.startedAt
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[600px] space-y-4 overflow-y-auto p-6">
                      {selectedConversation.messages.map(
                        (message) => {
                          const isVisitor =
                            message.sender === "visitor";

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isVisitor
                                  ? "justify-start"
                                  : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                                  isVisitor
                                    ? "bg-gray-100 text-gray-900"
                                    : "bg-black text-white"
                                }`}
                              >
                                <div className="mb-1 text-xs font-semibold opacity-70">
                                  {isVisitor
                                    ? "Visitor"
                                    : "Assistant"}
                                </div>

                                <p className="whitespace-pre-wrap text-sm">
                                  {message.content}
                                </p>

                                <p className="mt-2 text-xs opacity-60">
                                  {formatDate(
                                    message.createdAt
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
      </div>
    </main>
  );
}