"use client";

import { useState } from "react";
import { sendFacilityInquiry } from "@/app/actions/contact";

interface ContactFormProps {
  facilityId: string;
  facilityName: string;
}

export default function ContactForm({
  facilityId,
  facilityName,
}: ContactFormProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const formData = new FormData(e.currentTarget);
    formData.set("facilityId", facilityId);

    const result = await sendFacilityInquiry(formData);

    if (result.success) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-cs-green-ok/30 bg-cs-green-ok/5 p-4 text-center">
        <p className="font-medium text-cs-green-ok">Message sent!</p>
        <p className="mt-1 text-sm text-cs-muted">
          Your inquiry has been sent to {facilityName}.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-cs-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark"
      >
        Send a message
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <select
        name="inquiryType"
        required
        className="w-full rounded-lg border border-cs-border bg-white px-3 py-2.5 text-sm text-cs-body outline-none focus:ring-2 focus:ring-cs-blue/20"
        defaultValue=""
      >
        <option value="" disabled>
          What is your inquiry about?
        </option>
        <option value="tour_request">Tour request</option>
        <option value="pricing_question">Pricing question</option>
        <option value="general_inquiry">General inquiry</option>
      </select>

      <textarea
        name="message"
        required
        maxLength={2000}
        rows={4}
        placeholder="Write your message..."
        className="w-full resize-none rounded-lg border border-cs-border bg-white px-3 py-2.5 text-sm text-cs-body outline-none placeholder:text-cs-muted/60 focus:ring-2 focus:ring-cs-blue/20"
      />

      <p className="text-xs text-cs-muted">
        Your message will be sent directly to the facility. We do not collect or
        store your personal information.
      </p>

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-cs-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cs-blue-dark disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send message"}
      </button>

      {status === "error" && (
        <p className="text-center text-sm text-cs-red-alert">
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
