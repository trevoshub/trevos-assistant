"use client";

import { useEffect, useState } from "react";

type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "QUALIFIED"
  | "CONVERTED"
  | "LOST";

type Lead = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  interest: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  conversationId: number | null;
  conversation: {
    id: number;
    visitorName: string | null;
    visitorEmail: string | null;
    visitorPhone: string | null;
    startedAt: string;
  } | null;
};

const statuses: LeadStatus[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/leads");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load leads.");
      }

      setLeads(data.leads || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to load leads."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    leadId: number,
    status: LeadStatus
  ) {
    try {
      setUpdatingId(leadId);
      setError("");

      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update lead.");
      }

      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId
            ? {
                ...lead,
                status: data.lead.status,
                updatedAt: data.lead.updatedAt,
              }
            : lead
        )
      );
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Unable to update lead."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Leads
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Manage leads captured by your AI assistant.
            </p>
          </div>

          <button
            onClick={loadLeads}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Leads</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {leads.length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">New</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {leads.filter((lead) => lead.status === "NEW").length}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Contacted</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                leads.filter(
                  (lead) => lead.status === "CONTACTED"
                ).length
              }
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Converted</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {
                leads.filter(
                  (lead) => lead.status === "CONVERTED"
                ).length
              }
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading leads...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-medium text-gray-900">
                No leads yet
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Leads captured by your AI assistant will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Lead
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Interest
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Captured
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Conversation
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {lead.name}
                        </div>

                        <div className="text-xs text-gray-500">
                          Lead #{lead.id}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {lead.email || "No email"}
                        </div>

                        <div className="text-sm text-gray-500">
                          {lead.phone || "No phone"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {lead.interest || "Not provided"}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={(event) =>
                            updateStatus(
                              lead.id,
                              event.target.value as LeadStatus
                            )
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          lead.createdAt
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-4">
                        {lead.conversationId ? (
                          <a
                            href={`/dashboard/conversations?conversationId=${lead.conversationId}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            View conversation
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">
                            None
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}