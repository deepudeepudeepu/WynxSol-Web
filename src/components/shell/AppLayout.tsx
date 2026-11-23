import { useCallback, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { WYNXSOL_CONFIG } from "../../config/wynxsol";
import { useMeeting } from "../../context/MeetingContext";
import { useNavigation } from "../../context/NavigationContext";
import { useWhatsApp } from "../../context/WhatsAppContext";
import { CustomCursor } from "./CustomCursor";
import { SmartLink } from "./SmartLink";

export function AppLayout() {
  const location = useLocation();
  const { curtainState, registerHudSync } = useNavigation();
  const { openWhatsApp } = useWhatsApp();
  const { openMeetingModal } = useMeeting();

  const isRestaurantPage = location.pathname.startsWith("/restaurant-ai");
  const activePage = isRestaurantPage ? "restaurant-ai" : "company";

  const [isOnLight, setIsOnLight] = useState(false);
  const [sceneCounter, setSceneCounter] = useState(
    activePage === "restaurant-ai" ? "CH 01 | 03" : "01 | 08"
  );
  const [activeCompanyRoute, setActiveCompanyRoute] = useState<"company" | "contact">("company");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isInverted, setIsInverted] = useState(false);

  const progressRef = useRef<HTMLDivElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  const updateScrollHud = useCallback(() => {
    const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const pct = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
    if (progressRef.current) {
      progressRef.current.style.width = `${pct.toFixed(2)}%`;
    }

    const lightSections = document.querySelectorAll(".is-light-surface");
    let overLight = false;
    lightSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= 42 && rect.bottom >= 42) {
        overLight = true;
      }
    });
    setIsOnLight((prev) => (prev !== overLight ? overLight : prev));

    const scenes = document.querySelectorAll<HTMLElement>("[data-scene-index]");
    let currentIdx = activePage === "restaurant-ai" ? "CH 01 | 03" : "01 | 08";
    scenes.forEach((s) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.48 && s.dataset.sceneIndex) {
        currentIdx = s.dataset.sceneIndex;
      }
    });
    setSceneCounter((prev) => (prev !== currentIdx ? currentIdx : prev));

    if (activePage === "company") {
      const contactEl =
        document.getElementById("contact") || document.getElementById("scene-contact");
      const inContact = contactEl
        ? contactEl.getBoundingClientRect().top <= window.innerHeight * 0.55
        : false;
      const nextRoute = inContact ? "contact" : "company";
      setActiveCompanyRoute((prev) => (prev !== nextRoute ? nextRoute : prev));
    }
  }, [activePage]);

  useEffect(() => {
    const unregister = registerHudSync(updateScrollHud);
    updateScrollHud();

    window.addEventListener("scroll", updateScrollHud, { passive: true });
    window.addEventListener("resize", updateScrollHud, { passive: true });
    return () => {
      unregister();
      window.removeEventListener("scroll", updateScrollHud);
      window.removeEventListener("resize", updateScrollHud);
    };
  }, [registerHudSync, updateScrollHud]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname, location.hash]);

  const closeDrawer = useCallback((returnFocus = false) => {
    setDrawerOpen(false);
    if (returnFocus) {
      burgerRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDrawer(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [drawerOpen, closeDrawer]);

  const toggleInvert = () => {
    const next = document.body.classList.toggle("is-inverted");
    setIsInverted(next);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className={`wynx-nav${isOnLight ? " is-on-light" : ""}`} id="wynx-header">
        <div className="wynx-nav__row">
          <SmartLink to="/" className="wynx-brand" aria-label="WynxSol Home">
            {WYNXSOL_CONFIG.logoAssetPath.trim() !== "" ? (
              <img
                src={WYNXSOL_CONFIG.logoAssetPath}
                alt="WynxSol logo"
                className="wynx-brand__img"
              />
            ) : (
              <span className="wynx-brand__plus" aria-hidden="true">
                +
              </span>
            )}
            <span>WYNXSOL</span>
          </SmartLink>

          <nav aria-label="Primary Navigation">
            <ul className="wynx-nav__links">
              {WYNXSOL_CONFIG.routes.map((route) => {
                const isActive =
                  activePage === "restaurant-ai"
                    ? route.id === "restaurant-ai"
                    : route.id === activeCompanyRoute;

                return (
                  <li key={route.id}>
                    <SmartLink
                      to={route.to}
                      className={`wynx-nav__link${isActive ? " is-active" : ""}`}
                      data-route-id={route.id}
                    >
                      {route.label}
                    </SmartLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              className={`btn ${isOnLight ? "btn--light-outline" : "btn--dark-outline"} btn--sm wynx-nav__cta-desktop`}
              id="nav-book-meeting-btn"
              onClick={() => openMeetingModal()}
            >
              Book a Meeting
            </button>
            <button
              type="button"
              className="btn btn--pink btn--sm wynx-nav__cta-desktop"
              onClick={() => openWhatsApp()}
            >
              Contact Us on WhatsApp
            </button>
            <button
              ref={burgerRef}
              type="button"
              className="nav-burger"
              id="wynx-burger"
              aria-label="Open menu"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((prev) => !prev)}
            >
              Menu
            </button>
          </div>
        </div>

        <div className="wynx-nav__baseline">
          <div ref={progressRef} className="wynx-nav__progress" id="wynx-nav-progress" />
        </div>
      </header>

      <div className="wynx-hud-bottom">
        <button
          type="button"
          id="wynx-invert-btn"
          aria-pressed={isInverted}
          onClick={toggleInvert}
        >
          invert surface
        </button>
        <span id="wynx-scene-counter">{sceneCounter}</span>
      </div>

      <div
        className={`mobile-drawer${drawerOpen ? " is-open" : ""}`}
        id="wynx-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        aria-hidden={!drawerOpen}
      >
        <div className="mobile-drawer__head">
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--pink)",
            }}
          >
            WYNXSOL // NAVIGATION
          </span>
          <button
            type="button"
            className="wynx-modal__close"
            id="wynx-drawer-close"
            aria-label="Close menu"
            onClick={() => closeDrawer(true)}
          >
            &times;
          </button>
        </div>

        <ul className="mobile-drawer__list">
          <li>
            <SmartLink to="/#company" className="mobile-drawer__link" onClick={() => closeDrawer(false)}>
              Company
            </SmartLink>
          </li>
          <li>
            <SmartLink
              to="/#scene-capabilities"
              className="mobile-drawer__link"
              onClick={() => closeDrawer(false)}
            >
              What We Build
            </SmartLink>
          </li>
          <li>
            <SmartLink
              to="/#scene-process"
              className="mobile-drawer__link"
              onClick={() => closeDrawer(false)}
            >
              Our Process
            </SmartLink>
          </li>
          <li>
            <SmartLink
              to="/restaurant-ai"
              className="mobile-drawer__link text-pink"
              onClick={() => closeDrawer(false)}
            >
              Restaurant Intelligence
            </SmartLink>
          </li>
          <li>
            <SmartLink to="/#contact" className="mobile-drawer__link" onClick={() => closeDrawer(false)}>
              Contact
            </SmartLink>
          </li>
        </ul>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          <button
            type="button"
            className="btn btn--pink"
            id="drawer-book-meeting-btn"
            onClick={() => {
              closeDrawer(false);
              openMeetingModal();
            }}
          >
            Book a Meeting
          </button>
          <button
            type="button"
            className="btn btn--dark-outline"
            onClick={() => {
              closeDrawer(false);
              openWhatsApp();
            }}
          >
            Contact Us on WhatsApp
          </button>
          <a
            href={`mailto:${WYNXSOL_CONFIG.contactEmail}`}
            style={{ fontSize: "13px", color: "var(--pink)", textDecoration: "underline" }}
          >
            {WYNXSOL_CONFIG.contactEmail}
          </a>
          <p style={{ fontSize: "12px", color: "var(--text-white-dim)" }}>
            {WYNXSOL_CONFIG.tagline}
          </p>
        </div>
      </div>

      <div
        className={`page-curtain${curtainState.visible ? " is-entering" : ""}`}
        aria-hidden={!curtainState.visible}
      >
        <span className="page-curtain__mark">WYNXSOL</span>
        <span className="page-curtain__sub" id="curtain-dest">
          {curtainState.label}
        </span>
      </div>

      <CustomCursor />

      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
