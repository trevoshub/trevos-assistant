import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function StatCard({ label, value, note, icon }: { label: string; value: number; note: string; icon: string }) {
  return <article className="ta-stat-card"><div className="ta-stat-top"><span>{label}</span><i>{icon}</i></div><strong>{value.toLocaleString()}</strong><small>{note}</small></article>;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = session.user.role;
  if (role === "SUPER_ADMIN") {
    const [companies, admins, assistants, leads, conversations] = await Promise.all([
      prisma.company.count(), prisma.user.count({ where: { role: "COMPANY_ADMIN" } }),
      prisma.assistant.count(), prisma.lead.count(), prisma.conversation.count(),
    ]);
    const latestCompanies = await prisma.company.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { _count: { select: { users: true, assistants: true } } } });
    return <div className="ta-page">
      <div className="ta-page-heading"><div><p className="ta-eyebrow">PLATFORM OVERVIEW</p><h1>Good to see you, {session.user.name?.split(" ")[0] || "Admin"}</h1><p>Here&apos;s what is happening across your Trevos Assistant platform.</p></div><span className="ta-date-pill">● Platform overview</span></div>
      <div className="ta-stats-grid">
        <StatCard label="Companies" value={companies} note="Registered workspaces" icon="▦" />
        <StatCard label="Company admins" value={admins} note="Administrator accounts" icon="♙" />
        <StatCard label="AI assistants" value={assistants} note="Configured assistants" icon="✳" />
        <StatCard label="Captured leads" value={leads} note="Across all companies" icon="◎" />
      </div>
      <div className="ta-two-col">
        <section className="ta-panel"><div className="ta-panel-heading"><div><h2>Recently added companies</h2><p>Latest workspaces on the platform</p></div><Link href="/dashboard/companies">View all ↗</Link></div>
          {latestCompanies.length ? <div className="ta-table-wrap"><table className="ta-table"><thead><tr><th>Company</th><th>Users</th><th>Assistants</th><th>Status</th></tr></thead><tbody>{latestCompanies.map(c=><tr key={c.id}><td><strong>{c.name}</strong><small>Added {new Date(c.createdAt).toLocaleDateString()}</small></td><td>{c._count.users}</td><td>{c._count.assistants}</td><td><span className={`ta-status ${c.status==="ACTIVE"?"good":"muted"}`}>{c.status}</span></td></tr>)}</tbody></table></div> : <div className="ta-empty">No companies have been created yet.</div>}
        </section>
        <section className="ta-panel ta-platform-card"><div className="ta-platform-symbol">✳</div><p className="ta-eyebrow">TREVOS PLATFORM</p><h2>Manage your AI business ecosystem.</h2><p>Manage customer workspaces, administrator access and platform activity from one place.</p><div className="ta-quick-links"><Link href="/dashboard/companies">＋ Add a company</Link><Link href="/dashboard/company-admins">＋ Create company admin</Link></div><div className="ta-mini-metrics"><div><strong>{conversations}</strong><span>Conversations</span></div><div><strong>{leads}</strong><span>Leads captured</span></div></div></section>
      </div>
    </div>;
  }
  if (role === "COMPANY_ADMIN" && session.user.companyId) {
    const companyId = session.user.companyId;
    const assistants = await prisma.assistant.findMany({ where: { companyId }, select: { id: true, name: true, status: true, monthlyMessageUsed: true, monthlyMessageLimit: true } });
    const assistantIds = assistants.map(a=>a.id);
    const [leadCount, newLeads, conversationCount, recentLeads] = await Promise.all([
      prisma.lead.count({ where: { assistantId: { in: assistantIds } } }),
      prisma.lead.count({ where: { assistantId: { in: assistantIds }, status: "NEW" } }),
      prisma.conversation.count({ where: { assistantId: { in: assistantIds } } }),
      prisma.lead.findMany({ where: { assistantId: { in: assistantIds } }, take: 5, orderBy: { createdAt: "desc" } }),
    ]);
    return <div className="ta-page"><div className="ta-page-heading"><div><p className="ta-eyebrow">COMPANY WORKSPACE</p><h1>Welcome back, {session.user.name?.split(" ")[0] || "there"}</h1><p>Here&apos;s a snapshot of your customer engagement.</p></div><span className="ta-date-pill">● Workspace active</span></div>
      <div className="ta-stats-grid"><StatCard label="Total leads" value={leadCount} note="Captured prospects" icon="◎"/><StatCard label="New leads" value={newLeads} note="Awaiting follow-up" icon="✦"/><StatCard label="Conversations" value={conversationCount} note="Visitor interactions" icon="☷"/><StatCard label="AI assistants" value={assistants.length} note="Your configured assistants" icon="✳"/></div>
      <div className="ta-two-col"><section className="ta-panel"><div className="ta-panel-heading"><div><h2>Recent leads</h2><p>Your latest captured prospects</p></div><Link href="/dashboard/leads">View all ↗</Link></div>{recentLeads.length?<div className="ta-table-wrap"><table className="ta-table"><thead><tr><th>Prospect</th><th>Interest</th><th>Status</th><th>Date</th></tr></thead><tbody>{recentLeads.map(l=><tr key={l.id}><td><strong>{l.name}</strong><small>{l.email || l.phone || "No contact details"}</small></td><td>{l.interest || "—"}</td><td><span className="ta-status info">{l.status}</span></td><td>{new Date(l.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>:<div className="ta-empty">Your captured leads will appear here.</div>}</section>
      <section className="ta-panel"><div className="ta-panel-heading"><div><h2>Workspace shortcuts</h2><p>Manage your assistant</p></div></div><div className="ta-shortcut-list"><Link href="/dashboard/assistant"><span>✳</span><div><strong>AI Assistant</strong><small>Configure behaviour and lead capture</small></div><b>→</b></Link><Link href="/dashboard/knowledge"><span>▤</span><div><strong>Knowledge base</strong><small>Manage business information</small></div><b>→</b></Link><Link href="/dashboard/conversations"><span>☷</span><div><strong>Conversations</strong><small>Review visitor conversations</small></div><b>→</b></Link></div></section></div>
    </div>;
  }
  return <div className="ta-page"><div className="ta-panel"><h1>Account workspace</h1><p>Your account is not currently assigned to a company workspace. Contact your platform administrator.</p></div></div>;
}
