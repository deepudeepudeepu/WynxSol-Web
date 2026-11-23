import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WYNXSOL_CONFIG } from "../../config/wynxsol";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function FoundersScene() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion || window.innerWidth <= 640) return;

    const ctx = gsap.context(() => {
      const leftItem = section.querySelector(".founder-editorial-item--left");
      const centerItems = section.querySelectorAll(".founder-editorial-item--center");
      const rightItem = section.querySelector(".founder-editorial-item--right");
      if (leftItem) {
        gsap.fromTo(
          leftItem,
          { x: 28, opacity: 0.35 },
          {
            x: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      }
      if (centerItems.length) {
        gsap.fromTo(
          centerItems,
          { y: 24, opacity: 0.35 },
          {
            y: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      }
      if (rightItem) {
        gsap.fromTo(
          rightItem,
          { x: -28, opacity: 0.35 },
          {
            x: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 35%",
              scrub: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="founders-scene"
      id="scene-founders"
      data-scene-index="07 | 08"
      aria-labelledby="founders-heading"
    >
      <div className="container">
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
            <span className="eyebrow-editorial">07 // The Founders</span>
            <h2 className="serif-display" id="founders-heading" style={{ fontSize: "var(--text-3xl)" }}>
              LEADERSHIP.
            </h2>
          </div>
          <span
            style={{
              fontSize: "12px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--pink)",
            }}
          >
            Pakistan &amp; International Delivery
          </span>
        </div>

        <div className="founders-split">
          {WYNXSOL_CONFIG.founders.map((founder, idx) => {
            const posClass =
              idx === 0
                ? "founder-editorial-item--left"
                : idx === WYNXSOL_CONFIG.founders.length - 1
                ? "founder-editorial-item--right"
                : "founder-editorial-item--center";

            return (
              <article key={founder.id} className={`founder-editorial-item ${posClass}`}>
                <div className="founder-monogram-box">
                  <span>{founder.initials}</span>
                  <span>Portrait Slot</span>
                </div>
                <div className="founder-kinetic-meta" style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--pink)",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {founder.role}
                  </div>
                  <h3
                    className="serif-display"
                    style={{
                      fontSize: "clamp(1.45rem, 2.1vw, 2.3rem)",
                      overflowWrap: "break-word",
                    }}
                  >
                    {founder.name}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
