
"use client";

import { useCallback, useEffect, useState } from "react";

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
  messageCount: number;
};

type ConversationDetails = Omit<
  Conversation,
  "messageCount"
> & {
  messages: Message[];
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleString();

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
      });

      const response = await fetch(
        `/api/conversations?${params.toString()}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load conversations."
        );
      }

      setConversations(data.conversations || []);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversations."
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const loadConversationDetails = async (id: number) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response = await fetch(
        `/api/conversations?conversationId=${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to load conversation."
        );
      }

      setSelectedConversation(data.conversation);

      const params = new URLSearchParams(
        window.location.search
      );

      params.set("conversationId", String(id));

      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load conversation."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // Support links from Leads, including conversations on another page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const conversationId = Number(params.get("conversationId"));

    if (!conversationId || !Number.isInteger(conversationId)) {
      return;
    }

    loadConversationDetails(conversationId);
  }, []);

  const firstItem =
    pagination.total === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;

  const lastItem = Math.min(
    pagination.page * pagination.pageSize,
    pagination.total
  );

  const pageNumbers = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1
  ).filter(
    (number) =>
      number === 1 ||
      number === pagination.totalPages ||
      Math.abs(number - page) <= 1
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Conversations
            </h1>

            <p className="mt-2 text-gray-600">
              View conversations between visitors and your
              Trevos Assistant.
            </p>
          </div>

          <button
            type="button"
            onClick={loadConversations}
            disabled={loading}
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 rounded-lg border bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900">
                Conversation directory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Showing {firstItem}–{lastItem} of{" "}
                {pagination.total} conversations
              </p>
            </div>

            <div className="w-full sm:w-80">
              <input
                type="search"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search visitor name, email or phone..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-white p-6">
            <p className="text-gray-600">
              Loading conversations...
            </p>
          </div>
        ) : pagination.total === 0 ? (
          <div className="rounded-lg border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No conversations found
            </h2>

            <p className="mt-2 text-gray-600">
              Conversations will appear here when visitors
              interact with your assistant.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="overflow-hidden rounded-lg border bg-white lg:col-span-1">
                <div className="border-b p-4">
                  <h2 className="font-semibold text-gray-900">
                    Conversations
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {pagination.total} conversation
                    {pagination.total === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="divide-y">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() =>
                        loadConversationDetails(conversation.id)
                      }
                      className={`w-full p-4 text-left transition hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id
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
                              {conversation.visitorEmail}
                            </p>
                          )}

                          {conversation.visitorPhone && (
                            <p className="mt-1 truncate text-sm text-gray-500">
                              {conversation.visitorPhone}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          {conversation.messageCount}{" "}
                          {conversation.messageCount === 1
                            ? "message"
                            : "messages"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-400">
                        {formatDate(conversation.updatedAt)}
                      </p>
                    </button>
                  ))}
                </div>

                {pagination.totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4">
                    <span className="text-xs text-gray-500">
                      Page {pagination.page} of{" "}
                      {pagination.totalPages}
                    </span>

                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        disabled={page <= 1 || loading}
                        onClick={() =>
                          setPage((current) => current - 1)
                        }
                        className="rounded border px-3 py-2 text-xs disabled:opacity-40"
                      >
                        Previous
                      </button>

                      {pageNumbers.map((number, index) => {
                        const previous = pageNumbers[index - 1];

                        return (
                          <span
                            key={number}
                            className="flex items-center gap-1"
                          >
                            {previous &&
                              number - previous > 1 && (
                                <span className="px-1 text-gray-400">
                                  …
                                </span>
                              )}

                            <button
                              type="button"
                              disabled={loading}
                              onClick={() => setPage(number)}
                              className={`rounded border px-3 py-2 text-xs ${
                                number === page
                                  ? "border-gray-900 bg-gray-900 text-white"
                                  : "bg-white text-gray-700"
                              }`}
                            >
                              {number}
                            </button>
                          </span>
                        );
                      })}

                      <button
                        type="button"
                        disabled={
                          page >= pagination.totalPages || loading
                        }
                        onClick={() =>
                          setPage((current) => current + 1)
                        }
                        className="rounded border px-3 py-2 text-xs disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>

              <section className="rounded-lg border bg-white lg:col-span-2">
                {detailsLoading ? (
                  <div className="flex min-h-[400px] items-center justify-center p-8">
                    <p className="text-gray-600">
                      Loading conversation history...
                    </p>
                  </div>
                ) : !selectedConversation ? (
                  <div className="flex min-h-[400px] items-center justify-center p-8 text-center">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Select a conversation
                      </h2>

                      <p className="mt-2 text-gray-600">
                        Select a conversation from the list to view
                        its messages.
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
                                {selectedConversation.visitorEmail}
                              </p>
                            )}

                            {selectedConversation.visitorPhone && (
                              <p>
                                Phone:{" "}
                                {selectedConversation.visitorPhone}
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
                      {selectedConversation.messages.length === 0 ? (
                        <p className="text-center text-sm text-gray-500">
                          No messages in this conversation yet.
                        </p>
                      ) : (
                        selectedConversation.messages.map((message) => {
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
                                  {isVisitor ? "Visitor" : "Assistant"}
                                </div>

                                <p className="whitespace-pre-wrap text-sm">
                                  {message.content}
                                </p>

                                <p className="mt-2 text-xs opacity-60">
                                  {formatDate(message.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
