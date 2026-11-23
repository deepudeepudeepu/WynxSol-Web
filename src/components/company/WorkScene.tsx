import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useWhatsApp } from "../../context/WhatsAppContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { SmartLink } from "../shell/SmartLink";

gsap.registerPlugin(ScrollTrigger);

export function WorkScene() {
  const reducedMotion = useReducedMotion();
  const { openWhatsApp } = useWhatsApp();
  const sectionRef = useRef<HTMLElement | null>(null);
  const maskRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const mask = maskRef.current;
    if (!section || !mask || reducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mask,
        { scale: 0.88, opacity: 0.25 },
        {
          scale: 1,
          opacity: 1,
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            end: "top 30%",
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="work-scene"
      id="scene-work"
      data-scene-index="05 | 08"
      aria-labelledby="work-heading"
    >
      <div className="container">
        <div ref={maskRef} className="work-type-mask" id="work-type-mask" aria-hidden="true">
          <svg className="work-mask-svg" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="workTelemetryGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect width="40" height="40" fill="#08080C" />
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,205,255,0.28)" strokeWidth="1" />
                <circle cx="20" cy="20" r="2.2" fill="#FFCDFF" />
              </pattern>
              <mask id="createTextMask">
                <rect width="1200" height="220" fill="#000000" />
                <text
                  x="600"
                  y="178"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="Switzer, sans-serif"
                  fontWeight="800"
                  fontSize="188"
                  letterSpacing="-6"
                >
                  CREATE
                </text>
              </mask>
            </defs>
            <rect width="1200" height="220" fill="url(#workTelemetryGrid)" mask="url(#createTextMask)" />
            <text
              x="600"
              y="178"
              textAnchor="middle"
              fill="none"
              stroke="rgba(255,205,255,0.4)"
              strokeWidth="1.2"
              fontFamily="Switzer, sans-serif"
              fontWeight="800"
              fontSize="188"
              letterSpacing="-6"
            >
              CREATE
            </text>
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "1.5rem",
          }}
        >
          <div>
            <span className="eyebrow-editorial">05 // Conceptual Demonstrations</span>
            <h2 className="serif-display" id="work-heading" style={{ fontSize: "var(--text-3xl)" }}>
              WHAT WE CREATE.
            </h2>
          </div>
          <p className="body-copy" style={{ fontSize: "13px", maxWidth: "40ch" }}>
            Clearly labelled conceptual engineering demonstrations built by WynxSol—zero fabricated
            client metrics or fake deployments.
          </p>
        </div>

        <div className="work-track">
          <article className="work-editorial-piece">
            <div className="work-visual-frame">
              <span style={{ fontSize: "11px", color: "var(--pink)", fontWeight: 600 }}>
                CONCEPT 01 // FLAGSHIP PRODUCT
              </span>
              <div className="work-mini-floor" aria-hidden="true">
                <div className="work-mini-node">T-01 Attended</div>
                <div className="work-mini-node is-alert">T-04 15m Alert</div>
                <div className="work-mini-node">T-03 Ready</div>
                <div className="work-mini-node is-cleaning">T-06 Cleaning</div>
              </div>
              <h3 className="serif-display" style={{ fontSize: "1.85rem" }}>
                Restaurant Intelligence
              </h3>
            </div>
            <div>
              <p className="body-copy" style={{ fontSize: "14px", marginBottom: "1rem" }}>
                Computer vision concept turning authorised dining camera feeds into live table status,
                15-minute waiter alerts and cleaning coordination.
              </p>
              <SmartLink to="/restaurant-ai" className="btn btn--pink btn--sm">
                Enter Interactive Simulation &rarr;
              </SmartLink>
            </div>
          </article>

          <article className="work-editorial-piece">
            <div className="work-visual-frame">
              <span style={{ fontSize: "11px", color: "var(--text-white-dim)", fontWeight: 600 }}>
                CONCEPT 02 // AGENTIC WORKFLOW
              </span>
              <div className="work-mini-pipeline" aria-hidden="true">
                <span>Event Trigger</span>
                <span className="text-pink">&rarr;</span>
                <span>Agent Plan</span>
                <span className="text-pink">&rarr;</span>
                <span>Verified Output</span>
              </div>
              <h3 className="serif-display" style={{ fontSize: "1.85rem" }}>
                Autonomous Pipeline Engine
              </h3>
            </div>
            <div>
              <p className="body-copy" style={{ fontSize: "14px", marginBottom: "1rem" }}>
                Conceptual multi-agent routing architecture eliminating repetitive spreadsheet audits
                and manual operational follow-ups.
              </p>
              <SmartLink to="/#scene-capabilities" className="btn btn--dark-outline btn--sm">
                Inspect Capability Matrix &uarr;
              </SmartLink>
            </div>
          </article>

          <article className="work-editorial-piece">
            <div className="work-visual-frame">
              <span style={{ fontSize: "11px", color: "var(--text-white-dim)", fontWeight: 600 }}>
                CONCEPT 03 // INFRASTRUCTURE
              </span>
              <div className="work-mini-mesh" aria-hidden="true">
                <span>POS</span>
                <span className="work-mesh-pulse text-pink">&harr; Webhook Bus &harr;</span>
                <span>Console</span>
              </div>
              <h3 className="serif-display" style={{ fontSize: "1.85rem" }}>
                Unified Telemetry Mesh
              </h3>
            </div>
            <div>
              <p className="body-copy" style={{ fontSize: "14px", marginBottom: "1rem" }}>
                Real-time webhook and integration layer uniting point-of-sale terminals, booking
                records and executive dashboards.
              </p>
              <button
                type="button"
                className="btn btn--dark-outline btn--sm"
                onClick={() => openWhatsApp()}
              >
                Discuss Architecture
              </button>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
