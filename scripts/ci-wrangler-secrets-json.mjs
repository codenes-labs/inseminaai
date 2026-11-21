import fs from "node:fs";

const secrets = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
};
for (const k of ["TURNSTILE_SECRET_KEY", "TURNSTILE_SITE_KEY"]) {
  const v = process.env[k]?.trim();
  if (v) secrets[k] = v;
}
fs.writeFileSync("wrangler-secrets.json", JSON.stringify(secrets));