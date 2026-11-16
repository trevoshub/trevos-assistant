
"use client";

import { useCallback, useEffect, useState } from "react";

type Status =
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
  status: Status;
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

type LeadStats = {
  total: number;
  new: number;
  inProgress: number;
  converted: number;
};

type Pagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const statuses: Status[] = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "CONVERTED",
  "LOST",
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState<LeadStats>({
    total: 0,
    new: 0,
    inProgress: 0,
    converted: 0,
  });

  const [updating, setUpdating] = useState<number | null>(null);
  const [selected, setSelected] = useState<Lead | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        status: filter,
      });

      const response = await fetch(`/api/leads?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load leads.");
      }

      setLeads(data.leads || []);
      setPagination(data.pagination);
      setStats(data.stats);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load leads."
      );
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: number, status: Status) {
    setUpdating(id);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: id,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to update lead."
        );
      }

      setSelected((old) =>
        old?.id === id
          ? { ...old, status, updatedAt: data.lead.updatedAt }
          : old
      );

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update lead."
      );
    } finally {
      setUpdating(null);
    }
  }

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
    <div className="ta-page">
      <div className="ta-page-heading">
        <div>
          <p className="ta-eyebrow">CUSTOMER PIPELINE</p>
          <h1>Leads</h1>
          <p>
            Review prospects captured by your AI assistant and track
            their progress.
          </p>
        </div>

        <button
          className="ta-button secondary"
          onClick={load}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="ta-stats-grid ta-stats-compact">
        <div className="ta-stat-card">
          <div className="ta-stat-top">
            <span>Total leads</span>
            <i>◉</i>
          </div>
          <strong>{stats.total}</strong>
          <small>All captured prospects</small>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-top">
            <span>New</span>
            <i>✦</i>
          </div>
          <strong>{stats.new}</strong>
          <small>Awaiting first contact</small>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-top">
            <span>In progress</span>
            <i>↗</i>
          </div>
          <strong>{stats.inProgress}</strong>
          <small>Contacted or qualified</small>
        </div>

        <div className="ta-stat-card">
          <div className="ta-stat-top">
            <span>Converted</span>
            <i>✓</i>
          </div>
          <strong>{stats.converted}</strong>
          <small>Successful conversions</small>
        </div>
      </div>

      {error && <div className="ta-alert error">{error}</div>}

      <section className="ta-panel">
        <div className="ta-panel-heading">
          <div>
            <h2>Prospect directory</h2>
            <p>
              Showing {firstItem}–{lastItem} of {pagination.total} leads
            </p>
          </div>
        </div>

        <div className="ta-toolbar">
          <div className="ta-search">
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone or interest…"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="ALL">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="ta-empty">Loading leads…</div>
        ) : leads.length === 0 ? (
          <div className="ta-empty">
            <strong>No matching leads</strong>
            <span>Try changing your search or filters.</span>
          </div>
        ) : (
          <>
            <div className="ta-table-wrap">
              <table className="ta-table">
                <thead>
                  <tr>
                    <th>Prospect</th>
                    <th>Contact details</th>
                    <th>Interest</th>
                    <th>Lead status</th>
                    <th>Captured</th>
                    <th>Conversation</th>
                  </tr>
                </thead>

                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <button
                          className="ta-text-link"
                          onClick={() => setSelected(lead)}
                        >
                          <strong>{lead.name}</strong>
                          <small>Lead #{lead.id}</small>
                        </button>
                      </td>

                      <td>
                        <span>{lead.email || "No email"}</span>
                        <small>{lead.phone || "No phone"}</small>
                      </td>

                      <td className="ta-interest">
                        {lead.interest || "Not provided"}
                      </td>

                      <td>
                        <select
                          className="ta-status-select"
                          value={lead.status}
                          disabled={updating === lead.id}
                          onChange={(event) =>
                            updateStatus(
                              lead.id,
                              event.target.value as Status
                            )
                          }
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>

                      <td>
                        {lead.conversationId ? (
                          <a
                            className="ta-inline-link"
                            href={`/dashboard/conversations?conversationId=${lead.conversationId}`}
                          >
                            View chat ↗
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  padding: "18px 4px 4px",
                }}
              >
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  <button
                    className="ta-button secondary"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                  >
                    Previous
                  </button>

                  {pageNumbers.map((number, index) => {
                    const previous = pageNumbers[index - 1];

                    return (
                      <span
                        key={number}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        {previous && number - previous > 1 && (
                          <span style={{ color: "#64748b" }}>…</span>
                        )}

                        <button
                          className={
                            number === page
                              ? "ta-button primary"
                              : "ta-button secondary"
                          }
                          disabled={loading}
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </button>
                      </span>
                    );
                  })}

                  <button
                    className="ta-button secondary"
                    disabled={
                      page >= pagination.totalPages || loading
                    }
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selected && (
        <div className="ta-modal-backdrop">
          <section
            className="ta-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              className="ta-modal-close"
              onClick={() => setSelected(null)}
            >
              ×
            </button>

            <p className="ta-eyebrow">
              LEAD PROFILE · #{selected.id}
            </p>

            <h2>{selected.name}</h2>

            <p className="ta-modal-sub">
              {selected.email || "No email"} ·{" "}
              {selected.phone || "No phone"}
            </p>

            <div className="ta-detail-list">
              <div>
                <span>Interest</span>
                <strong>
                  {selected.interest || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selected.status}</strong>
              </div>

              <div>
                <span>Captured</span>
                <strong>
                  {new Date(selected.createdAt).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Conversation</span>
                <strong>
                  {selected.conversationId
                    ? `#${selected.conversationId}`
                    : "Not linked"}
                </strong>
              </div>
            </div>

            {selected.conversationId && (
              <a
                className="ta-button primary ta-full-button"
                href={`/dashboard/conversations?conversationId=${selected.conversationId}`}
              >
                Open conversation
              </a>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
