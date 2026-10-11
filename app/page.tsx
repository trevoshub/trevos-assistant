
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    number: "01",
    icon: "✦",
    title: "AI-Powered Conversations",
    description:
      "Give website visitors a convenient way to ask questions and get answers based on your business information.",
  },
  {
    number: "02",
    icon: "◎",
    title: "Lead Capture",
    description:
      "Turn relevant conversations into potential business opportunities by collecting visitor contact details.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Lead Management",
    description:
      "Keep captured enquiries organised so your team can review prospects and follow up on opportunities.",
  },
  {
    number: "04",
    icon: "</>",
    title: "Easy Website Installation",
    description:
      "Configure your assistant, copy the installation code, and embed it into your existing website.",
  },
  {
    number: "05",
    icon: "⌘",
    title: "Business Knowledge",
    description:
      "Add information about your services, products, and company to help the assistant respond to visitors.",
  },
  {
    number: "06",
    icon: "✉",
    title: "Lead Notifications",
    description:
      "Configure email notifications to help your team stay informed when new customer enquiries are captured.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your assistant",
    description:
      "Configure your welcome message, instructions, and business knowledge.",
  },
  {
    number: "02",
    title: "Install it on your website",
    description:
      "Copy your unique installation code and add it to your website.",
  },
  {
    number: "03",
    title: "Engage your visitors",
    description:
      "Give visitors another way to ask questions and express interest in your business.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link
            href="/"
            aria-label="Trevos Assistant home"
            className="flex items-center gap-3"
          >
            <Image
              src="/trevos-logo.png"
              alt="Trevos Hub & Services Limited"
              width={176}
              height={58}
              priority
              className="h-10 w-auto object-contain sm:h-12"
            />
            <span className="hidden border-l border-slate-200 pl-3 text-sm font-semibold text-slate-700 sm:block">
              Assistant
            </span>
          </Link>

          <nav className="flex items-center gap-4 sm:gap-7">
            <a
              href="#features"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-red-600 sm:inline"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hidden text-sm font-medium text-slate-600 transition hover:text-red-600 sm:inline"
            >
              How It Works
            </a>
            <Link
              href="/login"
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold transition hover:border-slate-900 hover:bg-slate-50 sm:px-5"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 sm:px-5"
            >
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-white via-white to-slate-100" />
        <div className="absolute right-0 top-0 -z-10 h-80 w-80 rounded-full bg-red-100/40 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-red-700">
                Intelligent customer engagement
              </span>
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Make Every Website Visit{" "}
              <span className="text-red-600">Count.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Meet Trevos Assistant — an AI-powered customer support and lead
              management solution that helps businesses answer enquiries,
              engage website visitors, and capture potential customers.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-4 font-bold text-white shadow-lg shadow-red-600/15 transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                Get Your AI Assistant
                <span aria-hidden="true">→</span>
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-7 py-4 font-bold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50"
              >
                Discover How It Works
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <span className="font-bold text-red-600">✓</span>
                Business-configurable
              </span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-red-600">✓</span>
                Website integration
              </span>
              <span className="flex items-center gap-2">
                <span className="font-bold text-red-600">✓</span>
                Lead management
              </span>
            </div>
          </div>

          {/* Assistant preview */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-red-100/80 via-slate-100 to-slate-200/70 blur-xl" />

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              <div className="flex items-center justify-between bg-[#111827] px-5 py-5 text-white sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-xl font-bold">
                    T
                  </div>
                  <div>
                    <p className="font-bold">Trevos Assistant</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Your business, ready to engage
                    </p>
                  </div>
                </div>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-200">
                  AI Assistant
                </span>
              </div>

              <div className="space-y-5 bg-slate-50 p-5 sm:p-6">
                <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-bold text-red-600">
                    TRE​​VOS ASSISTANT
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Hello! Welcome to our website. How can we help you
                    today?
                  </p>
                </div>

                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-[#111827] p-4 text-white">
                  <p className="text-sm leading-6">
                    I would like to know more about your services.
                  </p>
                </div>

                <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-sm leading-6 text-slate-700">
                    Absolutely! I can help you explore our services and
                    connect you with our team.
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="flex-1 text-sm text-slate-400">
                    Ask us a question...
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white">
                    ↑
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-5 py-3 text-center text-xs text-slate-500">
                A smarter way to start a business conversation
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-lg text-red-600">
                  ↗
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Lead opportunities
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Capture and manage enquiries
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand statement */}
      <section className="bg-[#111827]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3 md:gap-10 lg:px-10">
          <div className="md:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
              Designed for business
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-snug text-white">
              Better conversations. Better opportunities.
            </h2>
          </div>
          <div className="md:col-span-2 md:border-l md:border-white/15 md:pl-10">
            <p className="leading-8 text-slate-300">
              Your website should do more than display information. Trevos
              Assistant gives visitors a conversational way to learn about
              your business while helping your team capture and organise
              enquiries for follow-up.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">
              What Trevos Assistant does
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              One assistant. Multiple ways to support your business.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-slate-600">
              Bring customer conversations and lead capture into one
              business-focused platform.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-slate-900/5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl font-bold text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                    {feature.icon}
                  </span>
                  <span className="text-sm font-bold tracking-widest text-slate-300">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-slate-50 px-5 py-20 sm:px-8 sm:py-24 lg:px-10"
      >
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">
              Simple installation
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Bring AI-powered conversations to your website.
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              Keep your existing website. Set up Trevos Assistant separately
              and add it to your site using its generated installation code.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 font-bold text-white transition hover:bg-red-700"
            >
              Get Started <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#111827] text-sm font-extrabold text-white">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it is for */}
      <section className="px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-600">
              Built around your business
            </p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Make it part of your customer experience.
            </h2>
            <p className="mt-5 leading-8 text-slate-600">
              Whether you provide professional services, sell products, or
              manage business enquiries, a website assistant can give
              visitors another way to engage with your organisation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              "Professional services",
              "Small and medium businesses",
              "Online businesses",
              "Customer-facing organisations",
            ].map((item) => (
              <div
                key={item}
                className="flex min-h-28 items-center rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="font-bold leading-6 text-slate-800">
                  <span className="mb-3 block text-xl text-red-600">✦</span>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20 sm:px-8 sm:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#111827] px-6 py-14 sm:px-12 sm:py-16 lg:px-16">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[50px] border-red-600/20" />
          <div className="absolute -bottom-32 right-40 h-64 w-64 rounded-full bg-red-600/10 blur-2xl" />

          <div className="relative max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-red-400">
              Take the next step
            </p>
            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
              Your website can do more than just exist online.
            </h2>
            <p className="mt-5 max-w-2xl leading-8 text-slate-300">
              Give visitors another way to engage with your business.
              Explore Trevos Assistant and see how an AI-powered assistant
              can fit into your customer experience.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-7 py-4 font-bold text-white transition hover:bg-red-700"
              >
                Get Your AI Assistant <span aria-hidden="true">→</span>
              </Link>
              <a
                href="https://trevoslimited.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-white/25 px-7 py-4 font-bold text-white transition hover:bg-white/10"
              >
                Visit Trevos Hub
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-5 py-9 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/trevos-mark.png"
              alt="Trevos"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div>
              <p className="font-bold text-slate-900">Trevos Assistant</p>
              <p className="mt-1 text-xs text-slate-500">
                AI-powered customer support and lead management
              </p>
            </div>
          </div>

          <div className="text-sm leading-7 text-slate-500 sm:text-right">
            <p>
              A product of{" "}
              <a
                href="https://trevoslimited.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-800 transition hover:text-red-600"
              >
                Trevos Hub &amp; Services Limited
              </a>
            </p>
            <p>
              © {new Date().getFullYear()} Trevos Hub &amp; Services Limited.
              All rights reserved.
            </p>
            <a
              href="https://trevoslimited.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-red-600 transition hover:text-red-700"
            >
              trevoslimited.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
