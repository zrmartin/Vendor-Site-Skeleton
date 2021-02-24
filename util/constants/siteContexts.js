const SITE_CONTEXTS = {
  PROD: "PROD",
  LOCAL: "LOCAL"
};
Object.freeze(SITE_CONTEXTS)

const SITE_CONTEXT = process.env.NEXT_PUBLIC_SITE_URL.includes("localhost") ? SITE_CONTEXTS.LOCAL : SITE_CONTEXTS.PROD

module.exports = {
  SITE_CONTEXTS,
  SITE_CONTEXT
}
