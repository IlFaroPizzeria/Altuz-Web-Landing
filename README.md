# Altuz website

Static website for Altuz (Drop 001): the headlight entrance, the membership card, the glass panels, the admission form (stored in Supabase), the cloakroom ticket (cookie consent) and the legal pages. No build step: Vercel serves the files as they are.

## Structure

| Path | What it is |
|---|---|
| `index.html` | The landing |
| `legal.html`, `privacy.html`, `cookies.html` | Legal notice, privacy policy, cookies (English and Spanish) |
| `404.html` | "This door is closed." |
| `assets/js/config.js` | Public settings: Supabase URL and public key, analytics and pixels |
| `assets/js/site.js` | Landing logic |
| `assets/js/consent.js` | Cloakroom ticket and legal menu |
| `supabase/schema.sql` | Table, security rules and the number-demand view |
| `vercel.json` | Clean URLs, security headers, cache |

## Setup

1. **Supabase.** Create a project in an EU region. In SQL Editor, run `supabase/schema.sql`. Copy the project URL and the publishable (or legacy anon) key into `assets/js/config.js`. That key is public by design: the database only lets it insert requests.
2. **Vercel.** Import this repository at vercel.com/new (framework preset: Other, no build command). Every push to `main` deploys.
3. **Domain.** Add your domain in Vercel > Settings > Domains, then replace `https://altuz.vercel.app` in the canonical tags, `sitemap.xml` and `robots.txt`.
4. **Footfall (optional).** Turn on Web Analytics in the Vercel project. It only loads for visitors who allow "Footfall" and uses no cookies.
5. **Invitations (optional).** Put your Meta and/or TikTok pixel IDs in `config.js`. They only load for visitors who allow "Invitations". Update the cookies page when you do.
6. **Legal.** Fill in the highlighted placeholders in the legal pages (NIF/NIE, address, email provider, Supabase region) before sharing the site publicly.

## Reading the requests

Supabase > Table Editor > `admission_requests`. Change `status` to `admitted` or `declined` as you review. The `number_demand` view shows how many people asked for each number.

Paso a paso en español: `PUBLICAR.md`.
