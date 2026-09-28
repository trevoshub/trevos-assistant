"use client";

import { FormEvent, useEffect, useState } from "react";

type KnowledgeItem = {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function KnowledgePage() {
  const [knowledgeItems, setKnowledgeItems] = useState<
    KnowledgeItem[]
  >([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadKnowledge() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/knowledge");

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to load knowledge items."
        );
        return;
      }

      setKnowledgeItems(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load knowledge items.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKnowledge();
  }, []);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const response = await fetch("/api/knowledge", {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isEditing
            ? {
                knowledgeId: editingId,
                title: title.trim(),
                content: content.trim(),
              }
            : {
                title: title.trim(),
                content: content.trim(),
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            `Unable to ${isEditing ? "update" : "create"} knowledge item.`
        );
        return;
      }

      if (isEditing) {
        setKnowledgeItems((current) =>
          current.map((item) =>
            item.id === data.id ? data : item
          )
        );

        setSuccess("Knowledge item updated successfully.");
      } else {
        setKnowledgeItems((current) => [
          data,
          ...current,
        ]);

        setSuccess("Knowledge item added successfully.");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      setError(
        editingId !== null
          ? "Unable to update knowledge item."
          : "Unable to create knowledge item."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(item: KnowledgeItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this knowledge item? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingId(id);

    try {
      const response = await fetch("/api/knowledge", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeId: id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to delete knowledge item."
        );
        return;
      }

      setKnowledgeItems((current) =>
        current.filter((item) => item.id !== id)
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Knowledge item deleted successfully.");
    } catch (error) {
      console.error(error);
      setError("Unable to delete knowledge item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleStatus(item: KnowledgeItem) {
    setError("");
    setSuccess("");
    setTogglingId(item.id);

    try {
      const response = await fetch("/api/knowledge", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          knowledgeId: item.id,
          isActive: !item.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to update knowledge status."
        );
        return;
      }

      setKnowledgeItems((current) =>
        current.map((currentItem) =>
          currentItem.id === data.id ? data : currentItem
        )
      );

      setSuccess(
        data.isActive
          ? "Knowledge item activated successfully."
          : "Knowledge item deactivated successfully."
      );
    } catch (error) {
      console.error(error);
      setError("Unable to update knowledge status.");
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Knowledge Base
          </h1>

          <p className="mt-2 text-gray-600">
            Add information your AI Assistant can use to
            answer customer questions.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <section className="mb-10 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId !== null
                ? "Edit Knowledge"
                : "Add Knowledge"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId !== null
                ? "Update the information below."
                : "Add information about your company, services, products, policies, or frequently asked questions."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Title
              </label>

              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. About Our Company"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Content
              </label>

              <textarea
                id="content"
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder="Enter the information your AI Assistant should know..."
                rows={6}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Knowledge"
                    : "Add Knowledge"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Knowledge Items
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage the information available to your
                assistant.
              </p>
            </div>

            <div className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              {knowledgeItems.length}{" "}
              {knowledgeItems.length === 1
                ? "item"
                : "items"}
            </div>
          </div>

          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
              Loading knowledge items...
            </div>
          ) : knowledgeItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                No knowledge added yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Add your first knowledge item above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {knowledgeItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            item.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {item.content}
                      </p>

                      <p className="mt-4 text-xs text-gray-400">
                        Created{" "}
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(item)
                        }
                        disabled={
                          togglingId === item.id
                        }
                        className={`rounded-lg px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
                          item.isActive
                            ? "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                            : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {togglingId === item.id
                          ? "Updating..."
                          : item.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        disabled={
                          deletingId === item.id
                        }
                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingId === item.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}