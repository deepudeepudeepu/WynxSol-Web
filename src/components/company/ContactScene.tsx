import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WYNXSOL_CONFIG } from "../../config/wynxsol";
import { useMeeting } from "../../context/MeetingContext";
import { useWhatsApp } from "../../context/WhatsAppContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { sendAutomaticEmail, type EmailDeliveryResult } from "../../utils/emailDelivery";
import { SmartLink } from "../shell/SmartLink";

gsap.registerPlugin(ScrollTrigger);

interface FormErrors {
  name: string;
  email: string;
  company: string;
  desc: string;
}

const EMPTY_ERRORS: FormErrors = { name: "", email: "", company: "", desc: "" };

export function ContactScene() {
  const reducedMotion = useReducedMotion();
  const { openWhatsApp } = useWhatsApp();
  const { openMeetingModal } = useMeeting();

  const sectionRef = useRef<HTMLElement | null>(null);
  const crossMaskRef = useRef<HTMLDivElement | null>(null);
  const emailCopyTimerRef = useRef<number | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [desc, setDesc] = useState("");
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);
  const [latestBrief, setLatestBrief] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<EmailDeliveryResult | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (emailCopyTimerRef.current !== null) {
        window.clearTimeout(emailCopyTimerRef.current);
      }
    };
  }, []);

  const handleCopyEmail = () => {
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    navigator.clipboard.writeText(WYNXSOL_CONFIG.contactEmail).then(() => {
      setEmailCopied(true);
      if (emailCopyTimerRef.current !== null) {
        window.clearTimeout(emailCopyTimerRef.current);
      }
      emailCopyTimerRef.current = window.setTimeout(() => {
        setEmailCopied(false);
      }, 2000);
    });
  };

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const crossMask = crossMaskRef.current;
    if (!section || !crossMask || reducedMotion) return;

    const ctx = gsap.context(() => {
      const bars = crossMask.querySelectorAll("span");
      const contactLines = section.querySelectorAll(".contact-line-3d");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 95%",
          end: "top 22%",
          scrub: true,
        },
      });

      tl.fromTo(crossMask, { opacity: 0.98 }, { opacity: 0.98, duration: 0.45 }, 0).to(
        crossMask,
        { opacity: 0, duration: 0.55 },
        0.45
      );

      if (bars[0]) {
        tl.fromTo(bars[0], { scaleX: 0.004 }, { scaleX: 1, duration: 0.72, ease: "power2.out" }, 0);
      }
      if (bars[1]) {
        tl.fromTo(bars[1], { scaleY: 0.004 }, { scaleY: 1, duration: 0.72, ease: "power2.out" }, 0);
      }
      if (contactLines.length) {
        tl.fromTo(
          contactLines,
          { rotateX: -48, y: 26, opacity: 0.2 },
          { rotateX: 0, y: 0, opacity: 1, stagger: 0.12, duration: 0.5, ease: "power2.out" },
          0.35
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCompany = company.trim();
    const trimmedDesc = desc.trim();

    const nextErrors: FormErrors = {
      name: trimmedName.length >= 2 ? "" : "Please enter your name.",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
        ? ""
        : "Please enter a valid business email.",
      company: trimmedCompany.length >= 2 ? "" : "Please enter your company name.",
      desc: trimmedDesc.length >= 12 ? "" : "Please describe your project (12+ chars).",
    };

    setErrors(nextErrors);

    if (nextErrors.name || nextErrors.email || nextErrors.company || nextErrors.desc) {
      setLatestBrief("");
      setDeliveryResult(null);
      return;
    }

    const briefText = `Hi WynxSol, I'd like to discuss a project.\nName: ${trimmedName}\nEmail: ${trimmedEmail}\nCompany: ${trimmedCompany}\nDetails: ${trimmedDesc}`;

    setIsSubmitting(true);
    const result = await sendAutomaticEmail({
      subject: `[WynxSol Inquiry] ${trimmedCompany} — ${trimmedName}`,
      fromName: trimmedName,
      replyTo: trimmedEmail,
      fields: {
        Name: trimmedName,
        "Business Email": trimmedEmail,
        Company: trimmedCompany,
        "Project Summary": trimmedDesc,
      },
    });

    setDeliveryResult(result);
    setLatestBrief(briefText);
    setIsSubmitting(false);
  };

  return (
    <section
      ref={sectionRef}
      className="contact-scene is-light-surface"
      id="contact"
      data-scene-index="08 | 08"
      aria-labelledby="contact-heading"
    >
      <span id="scene-contact" style={{ position: "absolute", top: 0, left: 0 }} aria-hidden="true" />
      <div ref={crossMaskRef} className="contact-cross-mask" id="contact-cross-mask" aria-hidden="true">
        <span />
        <span />
      </div>

      <div className="container contact-scene__inner">
        <span className="eyebrow-editorial">08 // Contact</span>
        <h2 className="contact-headline" id="contact-heading">
          <span className="contact-line-3d">LET&apos;S BUILD</span>
          <br />
          <span className="contact-line-3d">WHAT&apos;S NEXT.</span>
        </h2>

        <div className="contact-grid">
          <div>
            <p className="lead-copy" style={{ marginBottom: "1.5rem" }}>
              Have a business problem worth automating or an AI product worth engineering? Book a
              consultation call, email us directly, or start on WhatsApp.
            </p>

            <div className="contact-channel-card">
              <div className="contact-channel-row">
                <div>
                  <span className="contact-channel-label">Business Email</span>
                  <a
                    href={`mailto:${WYNXSOL_CONFIG.contactEmail}`}
                    className="contact-channel-email"
                    id="contact-email-link"
                  >
                    {WYNXSOL_CONFIG.contactEmail}
                  </a>
                </div>
                <button
                  type="button"
                  className="btn btn--light-outline btn--sm"
                  id="contact-copy-email"
                  onClick={handleCopyEmail}
                >
                  {emailCopied ? "Copied" : "Copy Email"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <button
                type="button"
                className="btn btn--pink"
                id="contact-book-meeting-btn"
                onClick={() => openMeetingModal()}
              >
                Book a Meeting
              </button>
              <button
                type="button"
                className="btn btn--light-outline"
                onClick={() => openWhatsApp()}
              >
                Contact Us on WhatsApp
              </button>
            </div>
          </div>

          <form id="wynx-contact-form" noValidate onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label" htmlFor="cf-name">
                Name *
              </label>
              <input
                className="form-input"
                type="text"
                id="cf-name"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <span className="form-error" id="err-name" aria-live="polite">
                {errors.name}
              </span>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="cf-email">
                Business Email *
              </label>
              <input
                className="form-input"
                type="email"
                id="cf-email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span className="form-error" id="err-email" aria-live="polite">
                {errors.email}
              </span>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="cf-company">
                Company *
              </label>
              <input
                className="form-input"
                type="text"
                id="cf-company"
                placeholder="Organisation"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <span className="form-error" id="err-company" aria-live="polite">
                {errors.company}
              </span>
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="cf-desc">
                Project Summary *
              </label>
              <textarea
                className="form-textarea"
                id="cf-desc"
                rows={3}
                placeholder="Tell us what you are building..."
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <span className="form-error" id="err-desc" aria-live="polite">
                {errors.desc}
              </span>
            </div>

            <button type="submit" className="btn btn--light-outline" disabled={isSubmitting}>
              {isSubmitting ? "Sending Inquiry..." : "Send Inquiry & Prepare Brief"}
            </button>

            <div
              id="form-result-box"
              hidden={!latestBrief}
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid var(--ink-light)",
                background: "#FFFFFF",
              }}
            >
              {deliveryResult && (
                <div
                  id="contact-delivery-status"
                  role="status"
                  aria-live="polite"
                  className={`contact-delivery-status contact-delivery-status--${
                    deliveryResult.status === "activation_required"
                      ? "activation"
                      : deliveryResult.status
                  }`}
                >
                  {deliveryResult.message}
                </div>
              )}
              <pre
                id="form-summary-preview"
                style={{ whiteSpace: "pre-wrap", fontSize: "12px", marginBottom: "0.75rem" }}
              >
                {latestBrief}
              </pre>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem" }}>
                <button
                  type="button"
                  className="btn btn--pink btn--sm"
                  id="btn-send-brief-wa"
                  onClick={() => {
                    if (latestBrief) openWhatsApp(latestBrief);
                  }}
                >
                  Send via WhatsApp
                </button>
                <a
                  href={`mailto:${WYNXSOL_CONFIG.contactEmail}?subject=${encodeURIComponent(
                    `WynxSol Project Brief — ${company.trim()}`
                  )}&body=${encodeURIComponent(latestBrief)}`}
                  className="btn btn--light-outline btn--sm"
                  id="btn-send-brief-email"
                >
                  Open in Email App
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>

      <footer className="footer-monolith">
        <div className="footer-wordmark" aria-hidden="true">
          WYNXSOL
        </div>
        <div
          className="container"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            fontSize: "12px",
            color: "var(--text-white-dim)",
          }}
        >
          <span>&copy; 2026 WynxSol. Intelligence, Engineered.</span>
          <a
            href={`mailto:${WYNXSOL_CONFIG.contactEmail}`}
            id="footer-email-link"
            style={{ color: "var(--text-white-muted)", textDecoration: "underline" }}
          >
            {WYNXSOL_CONFIG.contactEmail}
          </a>
          <SmartLink to="/restaurant-ai" className="text-pink">
            Enter Restaurant Intelligence Simulation &rarr;
          </SmartLink>
        </div>
      </footer>
    </section>
  );
}
