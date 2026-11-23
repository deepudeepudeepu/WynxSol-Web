import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PROCESS_STAGES } from "../../data/company";
import { useReducedMotion } from "../../hooks/useReducedMotion";

interface ProcessMechanismCanvasProps {
  activeStage: number;
}

const PLATE_SPECS = [
  { w: 2.8, h: 3.4, d: 0.08, color: 0x111115, edge: 0x000000 },
  { w: 2.5, h: 3.1, d: 0.08, color: 0x222228, edge: 0xffcdff },
  { w: 2.2, h: 2.8, d: 0.1, color: 0xffcdff, edge: 0x000000 },
  { w: 1.9, h: 2.5, d: 0.1, color: 0x111115, edge: 0x000000 },
  { w: 1.5, h: 2.0, d: 0.14, color: 0x000000, edge: 0xffcdff },
];

export function ProcessMechanismCanvas({ activeStage }: ProcessMechanismCanvasProps) {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const stageStateRef = useRef({
    activeStage: 0,
    targetCompression: 0,
    currentCompression: 0,
    targetRotY: -0.45,
    currentRotY: -0.45,
    isMechVisible: false,
  });

  const renderNowRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const clamped = Math.max(0, Math.min(4, activeStage));
    const s = stageStateRef.current;
    s.activeStage = clamped;
    s.targetCompression = clamped / 4;
    s.targetRotY = -0.45 + s.targetCompression * 0.45;
    if (reducedMotion || !s.isMechVisible) {
      s.currentCompression = s.targetCompression;
      s.currentRotY = s.targetRotY;
      renderNowRef.current?.();
    }
  }, [activeStage, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      return;
    }

    const activeRenderer = renderer;
    const disposables: Array<{ dispose: () => void }> = [];

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
    camera.position.set(4.8, 2.2, 6.2);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    const light1 = new THREE.DirectionalLight(0xffffff, 1.4);
    light1.position.set(5, 8, 6);
    scene.add(light1);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const plates: THREE.Mesh[] = [];
    PLATE_SPECS.forEach((s) => {
      const geo = new THREE.BoxGeometry(s.w, s.h, s.d);
      const edgeGeo = new THREE.EdgesGeometry(geo);
      const mat = new THREE.MeshStandardMaterial({
        color: s.color,
        roughness: 0.35,
        metalness: 0.2,
      });
      const wireMat = new THREE.LineBasicMaterial({ color: s.edge });
      disposables.push(geo, edgeGeo, mat, wireMat);

      const mesh = new THREE.Mesh(geo, mat);
      mesh.add(new THREE.LineSegments(edgeGeo, wireMat));
      group.add(mesh);
      plates.push(mesh);
    });

    const strutGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.6, -0.8, -2.5),
      new THREE.Vector3(-0.6, -0.8, 2.5),
      new THREE.Vector3(0.6, 0.8, -2.5),
      new THREE.Vector3(0.6, 0.8, 2.5),
    ]);
    const strutMat = new THREE.LineBasicMaterial({
      color: 0xffcdff,
      transparent: true,
      opacity: 0.48,
    });
    disposables.push(strutGeo, strutMat);
    group.add(new THREE.LineSegments(strutGeo, strutMat));

    const resize = () => {
      const w = canvas.clientWidth || 480;
      const h = canvas.clientHeight || 380;
      activeRenderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const renderFrame = () => {
      const s = stageStateRef.current;
      const spread = (1 - s.currentCompression) * 0.95 + 0.08;
      plates.forEach((mesh, idx) => {
        mesh.position.z = (idx - 2) * spread;
        mesh.scale.setScalar(idx === s.activeStage ? 1.04 : 1);
      });
      group.rotation.y = s.currentRotY;
      activeRenderer.render(scene, camera);
    };
    renderNowRef.current = renderFrame;

    let rafId: number | null = null;
    const animate = () => {
      const s = stageStateRef.current;
      if (!s.isMechVisible) {
        rafId = null;
        return;
      }
      s.currentCompression += (s.targetCompression - s.currentCompression) * 0.1;
      s.currentRotY += (s.targetRotY - s.currentRotY) * 0.1;
      if (!reducedMotion) {
        group.rotation.x = Math.sin(performance.now() * 0.0008) * 0.04;
      }
      renderFrame();
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    let obs: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          stageStateRef.current.isMechVisible = entries[0].isIntersecting;
          if (entries[0].isIntersecting && !reducedMotion && rafId === null) {
            rafId = window.requestAnimationFrame(animate);
          } else if (entries[0].isIntersecting) {
            renderFrame();
          }
        },
        { rootMargin: "150px" }
      );
      obs.observe(canvas);
    } else {
      stageStateRef.current.isMechVisible = true;
    }

    if (!reducedMotion && stageStateRef.current.isMechVisible) {
      rafId = window.requestAnimationFrame(animate);
    } else {
      renderFrame();
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      obs?.disconnect();
      window.removeEventListener("resize", resize);
      renderNowRef.current = null;
      disposables.forEach((d) => d.dispose());
      activeRenderer.dispose();
    };
  }, [reducedMotion]);

  const currentStage = PROCESS_STAGES[activeStage] || PROCESS_STAGES[0];
  const assemblyPct = String(Math.round((activeStage / 4) * 100)).padStart(2, "0");

  return (
    <div className="process-canvas-wrap">
      <canvas
        ref={canvasRef}
        className="process-mechanism-canvas"
        id="process-mechanism-canvas"
        aria-label="Interactive 3D exploded system mechanism"
      />
      <div className="process-cad-hud" id="process-cad-hud" aria-hidden="true">
        <span>{currentStage.hudLabel}</span>
        <span id="process-cad-compression">ASSEMBLY: {assemblyPct}%</span>
      </div>
    </div>
  );
}
