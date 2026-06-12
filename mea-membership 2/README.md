# MEA Corporate Membership Form

A single-page membership application form that saves submissions to a Notion
database, with a payment step at the end (Stripe link added later).

## What is here

- `app/page.js` — the Corporate Membership form
- `app/api/submit/route.js` — the backend that writes to Notion (token stays server-side)
- `app/globals.css` — styling
- `.env.local.example` — template for the two secrets you provide

## Run it on your own computer (optional)

1. Install Node.js (nodejs.org) if you do not have it.
2. In this folder, run: `npm install`
3. Copy `.env.local.example` to `.env.local` and paste in your Notion token and database ID.
4. Run: `npm run dev` then open http://localhost:3000

## Deploy it free on Vercel (recommended)

1. Create a free account at vercel.com (sign in with GitHub, GitLab, or email).
2. Push this folder to a GitHub repository, or drag-and-drop the folder into
   Vercel's "Add New Project" import screen.
3. Before deploying, open Project Settings -> Environment Variables and add:
   - NOTION_TOKEN = your Notion integration secret
   - NOTION_DATABASE_ID = your database ID
4. Click Deploy. Vercel gives you a live URL you can send to members.

The Notion token is only ever stored in Vercel's environment variables. It is
never in the code and never visible to anyone filling in the form.

## Adding Stripe later

In `app/page.js`, find this commented line inside handleSubmit:


    // window.location.href = "https://buy.stripe.com/your-link";

Uncomment it and replace the URL with your Stripe payment link. The form will
save details to Notion first, then send the member straight to payment.
