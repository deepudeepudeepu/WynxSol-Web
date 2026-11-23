import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WYNXSOL_CONFIG } from "../../config/wynxsol";
import { useNavigation } from "../../context/NavigationContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

export function OpeningScene() {
  const reducedMotion = useReducedMotion();
  const { triggerHudSync } = useNavigation();
  const [isDarkPhase, setIsDarkPhase] = useState(false);

  const wrapRef = useRef<HTMLElement | null>(null);
  const veilRef = useRef<HTMLDivElement | null>(null);
  const footerRowRef = useRef<HTMLDivElement | null>(null);
  const wynxWordRef = useRef<HTMLSpanElement | null>(null);
  const solWordRef = useRef<HTMLSpanElement | null>(null);
  const mcWRef = useRef<HTMLSpanElement | null>(null);
  const mcSRef = useRef<HTMLSpanElement | null>(null);
  const wordGapRef = useRef<HTMLSpanElement | null>(null);
  const wsSvgRef = useRef<SVGSVGElement | null>(null);
  const pieceW1Ref = useRef<SVGPathElement | null>(null);
  const pieceW2Ref = useRef<SVGPathElement | null>(null);
  const pieceSRef = useRef<SVGPathElement | null>(null);
  const logoFinalRef = useRef<HTMLDivElement | null>(null);
  const logoStageRef = useRef<HTMLDivElement | null>(null);
  const portalMaskRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    triggerHudSync();
  }, [isDarkPhase, triggerHudSync]);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (reducedMotion) {
      setIsDarkPhase(false);
      return;
    }

    const isMobile = window.innerWidth <= 760;

    const ctx = gsap.context(() => {
      const foldChars = wrap.querySelectorAll(".morph-char--fold");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.45,
          onUpdate: (self) => {
            const dark = self.progress >= 0.24;
            setIsDarkPhase((prev) => (prev !== dark ? dark : prev));
          },
        },
      });

      tl.to(
        foldChars,
        {
          scaleX: 0.06,
          scaleY: 1.4,
          skewX: -22,
          x: isMobile ? -14 : -26,
          opacity: 0,
          stagger: 0.02,
          duration: 0.26,
          ease: "power2.in",
        },
        0
      )
        .to(
          wordGapRef.current,
          {
            width: 0,
            duration: 0.24,
            ease: "power2.inOut",
          },
          0.04
        )
        .to(
          wynxWordRef.current,
          {
            x: isMobile ? 22 : 52,
            duration: 0.32,
            ease: "power2.inOut",
          },
          0.04
        )
        .to(
          solWordRef.current,
          {
            x: isMobile ? -34 : -84,
            duration: 0.32,
            ease: "power2.inOut",
          },
          0.04
        )
        .to(
          [mcWRef.current, mcSRef.current],
          {
            skewX: -26,
            scaleY: 1.24,
            scaleX: 0.88,
            duration: 0.28,
            ease: "power2.inOut",
          },
          0.08
        )
        .to(
          footerRowRef.current,
          {
            opacity: 0,
            y: -18,
            duration: 0.2,
          },
          0.02
        );

      tl.fromTo(
        veilRef.current,
        { opacity: 0, clipPath: "circle(0% at 50% 50%)" },
        { opacity: 1, clipPath: "circle(145% at 50% 50%)", duration: 0.34, ease: "power2.inOut" },
        0.12
      );

      tl.fromTo(wsSvgRef.current, { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.24)
        .fromTo(
          pieceW1Ref.current,
          { x: -120, y: 40, scale: 0.72, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" },
          0.26
        )
        .fromTo(
          pieceW2Ref.current,
          { x: 0, y: -95, scale: 0.72, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" },
          0.28
        )
        .fromTo(
          pieceSRef.current,
          { x: 120, y: 40, scale: 0.72, opacity: 0 },
          { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.3, ease: "power3.out" },
          0.3
        )
        .to(
          [mcWRef.current, mcSRef.current],
          {
            opacity: 0,
            scale: 0.76,
            duration: 0.22,
            ease: "power2.out",
          },
          0.34
        );

      tl.to(
        wsSvgRef.current,
        {
          opacity: 0,
          scale: 1.04,
          duration: 0.2,
        },
        0.52
      ).fromTo(
        logoFinalRef.current,
        { opacity: 0, scale: 0.88, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.24, ease: "power2.out" },
        0.48
      );

      tl.to(
        logoStageRef.current,
        {
          scale: isMobile ? 3.2 : 4.8,
          opacity: 0,
          duration: 0.22,
          ease: "power2.in",
        },
        0.78
      ).fromTo(portalMaskRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18 }, 0.82);
    }, wrapRef);

    return () => {
      ctx.revert();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={wrapRef}
      className={`opening-wrap${isDarkPhase ? "" : " is-light-surface"}`}
      id="company"
      data-scene-index="01 | 08"
      aria-labelledby="opening-heading"
      style={reducedMotion ? { height: "auto" } : undefined}
    >
      <span id="scene-opening" style={{ position: "absolute", top: 0, left: 0 }} aria-hidden="true" />
      <div className="opening-pin">
        <svg className="opening-diag" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
          <line x1="120" y1="0" x2="1320" y2="900" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
          <line x1="1320" y1="0" x2="120" y2="900" stroke="rgba(255,205,255,0.22)" strokeWidth="1" />
        </svg>

        <div
          ref={veilRef}
          className="opening-dark-veil"
          id="opening-dark-veil"
          aria-hidden="true"
          style={reducedMotion ? { opacity: 0 } : undefined}
        />

        <div className="opening-stage" id="opening-stage">
          <span
            className="eyebrow-editorial opening-kicker"
            id="opening-kicker"
            style={isDarkPhase ? { color: "var(--pink)" } : undefined}
          >
            01 // Engineering Studio
          </span>

          <div className="opening-morph-arena">
            <h1
              className="opening-wynxsol-title"
              id="opening-heading"
              aria-label="Wynx Sol"
              style={reducedMotion ? { position: "relative", marginBottom: "1rem" } : undefined}
            >
              <span ref={wynxWordRef} className="morph-word morph-word--left" id="morph-word-wynx">
                <span ref={mcWRef} className="morph-char morph-char--primary" id="mc-W">
                  W
                </span>
                <span className="morph-char morph-char--fold" data-fold="left">
                  y
                </span>
                <span className="morph-char morph-char--fold" data-fold="left">
                  n
                </span>
                <span className="morph-char morph-char--fold" data-fold="left">
                  x
                </span>
              </span>
              <span ref={wordGapRef} className="morph-word-gap" id="morph-word-gap" aria-hidden="true">
                &nbsp;
              </span>
              <span ref={solWordRef} className="morph-word morph-word--right" id="morph-word-sol">
                <span ref={mcSRef} className="morph-char morph-char--primary" id="mc-S">
                  S
                </span>
                <span className="morph-char morph-char--fold" data-fold="right">
                  o
                </span>
                <span className="morph-char morph-char--fold" data-fold="right">
                  l
                </span>
              </span>
            </h1>

            <div ref={logoStageRef} className="opening-logo-stage" id="opening-logo-stage" aria-hidden="true">
              <svg
                ref={wsSvgRef}
                className="opening-ws-svg"
                id="opening-ws-svg"
                viewBox="248 158 522 230"
                fill="none"
                style={reducedMotion ? { opacity: 0 } : undefined}
              >
                <defs>
                  <linearGradient
                    id="stageChrome"
                    x1="260"
                    y1="165"
                    x2="740"
                    y2="375"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="28%" stopColor="#D4DCE6" />
                    <stop offset="52%" stopColor="#535D6C" />
                    <stop offset="76%" stopColor="#EEF2F7" />
                    <stop offset="100%" stopColor="#A6B0C2" />
                  </linearGradient>
                </defs>
                <path
                  ref={pieceW1Ref}
                  id="ws-piece-w1"
                  d="M 272 181 L 333 181 L 425 324 L 496 324 L 509 336 L 486 364 L 388 364 Z"
                  fill="url(#stageChrome)"
                  stroke="#FFCDFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  ref={pieceW2Ref}
                  id="ws-piece-w2"
                  d="M 416 268 L 464 183 L 494 183 L 575 314 L 545 356 L 479 257 L 443 308 Z"
                  fill="url(#stageChrome)"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  ref={pieceSRef}
                  id="ws-piece-s"
                  d="M 595 182 L 717 182 L 745 217 L 624 217 L 616 226 L 713 313 L 678 364 L 560 364 L 589 324 L 658 324 L 661 315 L 560 223 Z"
                  fill="url(#stageChrome)"
                  stroke="#FFCDFF"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>

              <div
                ref={logoFinalRef}
                className="opening-logo-final"
                id="opening-logo-final"
                style={reducedMotion ? { opacity: 1, transform: "none" } : undefined}
              >
                <img
                  src={WYNXSOL_CONFIG.logoImagePath}
                  alt="WynxSol official WS emblem"
                  className="opening-logo-photo"
                />
                <div className="opening-logo-caption">
                  <span className="opening-logo-wordmark">WYNXSOL</span>
                  <span className="opening-logo-subhead">WE BUILD WHAT COMES NEXT.</span>
                </div>
              </div>
            </div>
          </div>

          <div ref={footerRowRef} className="opening-footer-row" id="opening-footer-row">
            <p className="opening-sub">
              Intelligence, software and systems engineered to move businesses forward.
            </p>
            <span className="opening-scroll-cue" id="opening-scroll-cue">
              Scroll to transform &darr;
            </span>
          </div>
        </div>

        <div
          ref={portalMaskRef}
          className="opening-portal-mask"
          id="opening-portal-mask"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
