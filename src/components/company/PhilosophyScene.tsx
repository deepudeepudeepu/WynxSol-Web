import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PHILOSOPHY_PILLARS } from "../../data/company";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function PhilosophyScene() {
  const reducedMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const ghostRailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion || window.innerWidth <= 760) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const target = Math.min(
          PHILOSOPHY_PILLARS.length - 1,
          Math.floor(self.progress * PHILOSOPHY_PILLARS.length)
        );
        setActiveIdx((prev) => (prev !== target ? target : prev));
        if (ghostRailRef.current) {
          ghostRailRef.current.style.transform = `translate3d(${10 - self.progress * 38}%, -50%, 0)`;
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="philosophy-scene"
      id="scene-philosophy"
      data-scene-index="03 | 08"
      aria-labelledby="phil-heading"
    >
      <div className="philosophy-pin">
        <div ref={ghostRailRef} className="phil-ghost-rail" id="phil-ghost-rail" aria-hidden="true">
          <span>INTENT &bull; INTELLIGENCE &bull; EXECUTION &bull; SYSTEMS &bull; PRECISION &bull;</span>
        </div>

        <div className="container">
          <div style={{ textAlign: "center" }}>
            <span className="eyebrow-editorial" id="phil-heading">
              03 // Our Philosophy
            </span>
          </div>

          <div className="phil-pillars">
            {PHILOSOPHY_PILLARS.map((pillar, pIdx) => (
              <article
                key={pillar.id}
                className={`phil-pillar${activeIdx === pIdx ? " is-active" : ""}`}
              >
                <h2 className={`phil-word${pillar.pink ? " phil-word--pink" : ""}`}>
                  {Array.from(pillar.word).map((ch, cIdx) => (
                    <span
                      key={cIdx}
                      className="phil-char"
                      style={{ transitionDelay: `${cIdx * 22}ms` }}
                    >
                      {ch === " " ? "\u00A0" : ch}
                    </span>
                  ))}
                </h2>
                <p className="lead-copy">{pillar.description}</p>
              </article>
            ))}
          </div>

          <div className="phil-pillar-nav" role="tablist" aria-label="Philosophy principles">
            {PHILOSOPHY_PILLARS.map((pillar, idx) => (
              <button
                key={pillar.id}
                type="button"
                role="tab"
                aria-selected={activeIdx === idx}
                className={`phil-dot-btn${activeIdx === idx ? " is-active" : ""}`}
                onClick={() => setActiveIdx(idx)}
              >
                {pillar.tabLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
