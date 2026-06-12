"use client";

import { useState } from "react";
import "./globals.css";

const initial = {
  fullName: "",
  companyName: "",
  jobTitle: "",
  telephone: "",
  email: "",
  website: "",
  vat: "",
  applicationDate: new Date().toISOString().slice(0, 10),
  termsAccepted: false,
};

export default function Page() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | error
  const [banner, setBanner] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Please enter your full name and title.";
    if (!form.companyName.trim()) e.companyName = "Please enter your company name.";
    if (!form.jobTitle.trim()) e.jobTitle = "Please enter your job title.";
    if (!form.telephone.trim()) e.telephone = "Please enter a telephone number.";
    if (!form.email.trim()) {
      e.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Please enter a valid email address.";
    }
    if (!form.applicationDate) e.applicationDate = "Please enter a date.";
    if (!form.termsAccepted) e.termsAccepted = "You must accept the terms to continue.";
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setBanner(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      setBanner({ type: "error", text: "Please correct the highlighted fields." });
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong saving your details.");
      }
      // Details saved to Notion. Send the member straight to Stripe to pay.
      setBanner({
        type: "success",
        text: "Your details have been received. Taking you to secure payment…",
      });
      window.location.href = "https://buy.stripe.com/aEU3fgfZqcq8frW3cq";
    } catch (err) {
      setStatus("error");
      setBanner({ type: "error", text: err.message });
    }
  }

  return (
    <div className="page">
      <div className="masthead">
        <p className="eyebrow">The Middle East Association</p>
        <h1>Corporate Membership Application</h1>
        <p className="sub">Please complete the form below to finalise your membership.</p>
      </div>

      <form className="card" onSubmit={handleSubmit} noValidate>
        {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

        <p className="intro">
          We are pleased to welcome you to The Middle East Association. The details
          below complete your Corporate Membership and prepare your account for payment.
        </p>

        <div className="price-row">
          <span className="amount">£2,500</span>
          <span className="label">Annual Corporate Membership</span>
        </div>

        <Field
          id="fullName" label="Full name & title" required
          value={form.fullName} onChange={(v) => update("fullName", v)}
          error={errors.fullName} placeholder="e.g. Dr Jane Smith"
        />
        <Field
          id="companyName" label="Company name" required
          value={form.companyName} onChange={(v) => update("companyName", v)}
          error={errors.companyName}
        />
        <Field
          id="jobTitle" label="Job title" required
          value={form.jobTitle} onChange={(v) => update("jobTitle", v)}
          error={errors.jobTitle}
        />
        <Field
          id="telephone" label="Telephone" required type="tel"
          value={form.telephone} onChange={(v) => update("telephone", v)}
          error={errors.telephone} placeholder="+44 20 7000 0000"
        />
        <Field
          id="email" label="Email" required type="email"
          value={form.email} onChange={(v) => update("email", v)}
          error={errors.email}
        />

        <div className="divider" />
        <p className="section-label">Company details (optional)</p>

        <Field
          id="website" label="Website" optional type="url"
          value={form.website} onChange={(v) => update("website", v)}
          error={errors.website} placeholder="https://"
        />
        <Field
          id="vat" label="VAT registration number" optional
          value={form.vat} onChange={(v) => update("vat", v)}
          error={errors.vat}
        />

        <div className="terms">
          <p>
            I / We apply for membership of The Middle East Association and agree, if
            accepted, to be bound by the Memorandum and Articles of Association. I / We
            further give explicit consent for The Middle East Association to communicate
            with me / us for marketing purposes. It is understood that membership
            continues until terminated by one month&rsquo;s notice in writing, or
            non-payment of subscription. By joining The Middle East Association I / we
            hereby agree to adhere to The Middle East Association articles of association.
          </p>
          <div className="checkrow">
            <input
              id="terms" type="checkbox" checked={form.termsAccepted}
              onChange={(e) => update("termsAccepted", e.target.checked)}
            />
            <label htmlFor="terms">I accept</label>
          </div>
          {errors.termsAccepted && <p className="err">{errors.termsAccepted}</p>}
        </div>

        <div style={{ marginTop: 28 }}>
          <Field
            id="applicationDate" label="Date" required type="date"
            value={form.applicationDate} onChange={(v) => update("applicationDate", v)}
            error={errors.applicationDate}
          />
        </div>

        <button className="submit" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Saving your details…" : "Continue to payment"}
        </button>
        <p className="foot-note">
          Your details are saved securely before you are taken to payment.
        </p>
      </form>
    </div>
  );
}

function Field({ id, label, required, optional, type = "text", value, onChange, error, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="req">*</span>}
        {optional && <span className="opt">(optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "invalid" : ""}
      />
      {error && <p className="err">{error}</p>}
    </div>
  );
}
