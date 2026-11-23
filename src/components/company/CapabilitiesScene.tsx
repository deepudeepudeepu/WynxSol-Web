import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CAPABILITIES, type CapabilityItem } from "../../data/company";
import { useNavigation } from "../../context/NavigationContext";
import { useWhatsApp } from "../../context/WhatsAppContext";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(ScrollTrigger);

interface TopologyLinkGeometry {
  id: string;
  tx: number;
  ty: number;
}

interface TopologySnapshot {
  width: number;
  height: number;
  ax: number;
  ay: number;
  links: TopologyLinkGeometry[];
}

export function CapabilitiesScene() {
  const reducedMotion = useReducedMotion();
  const { stopScroll, startScroll } = useNavigation();
  const { openWhatsApp } = useWhatsApp();

  const [activeId, setActiveId] = useState<string>(CAPABILITIES[0].id);
  const [demoExecuted, setDemoExecuted] = useState<boolean>(true);
  const [spatialMounted, setSpatialMounted] = useState<boolean>(false);
  const [spatialOpen, setSpatialOpen] = useState<boolean>(false);
  const [topology, setTopology] = useState<TopologySnapshot | null>(null);

  const sectionRef = useRef<HTMLElement | null>(null);
  const matrixWrapRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeTimerRef = useRef<number | null>(null);

  const activeCap: CapabilityItem =
    CAPABILITIES.find((c) => c.id === activeId) || CAPABILITIES[0];

  const linkedCapabilities: CapabilityItem[] = activeCap.links
    .map((id) => CAPABILITIES.find((c) => c.id === id))
    .filter((item): item is CapabilityItem => Boolean(item));

  const recomputeTopology = useCallback(() => {
    const wrap = matrixWrapRef.current;
    const activeBtn = nodeRefs.current[activeCap.id];
    if (!wrap || !activeBtn) return;

    const wRect = wrap.getBoundingClientRect();
    if (!wRect.width || !wRect.height) return;

    const aRect = activeBtn.getBoundingClientRect();
    const ax = aRect.left - wRect.left + aRect.width / 2;
    const ay = aRect.top - wRect.top + aRect.height / 2;

    const links: TopologyLinkGeometry[] = [];
    activeCap.links.forEach((id) => {
      const tBtn = nodeRefs.current[id];
      if (!tBtn) return;
      const tRect = tBtn.getBoundingClientRect();
      links.push({
        id,
        tx: tRect.left - wRect.left + tRect.width / 2,
        ty: tRect.top - wRect.top + tRect.height / 2,
      });
    });

    setTopology({
      width: wRect.width,
      height: wRect.height,
      ax,
      ay,
      links,
    });
  }, [activeCap]);

  useLayoutEffect(() => {
    const rafId = window.requestAnimationFrame(recomputeTopology);
    return () => window.cancelAnimationFrame(rafId);
  }, [recomputeTopology]);

  useEffect(() => {
    const wrap = matrixWrapRef.current;
    window.addEventListener("resize", recomputeTopology);

    let ro: ResizeObserver | null = null;
    if (wrap && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(recomputeTopology);
      ro.observe(wrap);
    }

    return () => {
      window.removeEventListener("resize", recomputeTopology);
      ro?.disconnect();
    };
  }, [recomputeTopology]);

  // Kinetic heading rails
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const ctx = gsap.context(() => {
      const leftRail = section.querySelector(".cap-rail-line--left");
      const rightRail = section.querySelector(".cap-rail-line--right");
      if (leftRail) {
        gsap.fromTo(
          leftRail,
          { x: -48, opacity: 0.35 },
          {
            x: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 30%",
              scrub: true,
            },
          }
        );
      }
      if (rightRail) {
        gsap.fromTo(
          rightRail,
          { x: 48, opacity: 0.35 },
          {
            x: 0,
            opacity: 1,
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              end: "top 30%",
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

  const openSpatial = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSpatialMounted(true);
    stopScroll();
    window.requestAnimationFrame(() => {
      setSpatialOpen(true);
    });
  }, [stopScroll]);

  const closeSpatial = useCallback(() => {
    setSpatialOpen(false);
    startScroll();
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = window.setTimeout(() => {
      setSpatialMounted(false);
    }, 320);
  }, [startScroll]);

  useEffect(() => {
    if (!spatialOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSpatial();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [spatialOpen, closeSpatial]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      startScroll();
    };
  }, [startScroll]);

  const handleSelectCapability = (id: string) => {
    setActiveId(id);
    setDemoExecuted(false);
  };

  return (
    <section
      ref={sectionRef}
      className="capabilities-scene is-light-surface"
      id="scene-capabilities"
      data-scene-index="04 | 08"
      aria-labelledby="cap-heading"
    >
      <div className="container">
        <span className="eyebrow-editorial">04 // What We Build</span>
        <h2
          className="serif-display cap-kinetic-heading"
          id="cap-heading"
          style={{ fontSize: "var(--text-3xl)", maxWidth: "15ch" }}
        >
          <span className="cap-rail-line cap-rail-line--left">SIX INTERCONNECTED</span>
          <span className="cap-rail-line cap-rail-line--right">DISCIPLINES.</span>
        </h2>

        <div className="cap-system-board" id="cap-system-board">
          <div ref={matrixWrapRef} className="cap-matrix-wrap">
            <svg
              className="cap-topology-svg"
              id="cap-topology-svg"
              viewBox={topology ? `0 0 ${topology.width} ${topology.height}` : undefined}
              aria-hidden="true"
            >
              {topology && (
                <>
                  {topology.links.map((lnk) => (
                    <g key={lnk.id}>
                      <line
                        x1={topology.ax}
                        y1={topology.ay}
                        x2={lnk.tx}
                        y2={lnk.ty}
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        opacity="0.28"
                      />
                      <circle
                        cx={lnk.tx}
                        cy={lnk.ty}
                        r="4"
                        fill="#FFCDFF"
                        stroke="#000000"
                        strokeWidth="1.2"
                      />
                    </g>
                  ))}
                  <circle cx={topology.ax} cy={topology.ay} r="5" fill="#000000" />
                </>
              )}
            </svg>

            <div className="cap-matrix-map" id="cap-matrix-map">
              {CAPABILITIES.map((item) => {
                const isCurrent = item.id === activeCap.id;
                const isLinked = activeCap.links.includes(item.id);
                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      nodeRefs.current[item.id] = el;
                    }}
                    type="button"
                    className={`cap-node ${isCurrent ? "is-active" : isLinked ? "is-linked" : ""}`}
                    aria-pressed={isCurrent}
                    onClick={() => handleSelectCapability(item.id)}
                  >
                    <span className="cap-node__idx">
                      {item.index} {isLinked ? "// LINKED" : ""}
                    </span>
                    <span className="cap-node__title">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cap-inspector-pane" id="cap-inspector-pane" aria-live="polite">
            <div>
              <span className="eyebrow-editorial" style={{ marginBottom: "0.5rem" }}>
                Capability {activeCap.index} // Connected System
              </span>
              <h3 className="serif-display" style={{ fontSize: "var(--text-2xl)", marginBottom: "0.85rem" }}>
                {activeCap.title}
              </h3>
              <p className="body-copy" style={{ fontSize: "15px" }}>
                {activeCap.summary}
              </p>

              <div className="cap-demo-box">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "var(--pink)",
                    marginBottom: "0.65rem",
                  }}
                >
                  <span>SYSTEM DEMONSTRATION</span>
                  <span>{demoExecuted ? "EXECUTED" : "STANDBY"}</span>
                </div>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.68)", marginBottom: "0.5rem" }}>
                  Before: {activeCap.demoBefore}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: demoExecuted ? "#FFCDFF" : "#FFFFFF",
                    fontWeight: 600,
                  }}
                >
                  {demoExecuted
                    ? `\u2713 ${activeCap.demoAfter}`
                    : `Click '${activeCap.demoAction}' to inspect transformation.`}
                </p>
              </div>

              <div style={{ marginTop: "1rem" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--ink-light-dim)",
                    marginBottom: "0.45rem",
                  }}
                >
                  Connects Directly With:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  {linkedCapabilities.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="cap-link-pill"
                      onClick={() => handleSelectCapability(c.id)}
                    >
                      {c.index} {c.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.75rem" }}>
              <button
                type="button"
                className="btn btn--pink btn--sm"
                id="cap-run-demo"
                onClick={() => setDemoExecuted(true)}
              >
                {activeCap.demoAction}
              </button>
              <button
                type="button"
                className="btn btn--light-outline btn--sm"
                id="cap-expand-env"
                onClick={openSpatial}
              >
                Expand Environment
              </button>
              <button
                type="button"
                className="btn btn--light-outline btn--sm"
                onClick={() => openWhatsApp(activeCap.whatsappText)}
              >
                Discuss on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {spatialMounted &&
        createPortal(
          <div
            id="cap-spatial-overlay"
            className={`cap-spatial-overlay${spatialOpen ? " is-open" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded Capability Environment"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeSpatial();
            }}
          >
            <div className="cap-spatial-panel">
              <div className="cap-spatial-header">
                <span className="eyebrow-editorial" style={{ color: "var(--pink)", margin: 0 }}>
                  WYNXSOL // CAPABILITY ENVIRONMENT // {activeCap.index}
                </span>
                <button
                  type="button"
                  className="btn btn--dark-outline btn--sm"
                  id="cap-spatial-close"
                  onClick={closeSpatial}
                >
                  &larr; Return to System Matrix
                </button>
              </div>
              <div className="cap-spatial-grid">
                <div>
                  <h3
                    className="serif-display"
                    style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", marginBottom: "1rem" }}
                  >
                    {activeCap.title}
                  </h3>
                  <p className="body-copy" style={{ fontSize: "16px", maxWidth: "54ch" }}>
                    {activeCap.summary}
                  </p>
                  <div
                    className="cap-demo-box"
                    style={{ border: "1px solid var(--hairline-dark-strong)", marginTop: "1.75rem" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        color: "var(--pink)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span>ARCHITECTURAL SIMULATION</span>
                      <span>{demoExecuted ? "STATE: EXECUTED" : "STATE: STANDBY"}</span>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "rgba(255,255,255,0.7)",
                        marginBottom: "0.65rem",
                      }}
                    >
                      <strong>Baseline State:</strong> {activeCap.demoBefore}
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: demoExecuted ? "#FFCDFF" : "#FFFFFF",
                        fontWeight: 600,
                      }}
                    >
                      {demoExecuted
                        ? `\u2713 ${activeCap.demoAfter}`
                        : "Run demonstration to simulate system execution."}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginTop: "1.25rem" }}>
                    <button
                      type="button"
                      className="btn btn--pink btn--sm"
                      id="cap-spatial-run-demo"
                      onClick={() => setDemoExecuted(true)}
                    >
                      {activeCap.demoAction}
                    </button>
                    <button
                      type="button"
                      className="btn btn--dark-outline btn--sm"
                      onClick={() => openWhatsApp(activeCap.whatsappText)}
                    >
                      Discuss on WhatsApp
                    </button>
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "0.09em",
                      color: "var(--text-white-dim)",
                      marginBottom: "0.85rem",
                    }}
                  >
                    Connected System Topology
                  </span>
                  <div style={{ display: "grid", gap: "0.65rem" }}>
                    {linkedCapabilities.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="cap-spatial-node-btn"
                        onClick={() => handleSelectCapability(c.id)}
                      >
                        <span
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "var(--pink)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {c.index} // CONNECTED MODULE
                        </span>
                        <span
                          className="serif-display"
                          style={{ display: "block", fontSize: "1.35rem", marginTop: "0.25rem" }}
                        >
                          {c.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}
