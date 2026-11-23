/* Tokkey site config — edit this file only.
   STRIPE_URL: your Stripe Payment Link (Dashboard → Payment Links). In that link's settings →
   "After payment" → "Don't show confirmation page" → redirect to:
     https://YOUR-DOMAIN/thanks.html?session_id={CHECKOUT_SESSION_ID}
   Until STRIPE_URL is replaced, every "Get in line / Get early access" button opens thanks.html?demo=1
   so you can preview the full flow. */
window.TOKKEY_CONFIG={
  STRIPE_URL:"https://buy.stripe.com/REPLACE_WITH_PAYMENT_LINK",
  HOME_URL:"index.html",
  CONFETTI_MS:1600,   // how long the confetti plays
  HOLD_MS:1000        // extra pause after it, then back to the homepage
};
