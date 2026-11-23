import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SOLUTION_LAYERS } from "../../data/restaurant";
import { useReducedMotion } from "../../hooks/useReducedMotion";

export function SolutionArchitectureChapter() {
  const reducedMotion = useReducedMotion();
  const [activeLayer, setActiveLayer] = useState(0);
  const [isAssembled, setIsAssembled] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const solStateRef = useRef({
    activeLayer: 0,
    isAssembled: false,
    targetAssembly: 0,
    currentAssembly: 0,
    isSolVisible: false,
  });

  useEffect(() => {
    solStateRef.current.activeLayer = activeLayer;
    solStateRef.current.isAssembled = isAssembled;
    solStateRef.current.targetAssembly = isAssembled ? 1 : 0;
  }, [activeLayer, isAssembled]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let st: ScrollTrigger | null = null;
    if (!reducedMotion) {
      st = ScrollTrigger.create({
        trigger: section,
        start: "top 65%",
        end: "bottom 35%",
        onUpdate: (self) => {
          const p = self.progress;
          if (p >= 0.78) {
            setActiveLayer((prev) => (prev !== 4 ? 4 : prev));
            setIsAssembled((prev) => (prev !== true ? true : prev));
          } else {
            const layerIdx = Math.min(4, Math.floor((p / 0.78) * 5));
            setActiveLayer((prev) => (prev !== layerIdx ? layerIdx : prev));
            setIsAssembled((prev) => (prev !== false ? false : prev));
          }
        },
      });
    }

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      return () => {
        st?.kill();
      };
    }

    const activeRenderer = renderer;
    const disposables: Array<{ dispose: () => void }> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
    camera.position.set(5.4, 3.6, 6.2);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.35);
    dirLight.position.set(5, 9, 6);
    scene.add(dirLight);

    const layerGroups: THREE.Group[] = [];

    const buildLayer = (idx: number) => {
      const g = new THREE.Group();
      const basePlateGeo = new THREE.BoxGeometry(2.8, 0.12, 2.2);
      const baseEdgeGeo = new THREE.EdgesGeometry(basePlateGeo);
      const baseMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x111115 : 0x222228,
        roughness: 0.35,
        metalness: 0.25,
      });
      const wireMat = new THREE.LineBasicMaterial({
        color: idx === 1 || idx === 3 ? 0xffcdff : 0x000000,
      });
      disposables.push(basePlateGeo, baseEdgeGeo, baseMat, wireMat);

      const plate = new THREE.Mesh(basePlateGeo, baseMat);
      plate.add(new THREE.LineSegments(baseEdgeGeo, wireMat));
      g.add(plate);

      if (idx === 0) {
        const coneGeo = new THREE.ConeGeometry(0.24, 0.42, 4);
        const coneMat = new THREE.MeshBasicMaterial({ color: 0xffcdff, wireframe: true });
        [
          [-0.85, -0.6],
          [0.85, -0.6],
          [-0.85, 0.6],
          [0.85, 0.6],
        ].forEach(([cx, cz]) => {
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.position.set(cx, 0.28, cz);
          g.add(cone);
        });
        disposables.push(coneGeo, coneMat);
      } else if (idx === 1) {
        const grid = new THREE.GridHelper(2.2, 6, 0xffcdff, 0x555566);
        grid.position.y = 0.1;
        g.add(grid);
        disposables.push(grid.geometry);
        if (Array.isArray(grid.material)) {
          grid.material.forEach((m) => disposables.push(m));
        } else {
          disposables.push(grid.material);
        }
      } else if (idx === 2) {
        const ringG = new THREE.TorusGeometry(0.65, 0.035, 8, 32);
        ringG.rotateX(Math.PI / 2);
        const ringM = new THREE.MeshBasicMaterial({ color: 0xffcdff });
        const ring = new THREE.Mesh(ringG, ringM);
        ring.position.y = 0.14;
        g.add(ring);
        disposables.push(ringG, ringM);
      } else if (idx === 3) {
        const orbGeo = new THREE.SphereGeometry(0.11, 12, 12);
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xffcdff });
        [-0.75, 0, 0.75].forEach((ox) => {
          const orb = new THREE.Mesh(orbGeo, orbMat);
          orb.position.set(ox, 0.18, 0);
          g.add(orb);
        });
        disposables.push(orbGeo, orbMat);
      } else if (idx === 4) {
        const barGeo = new THREE.BoxGeometry(0.18, 0.34, 0.18);
        const barMat = new THREE.MeshStandardMaterial({ color: 0xffcdff, roughness: 0.25 });
        for (let b = 0; b < 5; b++) {
          const bar = new THREE.Mesh(barGeo, barMat);
          bar.position.set(-0.9 + b * 0.45, 0.23, 0);
          bar.scale.y = 0.6 + ((b * 0.3) % 0.9);
          g.add(bar);
        }
        disposables.push(barGeo, barMat);
      }

      root.add(g);
      layerGroups.push(g);
    };

    for (let i = 0; i < 5; i++) buildLayer(i);

    const conduitGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.1, -2.1, -0.8),
      new THREE.Vector3(-1.1, 2.1, -0.8),
      new THREE.Vector3(1.1, -2.1, 0.8),
      new THREE.Vector3(1.1, 2.1, 0.8),
      new THREE.Vector3(0, -2.1, 0),
      new THREE.Vector3(0, 2.1, 0),
    ]);
    const conduitMat = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.32,
    });
    root.add(new THREE.LineSegments(conduitGeo, conduitMat));

    const pulseGeo = new THREE.SphereGeometry(0.08, 10, 10);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xffcdff });
    const dataPulse = new THREE.Mesh(pulseGeo, pulseMat);
    root.add(dataPulse);
    disposables.push(conduitGeo, conduitMat, pulseGeo, pulseMat);

    const resize = () => {
      const w = canvas.clientWidth || 520;
      const h = canvas.clientHeight || 420;
      activeRenderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let solRafId: number | null = null;
    const animateSolution = (now: number) => {
      const s = solStateRef.current;
      if (!s.isSolVisible) {
        solRafId = null;
        return;
      }

      s.currentAssembly += (s.targetAssembly - s.currentAssembly) * 0.1;
      const gap = (1 - s.currentAssembly) * 0.82 + 0.16;

      layerGroups.forEach((g, idx) => {
        g.position.y = (idx - 2) * gap;
        const targetScale = !s.isAssembled && idx === s.activeLayer ? 1.07 : 1;
        g.scale.setScalar(g.scale.x + (targetScale - g.scale.x) * 0.12);
      });

      const cycle = ((now * 0.0012) % 1) * 4.2 - 2.1;
      dataPulse.position.set(0, cycle * (1 - s.currentAssembly * 0.65), 0);

      if (!reducedMotion) {
        root.rotation.y = -0.35 + Math.sin(now * 0.0006) * 0.18 + s.activeLayer * 0.14;
      }

      activeRenderer.render(scene, camera);
      if (!reducedMotion) {
        solRafId = window.requestAnimationFrame(animateSolution);
      }
    };

    let obs: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          solStateRef.current.isSolVisible = entries[0].isIntersecting;
          if (entries[0].isIntersecting && !reducedMotion && solRafId === null) {
            solRafId = window.requestAnimationFrame(animateSolution);
          } else if (entries[0].isIntersecting) {
            activeRenderer.render(scene, camera);
          }
        },
        { rootMargin: "150px" }
      );
      obs.observe(section);
    } else {
      solStateRef.current.isSolVisible = true;
    }

    if (!reducedMotion && solStateRef.current.isSolVisible) {
      solRafId = window.requestAnimationFrame(animateSolution);
    } else {
      activeRenderer.render(scene, camera);
    }

    return () => {
      if (solRafId !== null) window.cancelAnimationFrame(solRafId);
      st?.kill();
      obs?.disconnect();
      window.removeEventListener("resize", resize);
      disposables.forEach((d) => d.dispose());
      activeRenderer.dispose();
    };
  }, [reducedMotion]);

  const currentLayer = SOLUTION_LAYERS[activeLayer] || SOLUTION_LAYERS[0];

  return (
    <section
      ref={sectionRef}
      className="solution-exploded-section is-light-surface"
      id="chapter-solution"
      data-scene-index="CH 03 | 03"
      aria-labelledby="solution-heading"
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
            <span className="eyebrow-editorial">Chapter 03 // The 3D System Architecture</span>
            <h2
              className="serif-display"
              id="solution-heading"
              style={{ fontSize: "var(--text-3xl)", maxWidth: "16ch" }}
            >
              HOW RESTAURANT INTELLIGENCE WORKS.
            </h2>
          </div>

          <button
            type="button"
            className="btn btn--light-outline btn--sm"
            id="solution-assemble-btn"
            onClick={() => setIsAssembled((prev) => !prev)}
          >
            {isAssembled ? "Explode Layers View" : "Assemble System Layers"}
          </button>
        </div>

        <div className="solution-layout">
          <div className="solution-canvas-sticky">
            <div className="solution-canvas-frame">
              <canvas
                ref={canvasRef}
                className="restaurant-solution-canvas"
                id="restaurant-solution-canvas"
                aria-label="3D exploded system architecture diagram"
              />
              <div className="solution-canvas-hud" id="solution-canvas-hud">
                <span id="solution-hud-layer">
                  {isAssembled ? "ALL 05 LAYERS // UNIFIED" : currentLayer.hudLabel}
                </span>
                <span id="solution-hud-mode">
                  {isAssembled ? "SYSTEM ASSEMBLED" : "EXPLODED VIEW"}
                </span>
              </div>
            </div>
          </div>

          <div className="solution-layers-list" id="solution-layers-list">
            {SOLUTION_LAYERS.map((layer, idx) => {
              const active = idx === activeLayer;
              return (
                <button
                  key={layer.num}
                  type="button"
                  className={`solution-layer-card${active ? " is-active" : ""}`}
                  aria-pressed={active}
                  onClick={() => {
                    setActiveLayer(idx);
                    setIsAssembled(false);
                  }}
                >
                  <span className="solution-layer-card__num">{layer.num}</span>
                  <div>
                    <h3 className="solution-layer-card__title">{layer.title}</h3>
                    <p className="solution-layer-card__desc">{layer.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
