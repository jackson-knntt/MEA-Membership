"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import "./globals.css";

const CLOUDINARY_CLOUD = "dwdrwtnvf";
const CLOUDINARY_PRESET = "mea-membership-headshots";

const initialForm = {
  title: "",
  firstName: "",
  lastName: "",
  email: "",
  jobTitle: "",
  company: "",
  linkedin: "",
  telephone: "",
  website: "",
  vat: "",
  orgTypes: [],
  interests: [],
  countriesFocus: "",
  menaExperience: "",
  speakingInterest: "",
  sponsorshipInterest: "",
  bio: "",
  applicationDate: new Date().toISOString().slice(0, 10),
};

export default function Page() {
  const [step, setStep] = useState(1); // 1 = overview, 2 = form
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [banner, setBanner] = useState(null);

  // Headshot
  const [headshot, setHeadshot] = useState(null);
  const [headshotPreview, setHeadshotPreview] = useState(null);
  const [headshotUrl, setHeadshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCheck(field, value) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  }

  function handleAgree() {
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Headshot handlers
  function handleFileSelect(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setBanner({ type: "error", text: "Please select an image file (JPG, PNG, etc.)." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setBanner({ type: "error", text: "Image must be under 8 MB." });
      return;
    }
    setBanner(null);
    setHeadshot(file);
    setHeadshotUrl("");
    const reader = new FileReader();
    reader.onload = (e) => setHeadshotPreview(e.target.result);
    reader.readAsDataURL(file);
  }

  function removeHeadshot() {
    setHeadshot(null);
    setHeadshotPreview(null);
    setHeadshotUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function uploadToCloudinary() {
    if (!headshot) return "";
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", headshot);
      data.append("upload_preset", CLOUDINARY_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
        { method: "POST", body: data }
      );
      if (!res.ok) throw new Error("Cloudinary upload failed.");
      const json = await res.json();
      setHeadshotUrl(json.secure_url);
      return json.secure_url;
    } catch {
      throw new Error("We could not upload your headshot. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setBanner(null);
    setStatus("submitting");

    try {
      let finalHeadshotUrl = headshotUrl;
      if (headshot && !headshotUrl) {
        finalHeadshotUrl = await uploadToCloudinary();
      }

      const payload = { ...form, termsAccepted: true, headshotUrl: finalHeadshotUrl };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setBanner({
        type: "success",
        text: "Your details have been received. Taking you to secure payment…",
      });

      setTimeout(() => {
        window.location.href = "https://buy.stripe.com/aEU3fgfZqcq8frW3cq";
      }, 1500);

    } catch (err) {
      setStatus("error");
      setBanner({ type: "error", text: err.message });
    }
  }

  const submitting = status === "submitting";

  return (
    <>
      {/* ── Header ── */}
      <div className="header">
        <div className="header-inner">
          <div className="logo-wrap">
            <Image src="/mea-logo.png" alt="The Middle East Association" width={64} height={64} />
          </div>
          <div className="header-text">
            <h1>The Middle East Association</h1>
            <p>Corporate Membership — £2,500 + VAT per year</p>
          </div>
        </div>
      </div>
      <div className="header-bar" />

      {/* ══════════════════════════════════════
          STEP 1 — Overview & Terms
      ══════════════════════════════════════ */}
      {step === 1 && (
        <div className="form-wrap">
          <div className="form-card">

            <div className="section-header">
              <div className="section-icon">🌍</div>
              <div>
                <h2>Corporate Membership</h2>
                <p>What your membership includes</p>
              </div>
            </div>

            <div className="form-body">
              <p className="intro-text">
                The Middle East Association is the UK's leading organisation dedicated to fostering
                connections and informed dialogue between the UK and the Middle East and North Africa.
                Since 1961, we have served as a trusted bridge — uniting governments, businesses,
                academic institutions, and civil society across political, economic, and cultural spheres.
              </p>
              <p className="intro-text">
                Corporate Membership provides structured, year-round access to MEA events, networks,
                and senior engagement opportunities for organisations with interests across the MENA region.
              </p>

              {/* Price block */}
              <div className="price-block">
                <span className="price-amount">£2,500</span>
                <span className="price-label">+ VAT per year</span>
              </div>

              {/* Benefits */}
              <div className="benefits-label">What is included</div>
              <div className="benefits-grid">
                {[
                  {
                    icon: "🎟️",
                    title: "Year-Round Event Access",
                    body: "Invitations to MEA events throughout the year, including flagship receptions, private briefings, and roundtables.",
                  },
                  {
                    icon: "🔒",
                    title: "Private Briefings",
                    body: "Access to confidential, off-the-record briefings with industry experts, policymakers, and regional specialists.",
                  },
                  {
                    icon: "🤝",
                    title: "Tailored Engagement",
                    body: "Support for partner-led engagement, including opportunities to invite VIP guests to MEA flagship events.",
                  },
                  {
                    icon: "📰",
                    title: "Insights & Updates",
                    body: "Monthly newsletter featuring political, economic, and regional analysis from across the MENA region.",
                  },
                  {
                    icon: "📣",
                    title: "Profile & Visibility",
                    body: "Complimentary annual advertising in the MEA newsletter, increasing your visibility within the UK–Middle East community.",
                  },
                  {
                    icon: "👥",
                    title: "Talent & Network Development",
                    body: "Unlimited access to the MEA Young Professionals Group — a dedicated network of emerging leaders with MENA interests.",
                  },
                ].map((b) => (
                  <div className="benefit-card" key={b.title}>
                    <div className="benefit-icon">{b.icon}</div>
                    <div className="benefit-title">{b.title}</div>
                    <div className="benefit-body">{b.body}</div>
                  </div>
                ))}
              </div>

              {/* Who it's for */}
              <div className="who-box">
                <div className="who-label">Who it is for</div>
                <p>
                  Corporate Membership is designed for organisations seeking structured engagement
                  and ongoing access to MEA events and networks. Members range from multinational
                  corporations and financial institutions to government agencies, consultancies,
                  and think tanks with active interests across the Middle East and North Africa.
                </p>
              </div>

              {/* Terms */}
              <div className="terms-box" style={{ marginTop: 32 }}>
                <p>
                  By proceeding, I / we apply for Corporate Membership of The Middle East Association
                  and agree, if accepted, to be bound by the Memorandum and Articles of Association.
                  I / We give explicit consent for The Middle East Association to communicate with
                  me / us for membership and marketing purposes. Membership continues until terminated
                  by one month&rsquo;s notice in writing, or non-payment of the annual subscription.
                </p>
                <div className="check-row">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      if (e.target.checked) setTermsError(false);
                    }}
                  />
                  <label htmlFor="terms">
                    I have read and accept the terms and conditions of Corporate Membership
                  </label>
                </div>
                {termsError && (
                  <p className="field-error show" style={{ marginTop: 10 }}>
                    Please accept the terms and conditions to continue.
                  </p>
                )}
              </div>

              <button className="submit-btn" type="button" onClick={handleAgree}>
                Continue to membership form →
              </button>
              <p className="foot-note">
                You will complete your details and proceed to secure payment on the next page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          STEP 2 — Member Details & Payment
      ══════════════════════════════════════ */}
      {step === 2 && (
        <div className="form-wrap">
          <form className="form-card" onSubmit={handleSubmit} noValidate>

            {/* ── Personal Details ── */}
            <div className="section-header">
              <div className="section-icon">👤</div>
              <div>
                <h2>Your Details</h2>
                <p>Personal and professional information</p>
              </div>
            </div>
            <div className="form-body">
              {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

              <div className="field-row">
                <div className="field">
                  <label>Title <span className="opt">(optional)</span></label>
                  <select value={form.title} onChange={(e) => update("title", e.target.value)}>
                    <option value="">Select…</option>
                    {["Mr","Mrs","Ms","Miss","Dr","Prof","Sir","Lord","Lady","H.E.","Other"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="field" />
              </div>

              <div className="field-row">
                <Field label="First Name" id="firstName" value={form.firstName}
                  onChange={(v) => update("firstName", v)} placeholder="Jane" />
                <Field label="Last Name" id="lastName" value={form.lastName}
                  onChange={(v) => update("lastName", v)} placeholder="Smith" />
              </div>

              <div className="field-row single">
                <Field label="Email Address" id="email" type="email" value={form.email}
                  onChange={(v) => update("email", v)} placeholder="jane.smith@company.com" />
              </div>

              <div className="field-row">
                <Field label="Job Title" id="jobTitle" value={form.jobTitle}
                  onChange={(v) => update("jobTitle", v)} placeholder="Director, Senior Manager…" />
                <Field label="Company Name" id="company" value={form.company}
                  onChange={(v) => update("company", v)} placeholder="Your organisation" />
              </div>

              <div className="field-row single">
                <Field label="LinkedIn URL" id="linkedin" type="url" optional value={form.linkedin}
                  onChange={(v) => update("linkedin", v)} placeholder="https://linkedin.com/in/…" />
              </div>

              <div className="field-row single">
                <Field label="Telephone" id="telephone" type="tel" optional value={form.telephone}
                  onChange={(v) => update("telephone", v)} placeholder="+44 20 7000 0000" />
              </div>
            </div>

            {/* ── Organisation ── */}
            <div className="section-header">
              <div className="section-icon">🏢</div>
              <div>
                <h2>Your Organisation</h2>
                <p>Help us understand your company and interests</p>
              </div>
            </div>
            <div className="form-body">

              <div className="field-row">
                <Field label="Website" id="website" type="url" optional value={form.website}
                  onChange={(v) => update("website", v)} placeholder="https://" />
                <Field label="VAT Registration Number" id="vat" optional value={form.vat}
                  onChange={(v) => update("vat", v)} />
              </div>

              <div className="field-row single">
                <div className="field">
                  <label>Organisation Type <span className="opt">(optional)</span></label>
                  <div className="check-group cols-2">
                    {[
                      "Corporate / Private Company",
                      "Think Tank / Research Institute",
                      "Academic Institution",
                      "Government / Public Sector",
                      "Philanthropy and Development",
                      "NGO / Non-Profit",
                    ].map((opt) => (
                      <label key={opt} className="check-item">
                        <input type="checkbox" checked={form.orgTypes.includes(opt)}
                          onChange={() => toggleCheck("orgTypes", opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field-row single" style={{ marginTop: 20 }}>
                <div className="field">
                  <label>Primary Areas of Interest <span className="opt">(optional)</span></label>
                  <div className="check-group cols-2">
                    {[
                      "Business & Investment",
                      "Climate & Energy",
                      "Philanthropy and Development",
                      "Politics & Policy",
                      "Security & Defence",
                      "Technology & Innovation",
                      "Academia & Research",
                      "Diplomacy & Government Relations",
                    ].map((opt) => (
                      <label key={opt} className="check-item">
                        <input type="checkbox" checked={form.interests.includes(opt)}
                          onChange={() => toggleCheck("interests", opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field-row single" style={{ marginTop: 20 }}>
                <div className="field">
                  <label>Countries / Regions of Focus <span className="opt">(optional)</span></label>
                  <textarea value={form.countriesFocus}
                    onChange={(e) => update("countriesFocus", e.target.value)}
                    placeholder="e.g. Saudi Arabia, UAE, Egypt, Gulf region broadly…" />
                </div>
              </div>

              <div className="field-row single">
                <div className="field">
                  <label>Previous MENA Experience <span className="opt">(optional)</span></label>
                  <textarea value={form.menaExperience}
                    onChange={(e) => update("menaExperience", e.target.value)}
                    placeholder="Brief description of your existing partnerships or experience in the region…" />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Speaking Interest <span className="opt">(optional)</span></label>
                  <select value={form.speakingInterest}
                    onChange={(e) => update("speakingInterest", e.target.value)}>
                    <option value="">Select…</option>
                    <option>Yes, I am interested in speaking</option>
                    <option>Possibly, depending on the topic</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="field">
                  <label>Sponsorship Interest <span className="opt">(optional)</span></label>
                  <select value={form.sponsorshipInterest}
                    onChange={(e) => update("sponsorshipInterest", e.target.value)}>
                    <option value="">Select…</option>
                    <option>Yes, we would like to discuss sponsorship</option>
                    <option>Possibly</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ── Profile ── */}
            <div className="section-header">
              <div className="section-icon">📝</div>
              <div>
                <h2>Your Profile</h2>
                <p>Bio and headshot for our member directory</p>
              </div>
            </div>
            <div className="form-body">

              <div className="field-row single">
                <div className="field">
                  <label>Professional Bio <span className="opt">(optional)</span></label>
                  <textarea style={{ minHeight: 130 }} value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="A brief professional biography for the MEA member directory…" />
                </div>
              </div>

              <div className="field-row single">
                <div className="field">
                  <label>Headshot <span className="opt">(optional — JPG or PNG, max 8 MB)</span></label>
                  {!headshotPreview ? (
                    <div
                      className={`upload-area${dragOver ? " drag-over" : ""}`}
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        handleFileSelect(e.dataTransfer.files[0]);
                      }}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files[0])} />
                      <div className="upload-icon">📷</div>
                      <div className="upload-label">Click to upload or drag and drop</div>
                      <div className="upload-hint">JPG, PNG, WEBP — max 8 MB</div>
                    </div>
                  ) : (
                    <div className="upload-preview">
                      <img src={headshotPreview} alt="Headshot preview" />
                      <span className="upload-preview-name">{headshot?.name}</span>
                      <button type="button" className="upload-remove" onClick={removeHeadshot}>
                        Remove
                      </button>
                    </div>
                  )}
                  {uploading && <div className="upload-progress">Uploading headshot…</div>}
                  {headshotUrl && (
                    <div className="upload-progress" style={{ color: "var(--success)" }}>
                      ✓ Headshot uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Payment ── */}
            <div className="section-header">
              <div className="section-icon">💳</div>
              <div>
                <h2>Proceed to Payment</h2>
                <p>Secure payment via Stripe — £2,500 + VAT annual membership</p>
              </div>
            </div>
            <div className="form-body">
              <div className="field-row single">
                <Field label="Date" id="applicationDate" type="date"
                  value={form.applicationDate}
                  onChange={(v) => update("applicationDate", v)} />
              </div>

              <button className="submit-btn" type="submit" disabled={submitting || uploading}>
                {submitting ? "Saving your details…" : "Continue to payment →"}
              </button>
              <p className="foot-note">
                Your details are saved securely before you are taken to payment via Stripe.
                You will receive a confirmation once payment is complete.
              </p>
            </div>

          </form>
        </div>
      )}
    </>
  );
}

function Field({ id, label, optional, type = "text", value, onChange, placeholder }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="opt">(optional)</span>}
      </label>
      <input id={id} type={type} value={value} placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
