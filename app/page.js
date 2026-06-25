"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import "./globals.css";

const CLOUDINARY_CLOUD = "dwdrwtnvf";
const CLOUDINARY_PRESET = "mea-membership-headshots";

const initial = {
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
  termsAccepted: false,
};

export default function Page() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState("idle"); // idle | submitting | done | error
  const [banner, setBanner] = useState(null);

  // Headshot state
  const [headshot, setHeadshot] = useState(null);       // File object
  const [headshotPreview, setHeadshotPreview] = useState(null); // local blob URL
  const [headshotUrl, setHeadshotUrl] = useState("");   // Cloudinary URL after upload
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleCheck(field, value) {
    setForm((f) => {
      const arr = f[field];
      return {
        ...f,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  // ── Headshot handlers ──
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
    } catch (err) {
      throw new Error("We could not upload your headshot. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  // ── Submit ──
  async function handleSubmit(ev) {
    ev.preventDefault();
    setBanner(null);
    setStatus("submitting");

    try {
      // Upload headshot first if one was selected
      let finalHeadshotUrl = headshotUrl;
      if (headshot && !headshotUrl) {
        finalHeadshotUrl = await uploadToCloudinary();
      }

      const payload = { ...form, headshotUrl: finalHeadshotUrl };

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
            <Image src="/mea-logo.png" alt="MEA Logo" width={64} height={64} />
          </div>
          <div className="header-text">
            <h1>The Middle East Association</h1>
            <p>Corporate Membership Application</p>
          </div>
        </div>
      </div>
      <div className="header-bar" />

      {/* ── Price banner ── */}
      <div className="price-banner">
        <div className="price-inner">
          <span className="price-amount">£2,500</span>
          <span className="price-label">Annual Corporate Membership</span>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="form-wrap">
        <form className="form-card" onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Personal Details ── */}
          <div className="section-header">
            <div className="section-icon">👤</div>
            <div>
              <h2>Your Details</h2>
              <p>Personal and professional information</p>
            </div>
          </div>
          <div className="form-body">
            {banner && <div className={`banner ${banner.type}`}>{banner.text}</div>}

            <p className="intro-text">
              We are pleased to welcome you to The Middle East Association. Please
              complete the details below to finalise your Corporate Membership and
              proceed to payment.
            </p>

            {/* Title */}
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

            {/* Name */}
            <div className="field-row">
              <Field label="First Name" id="firstName" value={form.firstName}
                onChange={(v) => update("firstName", v)} placeholder="Jane" />
              <Field label="Last Name" id="lastName" value={form.lastName}
                onChange={(v) => update("lastName", v)} placeholder="Smith" />
            </div>

            {/* Email */}
            <div className="field-row single">
              <Field label="Email Address" id="email" type="email" value={form.email}
                onChange={(v) => update("email", v)} placeholder="jane.smith@company.com" />
            </div>

            {/* Job + Company */}
            <div className="field-row">
              <Field label="Job Title" id="jobTitle" value={form.jobTitle}
                onChange={(v) => update("jobTitle", v)} placeholder="Director, Senior Manager…" />
              <Field label="Company Name" id="company" value={form.company}
                onChange={(v) => update("company", v)} placeholder="Your organisation" />
            </div>

            {/* LinkedIn */}
            <div className="field-row single">
              <Field label="LinkedIn URL" id="linkedin" type="url" optional value={form.linkedin}
                onChange={(v) => update("linkedin", v)} placeholder="https://linkedin.com/in/…" />
            </div>

            {/* Phone */}
            <div className="field-row single">
              <Field label="Telephone" id="telephone" type="tel" optional value={form.telephone}
                onChange={(v) => update("telephone", v)} placeholder="+44 20 7000 0000" />
            </div>
          </div>

          {/* ── Section 2: Organisation ── */}
          <div className="section-header">
            <div className="section-icon">🏢</div>
            <div>
              <h2>Your Organisation</h2>
              <p>Tell us about your company and interests</p>
            </div>
          </div>
          <div className="form-body">

            {/* Website + VAT */}
            <div className="field-row">
              <Field label="Website" id="website" type="url" optional value={form.website}
                onChange={(v) => update("website", v)} placeholder="https://" />
              <Field label="VAT Registration Number" id="vat" optional value={form.vat}
                onChange={(v) => update("vat", v)} />
            </div>

            {/* Organisation type */}
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

            {/* Primary areas of interest */}
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

            {/* Countries focus */}
            <div className="field-row single" style={{ marginTop: 20 }}>
              <div className="field">
                <label>Countries / Regions of Focus <span className="opt">(optional)</span></label>
                <textarea value={form.countriesFocus}
                  onChange={(e) => update("countriesFocus", e.target.value)}
                  placeholder="e.g. Saudi Arabia, UAE, Egypt, Gulf region broadly…" />
              </div>
            </div>

            {/* MENA experience */}
            <div className="field-row single">
              <div className="field">
                <label>Previous MENA Experience <span className="opt">(optional)</span></label>
                <textarea value={form.menaExperience}
                  onChange={(e) => update("menaExperience", e.target.value)}
                  placeholder="Brief description of your existing partnerships or experience in the region…" />
              </div>
            </div>

            {/* Speaking + Sponsorship */}
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

          {/* ── Section 3: Profile ── */}
          <div className="section-header">
            <div className="section-icon">📝</div>
            <div>
              <h2>Your Profile</h2>
              <p>Bio and headshot for our member directory</p>
            </div>
          </div>
          <div className="form-body">

            {/* Bio */}
            <div className="field-row single">
              <div className="field">
                <label>Professional Bio <span className="opt">(optional)</span></label>
                <textarea
                  style={{ minHeight: 130 }}
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="A brief professional biography for the MEA member directory…"
                />
              </div>
            </div>

            {/* Headshot upload */}
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
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                    />
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

                {uploading && (
                  <div className="upload-progress">Uploading headshot…</div>
                )}
                {headshotUrl && (
                  <div className="upload-progress" style={{ color: "var(--success)" }}>
                    ✓ Headshot uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 4: Terms & Payment ── */}
          <div className="section-header">
            <div className="section-icon">✅</div>
            <div>
              <h2>Terms &amp; Payment</h2>
              <p>Review, agree, and proceed to secure payment</p>
            </div>
          </div>
          <div className="form-body">

            <div className="terms-box">
              <p>
                I / We apply for membership of The Middle East Association and agree,
                if accepted, to be bound by the Memorandum and Articles of Association.
                I / We further give explicit consent for The Middle East Association to
                communicate with me / us for marketing purposes. It is understood that
                membership continues until terminated by one month&rsquo;s notice in
                writing, or non-payment of subscription. By joining The Middle East
                Association I / we hereby agree to adhere to The Middle East Association
                articles of association.
              </p>
              <div className="check-row">
                <input
                  id="terms"
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => update("termsAccepted", e.target.checked)}
                />
                <label htmlFor="terms">I accept the terms and conditions</label>
              </div>
            </div>

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
            </p>
          </div>

        </form>
      </div>
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
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder || ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
