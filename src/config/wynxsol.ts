export interface FounderInfo {
  id: string;
  name: string;
  role: string;
  initials: string;
}

export interface NavRouteItem {
  id: "company" | "restaurant-ai" | "contact";
  label: string;
  to: string;
}

export interface WynxsolConfig {
  companyName: string;
  tagline: string;
  description: string;
  whatsappNumber: string;
  whatsappDefaultMessage: string;
  logoAssetPath: string;
  logoImagePath: string;
  contactEmail: string;
  web3formsAccessKey: string;
  founders: FounderInfo[];
  routes: NavRouteItem[];
}

/**
 * Single source of truth for navigation, WhatsApp CTA, brand logo assets,
 * email delivery, and leadership metadata.
 *
 * HOW TO CONFIGURE WHATSAPP:
 *   Set `whatsappNumber` below using digits only with country code
 *   (no '+' or spaces), e.g.:
 *     whatsappNumber: "923001234567"
 *
 * AUTOMATIC EMAIL DELIVERY (100% FREE):
 *   Uses FormSubmit (`https://formsubmit.co/ajax/<contactEmail>`) by default
 *   with zero backend or API key required (click the one-time activation link
 *   sent to `contactEmail` on the first submission). Optionally set
 *   `web3formsAccessKey` to route via free Web3Forms instead.
 */
export const WYNXSOL_CONFIG: WynxsolConfig = {
  companyName: "WynxSol",
  tagline: "Intelligence, software and systems engineered to move businesses forward.",
  description:
    "WynxSol engineers custom AI systems, dynamic software and intelligent workflows that eliminate manual work and drive measurable growth.",

  whatsappNumber: "923356331253",
  whatsappDefaultMessage: "Hi WynxSol, I'd like to discuss a project.",

  // Official WynxSol geometric WS monogram logo assets
  logoAssetPath: "/assets/wynxsol-logo.svg",
  logoImagePath: "/assets/wynxsol-logo.jpg",

  contactEmail: "wynx.sol@gmail.com",
  web3formsAccessKey: "",

  founders: [
    {
      id: "deepak-raj",
      name: "Deepak Raj",
      role: "CEO & Founder",
      initials: "DR",
    },
    {
      id: "muhammad-measam-raza",
      name: "Muhammad Measam Raza",
      role: "CTO & Co-Founder",
      initials: "MR",
    },
    {
      id: "abdul-mutlib-ali",
      name: "Abdul Mutlib Ali",
      role: "Co-Founder",
      initials: "AM",
    },
  ],

  routes: [
    { id: "company", label: "Company", to: "/#company" },
    { id: "restaurant-ai", label: "Restaurant Intelligence", to: "/restaurant-ai" },
    { id: "contact", label: "Contact", to: "/#contact" },
  ],
};
