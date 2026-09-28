"use client";

import { FormEvent, useEffect, useState } from "react";

type Company = {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  _count: {
    users: number;
    assistants: number;
  };
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadCompanies() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/companies");

      if (!response.ok) {
        throw new Error("Unable to load companies.");
      }

      const data = await response.json();
      setCompanies(data.companies ?? []);
    } catch (error) {
      console.error(error);
      setError("Unable to load companies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCompanies();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const companyName = name.trim();

    if (!companyName) {
      setError("Company name is required.");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: companyName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to create company.");
        return;
      }

      setName("");
      setSuccess("Company created successfully.");

      await loadCompanies();
    } catch (error) {
      console.error(error);
      setError("Unable to create company.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Companies
          </h1>

          <p className="mt-2 text-slate-600">
            Manage companies using Trevos Assistant.
          </p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Create Company
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-5 flex flex-col gap-4 sm:flex-row"
          >
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter company name"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Company"}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading companies...
            </div>
          ) : companies.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No companies have been created yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Company
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Users
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Assistants
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold text-slate-700">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {companies.map((company) => (
                    <tr
                      key={company.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {company.name}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            company.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {company._count.users}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {company._count.assistants}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(company.createdAt).toLocaleDateString()}
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