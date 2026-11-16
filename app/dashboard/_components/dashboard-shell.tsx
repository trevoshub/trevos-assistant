
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

type Props = {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
    role: string;
  };
  companyName?: string | null;
};

const superLinks = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/dashboard/companies", label: "Companies", icon: "▦" },
  { href: "/dashboard/company-admins", label: "Company Admins", icon: "♙" },
];

const companyLinks = [
  { href: "/dashboard", label: "Overview", icon: "⌂" },
  { href: "/dashboard/leads", label: "Leads", icon: "◎" },
  { href: "/dashboard/conversations", label: "Conversations", icon: "☷" },
  { href: "/dashboard/assistant", label: "AI Assistant", icon: "✳" },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: "▤" },
];

export default function DashboardShell({
  children,
  user,
  companyName,
}: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isSuper = user.role === "SUPER_ADMIN";
  const links = isSuper ? superLinks : companyLinks;
  const title = isSuper
    ? "Platform Control"
    : companyName || "Workspace";

  async function handleSignOut() {
    if (signingOut) return;

    setSigningOut(true);

    try {
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign out failed:", error);
      setSigningOut(false);
    }
  }

  return (
    <div className="ta-shell">
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          className="ta-mobile-scrim"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`ta-sidebar ${
          mobileOpen ? "ta-sidebar-open" : ""
        }`}
      >
        <div className="ta-brand">
          <Image
            src="/trevos-mark.png"
            alt="Trevos"
            width={38}
            height={38}
            className="ta-brand-mark"
          />

          <div>
            <strong>Trevos Assistant</strong>
            <span>Management console</span>
          </div>

          <button
            className="ta-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="ta-workspace">
          <span className="ta-workspace-dot" />

          <div>
            <small>
              {isSuper ? "SUPER ADMIN" : "COMPANY WORKSPACE"}
            </small>
            <strong>{title}</strong>
          </div>
        </div>

        <nav className="ta-nav" aria-label="Main navigation">
          <p className="ta-nav-label">WORKSPACE</p>

          {links.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`ta-nav-link ${
                  active ? "active" : ""
                }`}
              >
                <span className="ta-nav-icon">
                  {item.icon}
                </span>

                <span>{item.label}</span>

                {active && <i />}
              </Link>
            );
          })}
        </nav>

        <div className="ta-sidebar-bottom">
          <div className="ta-help-card">
            <span className="ta-help-icon">?</span>
            <strong>Need assistance?</strong>

            <p>
              Contact Trevos Hub support for help with your
              workspace.
            </p>

            <a
              href="https://trevoslimited.com"
              target="_blank"
              rel="noreferrer"
            >
              Visit Trevos Hub ↗
            </a>
          </div>

          <div className="ta-user-card">
            <div className="ta-avatar">
              {(user.name || user.email)
                .slice(0, 1)
                .toUpperCase()}
            </div>

            <div className="ta-user-copy">
              <strong>{user.name || "Account user"}</strong>
              <span>{user.email}</span>
            </div>

            <button
              title="Sign out"
              aria-label="Sign out"
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="ta-signout"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      <section className="ta-main">
        <header className="ta-topbar">
          <button
            className="ta-menu-button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            type="button"
          >
            ☰
          </button>

          <div className="ta-breadcrumb">
            <span>Trevos Assistant</span>
            <b>/</b>
            <strong>
              {isSuper ? "Platform" : "Workspace"}
            </strong>
          </div>

          <div className="ta-topbar-right">
            <span className="ta-live-dot" />
            <span className="ta-system-label">
              System operational
            </span>

            <div className="ta-top-avatar">
              {(user.name || user.email)
                .slice(0, 1)
                .toUpperCase()}
            </div>

            <button
              type="button"
              className="ta-top-signout"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              <span>↪</span>
              {signingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </header>

        <div className="ta-content">
          {children}
        </div>

        <footer className="ta-footer">
          © {new Date().getFullYear()} Trevos Hub &amp;
          Services Limited
          <span>Trevos Assistant</span>
        </footer>
      </section>
    </div>
  );
}
