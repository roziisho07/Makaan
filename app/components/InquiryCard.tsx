"use client";

import { FormEvent, useState } from "react";
import { getAnonymousClientId } from "../lib/anonymousClient";

interface InquiryCardProps {
  listingId: string;
}

type SubmitState = "idle" | "loading" | "success" | "error";

export default function InquiryCard({ listingId }: InquiryCardProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitState("loading");
    setErrorMessage(null);

    const nextMessage = message.trim();
    if (nextMessage.length < 10) {
      setSubmitState("error");
      setErrorMessage("Message must be at least 10 characters.");
      return;
    }

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          message: nextMessage,
          clientId: getAnonymousClientId(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setSubmitState("success");
      setMessage("");
    } catch {
      setSubmitState("error");
      setErrorMessage("Could not submit right now. Please try again.");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-900"
          placeholder="Your name (optional)"
        />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-900"
          placeholder="Email (optional)"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-900"
          placeholder="Phone (optional)"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 bg-white dark:bg-slate-900"
          placeholder="I am interested in this property. Please contact me with details."
          required
        />
      </div>

      {submitState === "success" && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Inquiry sent. An agent will contact you soon.
        </p>
      )}

      {submitState === "error" && errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={submitState === "loading"}
        className="w-full px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-70"
      >
        {submitState === "loading" ? "Sending..." : "Contact Agent"}
      </button>
    </form>
  );
}
