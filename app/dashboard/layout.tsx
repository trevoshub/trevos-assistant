import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardShell from "./_components/dashboard-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  let companyName: string | null = null;
  if (session.user.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: { name: true, status: true },
    });
    companyName = company?.name ?? null;
    if (company?.status === "SUSPENDED") {
      return <main className="ta-suspended"><section><span className="ta-lock">!</span><h1>Workspace suspended</h1><p>Your company workspace is currently suspended. Please contact your platform administrator.</p><a href="mailto:support@trevoslimited.com">Contact support: support@trevoslimited.com</a></section></main>;
    }
  }

  return <DashboardShell user={{ name: session.user.name ?? null, email: session.user.email ?? "", role: session.user.role }} companyName={companyName}>{children}</DashboardShell>;
}
