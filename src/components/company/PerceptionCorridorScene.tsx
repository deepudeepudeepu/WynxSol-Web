import { useEffect, useRef } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const CORRIDOR_WORDS = [
  "PERCEPTION",
  "DEFINES",
  "INTELLIGENCE",
  "SYSTEMS",
  "AUTONOMY",
  "EXECUTION",
  "PRECISION",
  "ENGINEER",
];

function createWordTexture(word: string, accentPink: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#060608";
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = accentPink ? "rgba(255, 205, 255, 0.35)" : "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 504, 504);

    ctx.fillStyle = accentPink ? "#FFCDFF" : "rgba(255, 255, 255, 0.88)";
    ctx.font = "400 52px 'Switzer', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(word, 256, 256);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

function createChamberTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 768;
  c.height = 768;
  const ctx = c.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#0E0E12";
    ctx.fillRect(0, 0, 768, 768);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    for (let i = 0; i <= 768; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 768);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(768, i);
      ctx.stroke();
    }

    const beam = ctx.createLinearGradient(0, 0, 768, 768);
    beam.addColorStop(0, "rgba(255, 205, 255, 0.22)");
    beam.addColorStop(0.5, "rgba(255, 255, 255, 0.06)");
    beam.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(140, 0);
    ctx.lineTo(768, 0);
    ctx.lineTo(768, 620);
    ctx.lineTo(0, 220);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#1A1A22";
    ctx.fillRect(214, 214, 340, 340);
    ctx.strokeStyle = "rgba(255, 205, 255, 0.65)";
    ctx.lineWidth = 3;
    ctx.strokeRect(214, 214, 340, 340);

    for (let r = 0; r < 9; r++) {
      for (let col = 0; col < 9; col++) {
        const dx = 252 + col * 33;
        const dy = 252 + r * 33;
        const dist = Math.hypot(col - 4, r - 4);
        ctx.fillStyle = dist < 2.6 ? "#FFCDFF" : "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.arc(dx, dy, dist < 2.6 ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = "#262530";
    ctx.fillRect(100, 220, 72, 328);
    ctx.fillRect(596, 220, 72, 328);
    ctx.fillRect(220, 100, 328, 72);
    ctx.fillRect(220, 596, 328, 72);
  }

  return new THREE.CanvasTexture(c);
}

export function PerceptionCorridorScene() {
  const reducedMotion = useReducedMotion();

  const wrapRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stmtRef = useRef<HTMLDivElement | null>(null);
  const leftWordRef = useRef<HTMLSpanElement | null>(null);
  const rightWordRef = useRef<HTMLSpanElement | null>(null);
  const tagRef = useRef<HTMLSpanElement | null>(null);
  const descRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      renderer = null;
    }

    // Fallback 2D projection if WebGL fails
    if (!renderer) {
      const ctx2d = canvas.getContext("2d");
      if (!ctx2d) return;
      let prog = reducedMotion ? 0.45 : 0;

      const draw2D = () => {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        ctx2d.fillStyle = "#000000";
        ctx2d.fillRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;

        for (let i = 0; i < 8; i++) {
          const depth = (i / 8 + prog * 1.4) % 1;
          const size = (0.14 + Math.pow(depth, 1.8) * 1.25) * Math.min(w, h);
          ctx2d.strokeStyle =
            i % 2 === 0 ? "rgba(255, 205, 255, 0.55)" : "rgba(255, 255, 255, 0.35)";
          ctx2d.lineWidth = 1.5;
          ctx2d.strokeRect(cx - size / 2, cy - size / 2, size, size);
        }
        if (stmtRef.current) stmtRef.current.style.opacity = String(Math.max(0, 1 - prog * 5));
        if (tagRef.current && descRef.current) {
          tagRef.current.textContent = "SPATIAL PASSAGE // 3D PROJECTION";
          descRef.current.textContent = `${Math.round(prog * 100)}%`;
        }
      };

      draw2D();
      window.addEventListener("resize", draw2D);
      let stFallback: ScrollTrigger | null = null;
      if (!reducedMotion) {
        stFallback = ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            prog = self.progress;
            draw2D();
          },
        });
      }

      return () => {
        window.removeEventListener("resize", draw2D);
        stFallback?.kill();
      };
    }

    const activeRenderer = renderer;
    const disposables: Array<{ dispose: () => void }> = [];

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.FogExp2(0x000000, 0.024);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 140);
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const ambient = new THREE.AmbientLight(0xffffff, 0.72);
    scene.add(ambient);

    const camLight = new THREE.PointLight(0xffcdff, 2.8, 38, 1.4);
    scene.add(camLight);

    const textures = CORRIDOR_WORDS.map((w, idx) => {
      const tex = createWordTexture(w, idx % 3 === 2);
      disposables.push(tex);
      return tex;
    });

    const cubeSize = 3.25;
    const spacing = 4.15;
    const zStep = 5.4;
    const depthLayers = 6;
    const boxGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const edgeGeo = new THREE.EdgesGeometry(boxGeo);
    const whiteLineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.24,
    });
    const pinkLineMat = new THREE.LineBasicMaterial({
      color: 0xffcdff,
      transparent: true,
      opacity: 0.42,
    });
    disposables.push(boxGeo, edgeGeo, whiteLineMat, pinkLineMat);

    const cubeMeshes: THREE.Mesh[] = [];

    for (let layer = 0; layer < depthLayers; layer++) {
      const z = -layer * zStep;
      for (let ix = -1; ix <= 1; ix++) {
        for (let iy = -1; iy <= 1; iy++) {
          if (ix === 0 && iy === 0) continue;

          const wordIdx = (layer * 3 + (ix + 1) + (iy + 1) * 2) % textures.length;
          const faceMat = new THREE.MeshStandardMaterial({
            map: textures[wordIdx],
            roughness: 0.75,
            metalness: 0.1,
          });
          disposables.push(faceMat);

          const mesh = new THREE.Mesh(boxGeo, faceMat);
          mesh.position.set(ix * spacing, iy * spacing, z);
          mesh.userData = {
            baseX: ix * spacing,
            baseY: iy * spacing,
            baseZ: z,
          };

          const wire = new THREE.LineSegments(
            edgeGeo,
            (layer + ix + iy) % 2 === 0 ? pinkLineMat : whiteLineMat
          );
          mesh.add(wire);
          rootGroup.add(mesh);
          cubeMeshes.push(mesh);
        }
      }
    }

    const chamberGroup = new THREE.Group();
    const chamberZ = -depthLayers * zStep + 1.8;
    chamberGroup.position.set(0, 0, chamberZ);

    const chamberTex = createChamberTexture();
    const backWallGeo = new THREE.PlaneGeometry(3.8, 3.8);
    const backWallMat = new THREE.MeshBasicMaterial({ map: chamberTex });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 0, -1.9);
    chamberGroup.add(backWall);
    disposables.push(chamberTex, backWallGeo, backWallMat);

    const shellGeo = new THREE.BoxGeometry(3.82, 3.82, 3.82);
    const shellEdges = new THREE.EdgesGeometry(shellGeo);
    const shellWireMat = new THREE.LineBasicMaterial({
      color: 0xffcdff,
      transparent: true,
      opacity: 0.8,
    });
    chamberGroup.add(new THREE.LineSegments(shellEdges, shellWireMat));
    disposables.push(shellGeo, shellEdges, shellWireMat);

    const tableGeo = new THREE.BoxGeometry(1.3, 0.24, 1.3);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e1e26, roughness: 0.4 });
    const tableEdges = new THREE.EdgesGeometry(tableGeo);
    const tableWireMat = new THREE.LineBasicMaterial({ color: 0xffcdff });
    const centerMonolith = new THREE.Mesh(tableGeo, tableMat);
    centerMonolith.position.set(0, -0.5, -0.4);
    centerMonolith.add(new THREE.LineSegments(tableEdges, tableWireMat));
    chamberGroup.add(centerMonolith);
    disposables.push(tableGeo, tableMat, tableEdges, tableWireMat);

    const bridgePillars: THREE.Mesh[] = [];
    const pillarGeo = new THREE.BoxGeometry(0.32, 1.6, 0.32);
    const pillarEdgeGeo = new THREE.EdgesGeometry(pillarGeo);
    disposables.push(pillarGeo, pillarEdgeGeo);

    [-0.95, 0, 0.95].forEach((px, idx) => {
      const pMat = new THREE.MeshStandardMaterial({
        color: idx === 1 ? 0x2c1b2c : 0x16161c,
        roughness: 0.35,
      });
      const pWireMat = new THREE.LineBasicMaterial({
        color: idx === 1 ? 0xffcdff : 0xffffff,
        transparent: true,
        opacity: 0.85,
      });
      disposables.push(pMat, pWireMat);

      const col = new THREE.Mesh(pillarGeo, pMat);
      col.position.set(px, -0.8, -0.4);
      col.scale.set(1, 0.05, 1);
      col.visible = false;
      col.add(new THREE.LineSegments(pillarEdgeGeo, pWireMat));
      chamberGroup.add(col);
      bridgePillars.push(col);
    });

    rootGroup.add(chamberGroup);

    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      activeRenderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.fov = camera.aspect < 1 ? 62 : 48;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let scrollProg = reducedMotion ? 0.45 : 0;
    let isVisible = true;

    const updateSceneForProgress = (p: number) => {
      scrollProg = Math.max(0, Math.min(1, p));

      if (stmtRef.current) {
        const stmtFade = scrollProg < 0.16 ? 1 - scrollProg / 0.16 : 0;
        stmtRef.current.style.opacity = String(Math.max(0, stmtFade));
        stmtRef.current.style.transform = `translateY(${scrollProg * -40}px)`;
      }
      if (leftWordRef.current) {
        leftWordRef.current.style.transform = `translate3d(${scrollProg * -110}px, 0, 0) scale(${1 + scrollProg * 0.15})`;
      }
      if (rightWordRef.current) {
        rightWordRef.current.style.transform = `translate3d(${scrollProg * 110}px, 0, 0) scale(${1 + scrollProg * 0.15})`;
      }

      if (tagRef.current && descRef.current) {
        if (scrollProg < 0.22) {
          tagRef.current.textContent = "STAGE 01 // PERCEPTION LATTICE";
          descRef.current.textContent = "Isometric spatial grid";
        } else if (scrollProg < 0.46) {
          tagRef.current.textContent = "STAGE 02 // ORTHOGONAL 3\u00D73 ALIGNMENT";
          descRef.current.textContent = "Tesseract corridor locking";
        } else if (scrollProg < 0.82) {
          tagRef.current.textContent = "STAGE 03 // TESSERACT PASSAGE";
          descRef.current.textContent = "Entering WynxSol architecture";
        } else {
          tagRef.current.textContent = "STAGE 04 // SYSTEM CHAMBER \u2192 THREE PILLARS";
          descRef.current.textContent = "Morphing into Intent, Intelligence & Execution";
        }
      }

      if (scrollProg <= 0.25) {
        const t = scrollProg / 0.25;
        const ease = t * (2 - t);
        camera.position.set(10.5 * (1 - ease), 6.8 * (1 - ease), 13.5 - 2.7 * ease);
        camera.rotation.set(-0.22 * (1 - ease), 0.45 * (1 - ease), -0.24 * (1 - ease));
      } else if (scrollProg <= 0.48) {
        const t = (scrollProg - 0.25) / 0.23;
        camera.position.set(0, 0, 10.8 - t * 3.8);
        camera.rotation.set(0, 0, 0);
      } else if (scrollProg <= 0.84) {
        const t = (scrollProg - 0.48) / 0.36;
        camera.position.set(0, 0, 7.0 - t * 28.0);
        camera.rotation.set(0, 0, t * 0.08);
      } else {
        const t = (scrollProg - 0.84) / 0.16;
        camera.position.set(0, 0, -21.0 - t * 8.4);
        camera.rotation.set(0, 0, 0.08 * (1 - t));
      }

      const spread = scrollProg < 0.3 ? (1 - scrollProg / 0.3) * 0.65 : 0;
      cubeMeshes.forEach((m) => {
        m.position.x = (m.userData.baseX as number) * (1 + spread);
        m.position.y = (m.userData.baseY as number) * (1 + spread);
      });

      centerMonolith.rotation.y = scrollProg * Math.PI * 1.5;

      const pillarT = scrollProg > 0.78 ? Math.min(1, (scrollProg - 0.78) / 0.2) : 0;
      bridgePillars.forEach((col, i) => {
        col.visible = pillarT > 0.01;
        const sy = 0.05 + pillarT * (i === 1 ? 1.35 : 1.05);
        col.scale.set(1, sy, 1);
        col.position.y = -0.85 + sy * 0.75;
      });
      centerMonolith.scale.set(1 - pillarT * 0.75, 1, 1 - pillarT * 0.75);

      camLight.position.copy(camera.position);
      if (isVisible) activeRenderer.render(scene, camera);
    };

    let obs: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting;
          if (isVisible) activeRenderer.render(scene, camera);
        },
        { rootMargin: "150px" }
      );
      obs.observe(wrap);
    }

    updateSceneForProgress(scrollProg);

    let st: ScrollTrigger | null = null;
    if (!reducedMotion) {
      st = ScrollTrigger.create({
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: (self) => updateSceneForProgress(self.progress),
      });
    }

    return () => {
      st?.kill();
      obs?.disconnect();
      window.removeEventListener("resize", resize);
      disposables.forEach((d) => d.dispose());
      activeRenderer.dispose();
    };
  }, [reducedMotion]);

  return (
    <section
      ref={wrapRef}
      className="perception-wrap"
      id="scene-perception"
      data-scene-index="02 | 08"
      aria-labelledby="perception-heading"
    >
      <div className="perception-pin">
        <canvas ref={canvasRef} className="tesseract-canvas" id="tesseract-canvas" aria-hidden="true" />

        <div className="perception-overlay">
          <div ref={stmtRef} className="perception-statement" id="perception-statement">
            <span className="eyebrow-editorial" style={{ color: "var(--pink)" }}>
              02 // Spatial Passage
            </span>
            <h2 className="serif-display" id="perception-heading">
              <span ref={leftWordRef} className="kinetic-word-3d kinetic-word-3d--left">
                PERCEPTION
              </span>
              <span className="kinetic-word-3d kinetic-word-3d--center text-pink">DEFINES</span>
              <span ref={rightWordRef} className="kinetic-word-3d kinetic-word-3d--right">
                INTELLIGENCE.
              </span>
            </h2>
          </div>

          <div className="perception-telemetry">
            <span ref={tagRef} className="perception-stage-tag" id="perception-stage-tag">
              STAGE 01 // PERCEPTION LATTICE
            </span>
            <span ref={descRef} id="perception-stage-desc">
              Scroll to travel through the tesseract corridor
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
