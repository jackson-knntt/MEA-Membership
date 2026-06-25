// Server-side only. Notion token lives in process.env, never in the browser.
export async function POST(request) {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!token || !databaseId) {
    return Response.json(
      { error: "Server is not configured. Missing Notion credentials." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const {
    title,
    firstName,
    lastName,
    email,
    jobTitle,
    company,
    linkedin,
    telephone,
    website,
    vat,
    orgTypes,
    interests,
    countriesFocus,
    menaExperience,
    speakingInterest,
    sponsorshipInterest,
    bio,
    headshotUrl,
    applicationDate,
    termsAccepted,
  } = body;

  // Build full name from parts
  const fullName = [title, firstName, lastName].filter(Boolean).join(" ").trim();

  // Combine arrays into readable strings for Notion
  const orgTypesStr = Array.isArray(orgTypes) ? orgTypes.join(", ") : "";
  const interestsStr = Array.isArray(interests) ? interests.join(", ") : "";

  // Build a notes block with the richer fields
  const notes = [
    orgTypesStr        ? `Organisation type: ${orgTypesStr}` : "",
    interestsStr       ? `Areas of interest: ${interestsStr}` : "",
    countriesFocus     ? `Countries / regions of focus: ${countriesFocus}` : "",
    menaExperience     ? `MENA experience: ${menaExperience}` : "",
    speakingInterest   ? `Speaking interest: ${speakingInterest}` : "",
    sponsorshipInterest? `Sponsorship interest: ${sponsorshipInterest}` : "",
    bio                ? `Bio: ${bio}` : "",
  ].filter(Boolean).join("\n");

  // Core Notion properties
  const properties = {
    "Full Name & Title": {
      title: [{ text: { content: String(fullName || "—").slice(0, 2000) } }],
    },
    "Company Name": {
      rich_text: [{ text: { content: String(company || "").slice(0, 2000) } }],
    },
    "Job Title": {
      rich_text: [{ text: { content: String(jobTitle || "").slice(0, 2000) } }],
    },
    "Terms Accepted": { checkbox: Boolean(termsAccepted) },
  };

  // Optional properties — only add if values exist
  if (email && String(email).trim()) {
    properties["Email"] = { email: String(email).trim() };
  }
  if (telephone && String(telephone).trim()) {
    properties["Telephone"] = {
      rich_text: [{ text: { content: String(telephone).trim().slice(0, 2000) } }],
    };
  }
  if (linkedin && String(linkedin).trim()) {
    properties["LinkedIn"] = { url: String(linkedin).trim() };
  }
  if (website && String(website).trim()) {
    properties["Website"] = { url: String(website).trim() };
  }
  if (vat && String(vat).trim()) {
    properties["VAT Registration Number"] = {
      rich_text: [{ text: { content: String(vat).trim().slice(0, 2000) } }],
    };
  }
  if (headshotUrl && String(headshotUrl).trim()) {
    properties["Headshot"] = { url: String(headshotUrl).trim() };
  }
  if (notes.trim()) {
    properties["Notes"] = {
      rich_text: [{ text: { content: notes.slice(0, 2000) } }],
    };
  }
  if (applicationDate) {
    properties["Application Date"] = { date: { start: applicationDate } };
  }

  try {
    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: databaseId },
        properties,
      }),
    });

    if (!res.ok) {
      const detail = await res.json().catch(() => ({}));
      console.error("Notion error:", detail);
      return Response.json(
        { error: "We could not save your details. Please try again." },
        { status: 502 }
      );
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Request failed:", err);
    return Response.json(
      { error: "We could not reach the server. Please try again." },
      { status: 500 }
    );
  }
}
