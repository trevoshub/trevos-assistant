import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  const companyId = session.user.companyId;

  if (role === "SUPER_ADMIN") {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">
              Super Admin Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome, {session.user.name || session.user.email}.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <a
                href="/dashboard/companies"
                className="rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  Companies
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Create and manage companies using Trevos Assistant.
                </p>
              </a>

              <a
                href="/dashboard/company-admins"
                className="rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
              >
                <h2 className="text-lg font-semibold text-slate-900">
                  Company Admins
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Create and manage administrators for each company.
                </p>
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (role === "COMPANY_ADMIN") {
    if (!companyId) {
      return (
        <main className="min-h-screen bg-slate-100 px-6 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">
                Company Not Assigned
              </h1>

              <p className="mt-2 text-slate-600">
                Your account is not currently assigned to a company.
              </p>
            </div>
          </div>
        </main>
      );
    }

    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    if (!company) {
      return (
        <main className="min-h-screen bg-slate-100 px-6 py-10">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-slate-900">
                Company Not Found
              </h1>

              <p className="mt-2 text-slate-600">
                The company assigned to your account could not be found.
              </p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">
              Company Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome, {session.user.name || session.user.email}.
            </p>

            <div className="mt-8 rounded-xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Company</p>

              <p className="mt-1 text-xl font-semibold text-slate-900">
                {company.name}
              </p>

              <div className="mt-4">
                <p className="text-sm text-slate-500">
                  Company Status
                </p>

                <span className="mt-1 inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  {company.status}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <a
                href="/dashboard/assistant"
                className="rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
              >
                <h2 className="font-semibold text-slate-900">
                  AI Assistant
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Manage your company&apos;s AI assistant.
                </p>
              </a>

              <a
                href="/dashboard/leads"
                className="rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
              >
                <h2 className="font-semibold text-slate-900">
                  Leads
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  View and manage leads captured by your assistant.
                </p>
              </a>

              <a
                href="/dashboard/conversations"
                className="rounded-xl border border-slate-200 p-6 transition hover:border-slate-400 hover:shadow-sm"
              >
                <h2 className="font-semibold text-slate-900">
                  Conversations
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Review conversations between customers and your assistant.
                </p>
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (role === "STAFF") {
    return (
      <main className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-slate-900">
              Staff Dashboard
            </h1>

            <p className="mt-2 text-slate-600">
              Welcome, {session.user.name || session.user.email}.
            </p>

            <div className="mt-8 rounded-xl bg-slate-50 p-6">
              <p className="text-sm text-slate-500">Role</p>

              <p className="mt-1 font-semibold text-slate-900">
                STAFF
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  redirect("/login");
}