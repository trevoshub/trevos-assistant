"use client";

import { FormEvent, useEffect, useState } from "react";

type Assistant = {
  id: number;
  name: string;
  status: string;
  welcomeMessage: string | null;
  systemPrompt: string | null;

  leadCaptureEnabled: boolean;
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  collectInterest: boolean;
  leadCaptureMessage: string | null;

  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  notificationEmail: string | null;
  whatsappNotificationsEnabled: boolean;
  notificationWhatsapp: string | null;
  notificationMessage: string | null;

  monthlyMessageLimit: number;
  monthlyMessageUsed: number;
};

export default function AssistantPage() {
  const [assistant, setAssistant] =
    useState<Assistant | null>(null);

  const [welcomeMessage, setWelcomeMessage] =
    useState("");
  const [systemPrompt, setSystemPrompt] =
    useState("");

  const [leadCaptureEnabled, setLeadCaptureEnabled] =
    useState(true);
  const [collectName, setCollectName] =
    useState(true);
  const [collectEmail, setCollectEmail] =
    useState(true);
  const [collectPhone, setCollectPhone] =
    useState(false);
  const [collectInterest, setCollectInterest] =
    useState(true);
  const [leadCaptureMessage, setLeadCaptureMessage] =
    useState("");

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(true);
  const [
    emailNotificationsEnabled,
    setEmailNotificationsEnabled,
  ] = useState(true);
  const [notificationEmail, setNotificationEmail] =
    useState("");
  const [
    whatsappNotificationsEnabled,
    setWhatsappNotificationsEnabled,
  ] = useState(false);
  const [notificationWhatsapp, setNotificationWhatsapp] =
    useState("");
  const [notificationMessage, setNotificationMessage] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingWelcome, setSavingWelcome] =
    useState(false);
  const [savingInstructions, setSavingInstructions] =
    useState(false);
  const [savingLeadCapture, setSavingLeadCapture] =
    useState(false);
  const [savingNotifications, setSavingNotifications] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAssistant() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/assistants");
      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to load assistant."
        );
        return;
      }

      const loadedAssistant = data.assistant;

      setAssistant(loadedAssistant);

      setWelcomeMessage(
        loadedAssistant?.welcomeMessage ?? ""
      );

      setSystemPrompt(
        loadedAssistant?.systemPrompt ?? ""
      );

      setLeadCaptureEnabled(
        loadedAssistant?.leadCaptureEnabled ?? true
      );

      setCollectName(
        loadedAssistant?.collectName ?? true
      );

      setCollectEmail(
        loadedAssistant?.collectEmail ?? true
      );

      setCollectPhone(
        loadedAssistant?.collectPhone ?? false
      );

      setCollectInterest(
        loadedAssistant?.collectInterest ?? true
      );

      setLeadCaptureMessage(
        loadedAssistant?.leadCaptureMessage ?? ""
      );

      setNotificationsEnabled(
        loadedAssistant?.notificationsEnabled ?? true
      );

      setEmailNotificationsEnabled(
        loadedAssistant?.emailNotificationsEnabled ?? true
      );

      setNotificationEmail(
        loadedAssistant?.notificationEmail ?? ""
      );

      setWhatsappNotificationsEnabled(
        loadedAssistant?.whatsappNotificationsEnabled ??
          false
      );

      setNotificationWhatsapp(
        loadedAssistant?.notificationWhatsapp ?? ""
      );

      setNotificationMessage(
        loadedAssistant?.notificationMessage ?? ""
      );
    } catch (error) {
      console.error(error);
      setError("Unable to load assistant.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssistant();
  }, []);

  async function createAssistant() {
    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/assistants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Trevos Assistant",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ?? "Unable to create assistant."
        );

        if (data.assistant) {
          const createdAssistant =
            data.assistant as Assistant;

          setAssistant(createdAssistant);

          setWelcomeMessage(
            createdAssistant.welcomeMessage ?? ""
          );

          setSystemPrompt(
            createdAssistant.systemPrompt ?? ""
          );

          setLeadCaptureEnabled(
            createdAssistant.leadCaptureEnabled
          );

          setCollectName(
            createdAssistant.collectName
          );

          setCollectEmail(
            createdAssistant.collectEmail
          );

          setCollectPhone(
            createdAssistant.collectPhone
          );

          setCollectInterest(
            createdAssistant.collectInterest
          );

          setLeadCaptureMessage(
            createdAssistant.leadCaptureMessage ?? ""
          );

          setNotificationsEnabled(
            createdAssistant.notificationsEnabled
          );

          setEmailNotificationsEnabled(
            createdAssistant.emailNotificationsEnabled
          );

          setNotificationEmail(
            createdAssistant.notificationEmail ?? ""
          );

          setWhatsappNotificationsEnabled(
            createdAssistant.whatsappNotificationsEnabled
          );

          setNotificationWhatsapp(
            createdAssistant.notificationWhatsapp ?? ""
          );

          setNotificationMessage(
            createdAssistant.notificationMessage ?? ""
          );
        }

        return;
      }

      const createdAssistant =
        data.assistant as Assistant;

      setAssistant(createdAssistant);

      setWelcomeMessage(
        createdAssistant.welcomeMessage ?? ""
      );

      setSystemPrompt(
        createdAssistant.systemPrompt ?? ""
      );

      setLeadCaptureEnabled(
        createdAssistant.leadCaptureEnabled
      );

      setCollectName(
        createdAssistant.collectName
      );

      setCollectEmail(
        createdAssistant.collectEmail
      );

      setCollectPhone(
        createdAssistant.collectPhone
      );

      setCollectInterest(
        createdAssistant.collectInterest
      );

      setLeadCaptureMessage(
        createdAssistant.leadCaptureMessage ?? ""
      );

      setNotificationsEnabled(
        createdAssistant.notificationsEnabled
      );

      setEmailNotificationsEnabled(
        createdAssistant.emailNotificationsEnabled
      );

      setNotificationEmail(
        createdAssistant.notificationEmail ?? ""
      );

      setWhatsappNotificationsEnabled(
        createdAssistant.whatsappNotificationsEnabled
      );

      setNotificationWhatsapp(
        createdAssistant.notificationWhatsapp ?? ""
      );

      setNotificationMessage(
        createdAssistant.notificationMessage ?? ""
      );

      setSuccess("Assistant created successfully.");
    } catch (error) {
      console.error(error);
      setError("Unable to create assistant.");
    } finally {
      setCreating(false);
    }
  }

  async function saveWelcomeMessage(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!assistant) {
      setError("Assistant not found.");
      return;
    }

    if (!welcomeMessage.trim()) {
      setError("Welcome message cannot be empty.");
      return;
    }

    setSavingWelcome(true);

    try {
      const response = await fetch("/api/assistants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: assistant.id,
          welcomeMessage: welcomeMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to save welcome message."
        );
        return;
      }

      setAssistant(data.assistant);
      setWelcomeMessage(
        data.assistant.welcomeMessage ?? ""
      );

      setSuccess(
        "Welcome message saved successfully."
      );
    } catch (error) {
      console.error(error);
      setError("Unable to save welcome message.");
    } finally {
      setSavingWelcome(false);
    }
  }

  async function saveInstructions(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!assistant) {
      setError("Assistant not found.");
      return;
    }

    if (!systemPrompt.trim()) {
      setError(
        "Assistant instructions cannot be empty."
      );
      return;
    }

    setSavingInstructions(true);

    try {
      const response = await fetch("/api/assistants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: assistant.id,
          systemPrompt: systemPrompt.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to save assistant instructions."
        );
        return;
      }

      setAssistant(data.assistant);
      setSystemPrompt(
        data.assistant.systemPrompt ?? ""
      );

      setSuccess(
        "Assistant instructions saved successfully."
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to save assistant instructions."
      );
    } finally {
      setSavingInstructions(false);
    }
  }

  async function saveLeadCapture(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!assistant) {
      setError("Assistant not found.");
      return;
    }

    if (leadCaptureEnabled) {
      const atLeastOneField =
        collectName ||
        collectEmail ||
        collectPhone ||
        collectInterest;

      if (!atLeastOneField) {
        setError(
          "Select at least one customer detail to collect."
        );
        return;
      }
    }

    setSavingLeadCapture(true);

    try {
      const response = await fetch("/api/assistants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: assistant.id,
          leadCaptureEnabled,
          collectName,
          collectEmail,
          collectPhone,
          collectInterest,
          leadCaptureMessage:
            leadCaptureMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to save lead capture settings."
        );
        return;
      }

      setAssistant(data.assistant);

      setLeadCaptureEnabled(
        data.assistant.leadCaptureEnabled
      );

      setCollectName(
        data.assistant.collectName
      );

      setCollectEmail(
        data.assistant.collectEmail
      );

      setCollectPhone(
        data.assistant.collectPhone
      );

      setCollectInterest(
        data.assistant.collectInterest
      );

      setLeadCaptureMessage(
        data.assistant.leadCaptureMessage ?? ""
      );

      setSuccess(
        "Lead capture settings saved successfully."
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to save lead capture settings."
      );
    } finally {
      setSavingLeadCapture(false);
    }
  }

  async function saveNotifications(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!assistant) {
      setError("Assistant not found.");
      return;
    }

    if (notificationsEnabled) {
      if (
        !emailNotificationsEnabled &&
        !whatsappNotificationsEnabled
      ) {
        setError(
          "Select at least one notification channel."
        );
        return;
      }

      if (
        emailNotificationsEnabled &&
        !notificationEmail.trim()
      ) {
        setError(
          "Enter an email address for email notifications."
        );
        return;
      }

      if (
        whatsappNotificationsEnabled &&
        !notificationWhatsapp.trim()
      ) {
        setError(
          "Enter a WhatsApp number for WhatsApp notifications."
        );
        return;
      }
    }

    setSavingNotifications(true);

    try {
      const response = await fetch("/api/assistants", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assistantId: assistant.id,
          notificationsEnabled,
          emailNotificationsEnabled,
          notificationEmail:
            notificationEmail.trim(),
          whatsappNotificationsEnabled,
          notificationWhatsapp:
            notificationWhatsapp.trim(),
          notificationMessage:
            notificationMessage.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ??
            "Unable to save notification settings."
        );
        return;
      }

      setAssistant(data.assistant);

      setNotificationsEnabled(
        data.assistant.notificationsEnabled
      );

      setEmailNotificationsEnabled(
        data.assistant.emailNotificationsEnabled
      );

      setNotificationEmail(
        data.assistant.notificationEmail ?? ""
      );

      setWhatsappNotificationsEnabled(
        data.assistant.whatsappNotificationsEnabled
      );

      setNotificationWhatsapp(
        data.assistant.notificationWhatsapp ?? ""
      );

      setNotificationMessage(
        data.assistant.notificationMessage ?? ""
      );

      setSuccess(
        "Notification settings saved successfully."
      );
    } catch (error) {
      console.error(error);
      setError(
        "Unable to save notification settings."
      );
    } finally {
      setSavingNotifications(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
            Loading assistant...
          </div>
        </div>
      </main>
    );
  }

  if (!assistant) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900">
              AI Assistant
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500">
              Your company does not have an AI Assistant
              yet. Create one to continue.
            </p>

            <button
              type="button"
              onClick={createAssistant}
              disabled={creating}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating
                ? "Creating..."
                : "Create Assistant"}
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Assistant
          </h1>

          <p className="mt-2 text-gray-600">
            Configure how your AI Assistant should behave
            and interact with customers.
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

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {assistant.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Configure your company&apos;s AI customer
                assistant.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold text-green-600">
                  {assistant.status}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">
                  Monthly Messages
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {assistant.monthlyMessageUsed} /{" "}
                  {assistant.monthlyMessageLimit}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Welcome Message
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              This is the first message customers will see
              when they open the assistant.
            </p>
          </div>

          <form
            onSubmit={saveWelcomeMessage}
            className="space-y-4"
          >
            <textarea
              value={welcomeMessage}
              onChange={(event) =>
                setWelcomeMessage(event.target.value)
              }
              rows={4}
              placeholder="e.g. Hello! How can I help you today?"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={savingWelcome}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingWelcome
                ? "Saving..."
                : "Save Welcome Message"}
            </button>
          </form>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Assistant Instructions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Tell your AI Assistant how it should behave,
              communicate, and handle customer questions.
            </p>
          </div>

          <form
            onSubmit={saveInstructions}
            className="space-y-4"
          >
            <textarea
              value={systemPrompt}
              onChange={(event) =>
                setSystemPrompt(event.target.value)
              }
              rows={10}
              placeholder={`Example:

You are a helpful customer service assistant.

Be friendly, professional, and concise.

Answer questions using the company's knowledge base.

If you do not know the answer, do not guess. Ask the customer to contact the company for more information.`}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="submit"
              disabled={savingInstructions}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingInstructions
                ? "Saving..."
                : "Save Instructions"}
            </button>
          </form>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Lead Capture
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose what information your AI Assistant
              should collect from potential customers.
            </p>
          </div>

          <form
            onSubmit={saveLeadCapture}
            className="space-y-6"
          >
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="font-medium text-gray-900">
                  Enable Lead Capture
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Allow the assistant to collect potential
                  customer information.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setLeadCaptureEnabled(
                    !leadCaptureEnabled
                  )
                }
                className={`relative h-6 w-11 rounded-full transition ${
                  leadCaptureEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                aria-label="Toggle lead capture"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    leadCaptureEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div
              className={
                leadCaptureEnabled
                  ? "space-y-4"
                  : "pointer-events-none space-y-4 opacity-50"
              }
            >
              <p className="text-sm font-medium text-gray-900">
                Information to collect
              </p>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={collectName}
                  onChange={(event) =>
                    setCollectName(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm text-gray-700">
                  Customer Name
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={collectEmail}
                  onChange={(event) =>
                    setCollectEmail(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm text-gray-700">
                  Email Address
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={collectPhone}
                  onChange={(event) =>
                    setCollectPhone(event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm text-gray-700">
                  Phone Number
                </span>
              </label>

              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={collectInterest}
                  onChange={(event) =>
                    setCollectInterest(
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />

                <span className="text-sm text-gray-700">
                  Customer Interest
                </span>
              </label>

              <div className="pt-2">
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Lead Capture Message
                </label>

                <p className="mb-3 text-sm text-gray-500">
                  This message tells the customer why the
                  assistant is requesting their details.
                </p>

                <textarea
                  value={leadCaptureMessage}
                  onChange={(event) =>
                    setLeadCaptureMessage(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder="e.g. I'd be happy to help. May I get your contact details so our team can follow up with you?"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingLeadCapture}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingLeadCapture
                ? "Saving..."
                : "Save Lead Capture Settings"}
            </button>
          </form>
        </section>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Notifications
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose how your team should be notified when
              the assistant captures a new lead.
            </p>
          </div>

          <form
            onSubmit={saveNotifications}
            className="space-y-6"
          >
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="font-medium text-gray-900">
                  Enable Notifications
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Allow the system to send new lead
                  notifications.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setNotificationsEnabled(
                    !notificationsEnabled
                  )
                }
                className={`relative h-6 w-11 rounded-full transition ${
                  notificationsEnabled
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                aria-label="Toggle notifications"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                    notificationsEnabled
                      ? "left-6"
                      : "left-1"
                  }`}
                />
              </button>
            </div>

            <div
              className={
                notificationsEnabled
                  ? "space-y-6"
                  : "pointer-events-none space-y-6 opacity-50"
              }
            >
              <div>
                <p className="mb-4 text-sm font-medium text-gray-900">
                  Notification Channels
                </p>

                <div className="space-y-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        emailNotificationsEnabled
                      }
                      onChange={(event) =>
                        setEmailNotificationsEnabled(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    <span className="text-sm text-gray-700">
                      Email Notifications
                    </span>
                  </label>

                  {emailNotificationsEnabled && (
                    <div className="ml-7">
                      <label className="mb-2 block text-sm font-medium text-gray-900">
                        Notification Email
                      </label>

                      <input
                        type="email"
                        value={notificationEmail}
                        onChange={(event) =>
                          setNotificationEmail(
                            event.target.value
                          )
                        }
                        placeholder="e.g. admin@company.com"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  )}

                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={
                        whatsappNotificationsEnabled
                      }
                      onChange={(event) =>
                        setWhatsappNotificationsEnabled(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />

                    <span className="text-sm text-gray-700">
                      WhatsApp Notifications
                    </span>
                  </label>

                  {whatsappNotificationsEnabled && (
                    <div className="ml-7">
                      <label className="mb-2 block text-sm font-medium text-gray-900">
                        WhatsApp Number
                      </label>

                      <input
                        type="tel"
                        value={notificationWhatsapp}
                        onChange={(event) =>
                          setNotificationWhatsapp(
                            event.target.value
                          )
                        }
                        placeholder="e.g. +2348012345678"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Notification Message
                </label>

                <p className="mb-3 text-sm text-gray-500">
                  Customize the message your team will
                  receive when a new lead is captured.
                </p>

                <textarea
                  value={notificationMessage}
                  onChange={(event) =>
                    setNotificationMessage(
                      event.target.value
                    )
                  }
                  rows={5}
                  placeholder={`Example:

New lead captured by Trevos Assistant.

Name: [customer name]
Email: [customer email]
Phone: [customer phone]
Interest: [customer interest]`}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingNotifications}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingNotifications
                ? "Saving..."
                : "Save Notification Settings"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Assistant Configuration
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Knowledge Base
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Manage the information your assistant can
                use when answering customer questions.
              </p>

              <a
                href="/dashboard/knowledge"
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Manage Knowledge →
              </a>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Lead Capture
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Configure how the assistant collects
                customer names, emails, phone numbers, and
                interests.
              </p>

              <span className="mt-4 inline-block text-sm font-medium text-green-600">
                Configured above
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900">
                Notifications
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Configure how your team receives new lead
                and customer notifications.
              </p>

              <span className="mt-4 inline-block text-sm font-medium text-green-600">
                Configured above
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}