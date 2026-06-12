// Server-side only. The Notion token lives in process.env, never in the browser.

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
    fullName, companyName, jobTitle, telephone, email,
    website, vat, applicationDate, termsAccepted,
  } = body;

  // Server-side validation mirrors the form.
  if (!fullName || !companyName || !jobTitle || !telephone || !email || !applicationDate || !termsAccepted) {
    return Response.json({ error: "Required fields are missing." }, { status: 400 });
  }

  // Property names MUST match the Notion column names exactly.
  const properties = {
    "Full Name & Title": {
      title: [{ text: { content: String(fullName).slice(0, 2000) } }],
    },
    "Company Name": {
      rich_text: [{ text: { content: String(companyName).slice(0, 2000) } }],
    },
    "Job Title": {
      rich_text: [{ text: { content: String(jobTitle).slice(0, 2000) } }],
    },
    "Telephone": {
      rich_text: [{ text: { content: String(telephone).slice(0, 2000) } }],
    },
    "Email": { email: String(email) },
    "Terms Accepted": { checkbox: Boolean(termsAccepted) },
    "Application Date": { date: { start: applicationDate } },
  };

  if (website && String(website).trim()) {
    properties["Website"] = { url: String(website).trim() };
  }
  if (vat && String(vat).trim()) {
    properties["VAT Registration Number"] = {
      rich_text: [{ text: { content: String(vat).trim().slice(0, 2000) } }],
    };
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
