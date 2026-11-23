import { useMeeting } from "../../context/MeetingContext";
import { useWhatsApp } from "../../context/WhatsAppContext";
import { SmartLink } from "../shell/SmartLink";

export function RestaurantCtaSection() {
  const { openWhatsApp } = useWhatsApp();
  const { openMeetingModal } = useMeeting();

  return (
    <section
      className="restaurant-cta-monolith"
      id="restaurant-cta"
      data-scene-index="CH 03 | 03"
      aria-labelledby="rest-cta-heading"
    >
      <div className="container">
        <span className="eyebrow-editorial" style={{ color: "var(--pink)" }}>
          Deploy Hospitality Vision
        </span>
        <h2
          className="serif-display"
          id="rest-cta-heading"
          style={{
            fontSize: "clamp(2.5rem, 6.2vw, 5.8rem)",
            textTransform: "uppercase",
            maxWidth: "14ch",
          }}
        >
          BRING FLOOR VISIBILITY TO YOUR RESTAURANT.
        </h2>
        <p className="lead-copy" style={{ marginTop: "1.1rem", maxWidth: "52ch" }}>
          Interested in piloting Restaurant Intelligence or building custom computer vision workflows
          for your venues? Book a demo call or reach us directly at{" "}
          <a href="mailto:wynx.sol@gmail.com" className="text-pink" style={{ textDecoration: "underline" }}>
            wynx.sol@gmail.com
          </a>
          .
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.85rem", marginTop: "2rem" }}>
          <button
            type="button"
            className="btn btn--pink"
            id="rest-book-meeting-btn"
            onClick={() => openMeetingModal("Restaurant Intelligence Demo")}
          >
            Book a Meeting
          </button>
          <button
            type="button"
            className="btn btn--dark-outline"
            onClick={() =>
              openWhatsApp(
                "Hi WynxSol, I'd like to discuss piloting Restaurant Intelligence for my restaurant."
              )
            }
          >
            Discuss Restaurant Intelligence on WhatsApp
          </button>
          <SmartLink to="/#contact" className="btn btn--dark-outline">
            Go to Project Brief &amp; Contact
          </SmartLink>
          <SmartLink to="/#company" className="btn btn--dark-outline">
            &larr; Return to Company
          </SmartLink>
        </div>
      </div>
    </section>
  );
}
