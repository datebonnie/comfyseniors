#!/usr/bin/env node
/**
 * Idempotent Stripe product + price setup for ComfySeniors.
 *
 * Creates (or finds existing) the 4 subscription products the site
 * needs, then prints a paste-ready block of env vars for .env.local
 * and Vercel.
 *
 * Idempotency:
 *   Each price is identified by a stable lookup_key. Running this
 *   script twice does NOT create duplicates — on the second run it
 *   just finds the existing prices and prints the same IDs.
 *
 * Safety:
 *   - Reads STRIPE_SECRET_KEY from .env.local ONLY (never prints it).
 *   - Test-mode keys (sk_test_) create test-mode products. Live-mode
 *     keys (sk_live_) create real billable products. The script
 *     announces which mode it's in before making any changes and
 *     waits 3 seconds for you to Ctrl-C if that's wrong.
 *
 * Usage:
 *   cd scripts
 *   node setup_stripe_products.mjs
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");

// ─── Load STRIPE_SECRET_KEY from .env.local ────────────────
function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error(`ERROR: ${envPath} not found.`);
    process.exit(1);
  }
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const apiKey = env.STRIPE_SECRET_KEY;

if (!apiKey) {
  console.error(`
ERROR: STRIPE_SECRET_KEY is empty in .env.local.

  1. Go to https://dashboard.stripe.com/apikeys (or
     https://dashboard.stripe.com/test/apikeys for test mode)
  2. Click "Reveal secret key" next to the secret key row
  3. Copy it into .env.local:

       STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxx

  4. Re-run this script.
`);
  process.exit(1);
}

const mode = apiKey.startsWith("sk_test_")
  ? "TEST"
  : apiKey.startsWith("sk_live_")
    ? "LIVE"
    : "UNKNOWN";

console.log(`\n🔑 Stripe mode: ${mode}`);
if (mode === "LIVE") {
  console.log(
    "⚠️  You are about to create LIVE billable products. Waiting 3 seconds — Ctrl-C to abort."
  );
  await new Promise((r) => setTimeout(r, 3000));
}

const stripe = new Stripe(apiKey, { apiVersion: "2024-06-20" });

// ─── Products we need ──────────────────────────────────────
// Each entry defines a product + 1+ recurring prices. Prices are
// identified by `lookup_key` for idempotent re-runs.
const PLANS = [
  {
    productName: "ComfySeniors Verified",
    productDescription:
      "Flat-fee verified listing for Bergen County senior care facilities. Removes 'Not Verified' warning. No placement fees, ever. Cancel anytime.",
    prices: [
      {
        envVar: "STRIPE_VERIFIED_MONTHLY_PRICE_ID",
        lookupKey: "comfyseniors_verified_monthly",
        amountCents: 29700,
        interval: "month",
        nickname: "Verified Monthly ($297/mo)",
      },
      {
        envVar: "STRIPE_VERIFIED_ANNUAL_PRICE_ID",
        lookupKey: "comfyseniors_verified_annual",
        amountCents: 297000, // $2,970/year = 2 months free vs monthly
        interval: "year",
        nickname: "Verified Annual ($2,970/yr, 2 months free)",
      },
    ],
  },
  {
    productName: "ComfySeniors Medicare/Medicaid Listing",
    productDescription:
      "Flat monthly listing for Bergen County facilities accepting Medicare and/or Medicaid. No placement fees — built for reimbursement-capped operators.",
    prices: [
      {
        envVar: "STRIPE_MEDICAID_MONTHLY_PRICE_ID",
        lookupKey: "comfyseniors_medicaid_monthly",
        amountCents: 39700,
        interval: "month",
        nickname: "Medicare/Medicaid Listing Monthly ($397/mo)",
      },
    ],
  },
  {
    productName: "ComfySeniors Claim",
    productDescription:
      "Basic verified listing for Bergen County senior care facilities. Removes 'Not Verified' warning. Includes verified badge, basic profile, and review responses.",
    prices: [
      {
        envVar: "STRIPE_CLAIM_MONTHLY_PRICE_ID",
        lookupKey: "comfyseniors_claim_monthly",
        amountCents: 9700,
        interval: "month",
        nickname: "Claim Monthly ($97/mo)",
      },
    ],
  },
  {
    productName: "ComfySeniors Founding Member",
    productDescription:
      "Founding Member pricing — first 20 Bergen County facilities. Locks in $197/month for the life of the subscription, includes everything in Grow, plus the Founding Partner badge and direct-to-founder feedback line.",
    prices: [
      {
        envVar: "STRIPE_FOUNDING_MONTHLY_PRICE_ID",
        lookupKey: "comfyseniors_founding_monthly",
        amountCents: 19700,
        interval: "month",
        nickname: "Founding Monthly ($197/mo)",
      },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────
async function findProductByName(name) {
  // Stripe's search API is powerful but has a short lag after creation.
  // For idempotency across reruns we use `list` with pagination
  // (100/page) and filter by name — small catalog, always fast.
  for await (const product of stripe.products.list({ limit: 100, active: true })) {
    if (product.name === name) return product;
  }
  return null;
}

async function findPriceByLookupKey(lookupKey) {
  const res = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  return res.data[0] || null;
}

// ─── Main ──────────────────────────────────────────────────
const results = {}; // { envVar: priceId }

for (const plan of PLANS) {
  console.log(`\n━━━ ${plan.productName} ━━━`);

  let product = await findProductByName(plan.productName);
  if (product) {
    console.log(`  ✓ product exists: ${product.id}`);
  } else {
    product = await stripe.products.create({
      name: plan.productName,
      description: plan.productDescription,
    });
    console.log(`  + product created: ${product.id}`);
  }

  for (const p of plan.prices) {
    const existing = await findPriceByLookupKey(p.lookupKey);
    if (existing) {
      console.log(`  ✓ ${p.nickname} exists: ${existing.id}`);
      results[p.envVar] = existing.id;
    } else {
      const newPrice = await stripe.prices.create({
        product: product.id,
        currency: "usd",
        unit_amount: p.amountCents,
        recurring: { interval: p.interval },
        lookup_key: p.lookupKey,
        nickname: p.nickname,
      });
      console.log(`  + ${p.nickname} created: ${newPrice.id}`);
      results[p.envVar] = newPrice.id;
    }
  }
}

// ─── Print env block ───────────────────────────────────────
console.log(`\n━━━ ADD TO .env.local AND VERCEL (${mode} MODE) ━━━\n`);
for (const [k, v] of Object.entries(results)) {
  console.log(`${k}=${v}`);
}

console.log(`\nNext steps:
  1. Copy the env vars above into .env.local (replace any blank
     or outdated Stripe price ID lines).
  2. Add the same vars in Vercel:
     https://vercel.com/<your-team>/comfyseniors/settings/environment-variables
  3. Redeploy (Vercel usually auto-triggers on env-var change).
  4. Smoke test each tier by clicking its CTA on /for-facilities
     (and /for-facilities/medicaid for the M/M tier).
`);

if (mode === "TEST") {
  console.log(
    `ℹ  These are TEST-mode products. Re-run this script with a live\n` +
      `   STRIPE_SECRET_KEY (sk_live_…) once you flip to live mode.\n`
  );
}
