import { useEffect, useRef } from "react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reducedMotion || coarse || window.innerWidth <= 900) {
      return;
    }

    let cx = -100;
    let cy = -100;
    let tx = -100;
    let ty = -100;
    let rafId = 0;

    const onMouseMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      cursor.classList.add("is-visible");
    };

    const onTouchStart = () => {
      cursor.classList.remove("is-visible");
    };

    const onMouseLeave = () => {
      cursor.classList.remove("is-visible");
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target && target.closest("a, button, .cap-node, .process-row, .sim-table-island")) {
        cursor.classList.add("is-hovering");
      } else {
        cursor.classList.remove("is-hovering");
      }
    };

    const loop = () => {
      cx += (tx - cx) * 0.25;
      cy += (ty - cy) * 0.25;
      cursor.style.transform = `translate3d(${cx - 5}px, ${cy - 5}px, 0)`;
      rafId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseover", onMouseOver);
    rafId = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, [reducedMotion]);

  return <div ref={cursorRef} className="wynx-cursor" aria-hidden="true" />;
}
