import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createStudioChromeEnv } from "../../utils/threeStudioEnv";

interface LiquidChromeCanvasProps {
  triggerRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}

/**
 * Generates an anisotropic brushed-metal & micro-grain CanvasTexture
 * to give liquid chrome and satin titanium sculptural tactility under studio light.
 */
function createBrushedChromeTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    // Subtle directional brushed grain striations
    for (let y = 0; y < size; y++) {
      const band = Math.sin(y * 0.14) * 18 + Math.cos(y * 0.43) * 10;
      const lum = Math.max(96, Math.min(168, Math.round(128 + band)));
      ctx.fillStyle = `rgb(${lum}, ${lum}, ${lum})`;
      ctx.fillRect(0, y, size, 1);
    }

    // Fine metallic micro-streaks for organic specular break-up
    for (let i = 0; i < 900; i++) {
      const x = (i * 73) % size;
      const y = (i * 197) % size;
      const w = 24 + (i % 64);
      const bright = i % 2 === 0;
      ctx.fillStyle = bright ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)";
      ctx.fillRect(x, y, w, 1.2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  tex.anisotropy = 4;
  return tex;
}

export function LiquidChromeCanvas({ triggerRef, reducedMotion }: LiquidChromeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const triggerEl = triggerRef.current;
    const canvas = canvasRef.current;
    if (!triggerEl || !canvas) return;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      const maxDpr = window.innerWidth <= 768 ? 1.5 : 2;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.24;
    } catch {
      renderer = null;
    }

    if (!renderer) {
      return;
    }

    const activeRenderer = renderer;
    const disposables: Array<{ dispose: () => void }> = [];

    const studioEnv = createStudioChromeEnv(activeRenderer);
    const brushedTex = createBrushedChromeTexture();
    disposables.push(studioEnv, brushedTex);

    const scene = new THREE.Scene();
    scene.environment = studioEnv.envMap;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 8.8);

    const sculptureGroup = new THREE.Group();
    scene.add(sculptureGroup);

    // Textured liquid-chrome interlocking knot
    const knotGeo = new THREE.TorusKnotGeometry(1.36, 0.31, 240, 40, 2, 3);
    const liquidChromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1.0,
      roughness: 0.08,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      bumpMap: brushedTex,
      bumpScale: 0.014,
      roughnessMap: brushedTex,
      envMapIntensity: 1.95,
    });
    const knotMesh = new THREE.Mesh(knotGeo, liquidChromeMat);
    sculptureGroup.add(knotMesh);
    disposables.push(knotGeo, liquidChromeMat);

    // Secondary brushed-silver intertwined orbital ribbon
    const ribbonGeo = new THREE.TorusGeometry(2.14, 0.045, 24, 140);
    const satinChromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xe4e4e7,
      metalness: 0.96,
      roughness: 0.17,
      clearcoat: 0.7,
      bumpMap: brushedTex,
      bumpScale: 0.008,
      envMapIntensity: 1.55,
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, satinChromeMat);
    ribbonMesh.rotation.set(1.05, 0.42, 0.28);
    sculptureGroup.add(ribbonMesh);
    disposables.push(ribbonGeo, satinChromeMat);

    // Precision outer hairline architectural ring
    const ringGeo = new THREE.TorusGeometry(2.58, 0.014, 16, 160);
    const hairlineMat = new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      metalness: 0.92,
      roughness: 0.24,
      envMapIntensity: 1.2,
    });
    const ringMesh = new THREE.Mesh(ringGeo, hairlineMat);
    ringMesh.rotation.set(-0.62, 0.88, 0);
    sculptureGroup.add(ringMesh);
    disposables.push(ringGeo, hairlineMat);

    // Pure monochrome white & silver studio lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.36);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 6, 7);

    const rimLight = new THREE.DirectionalLight(0xf4f4f5, 1.95);
    rimLight.position.set(-6, -3, 4);

    const sweepLight = new THREE.PointLight(0xffffff, 3.1, 20, 1.25);
    sweepLight.position.set(2.5, 2.5, 4.8);

    scene.add(ambient, keyLight, rimLight, sweepLight);

    const resize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      activeRenderer.setSize(w, h, false);
      const aspect = w / Math.max(1, h);
      camera.aspect = aspect;
      if (aspect < 1) {
        camera.fov = 48;
        camera.position.z = 9.6;
      } else {
        camera.fov = 38;
        camera.position.z = 8.8;
      }
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let scrollProg = reducedMotion ? 0.5 : 0;
    let isVisible = true;
    let targetPtrX = 0;
    let targetPtrY = 0;
    let curPtrX = 0;
    let curPtrY = 0;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const onPointerMove = (e: PointerEvent) => {
      if (isCoarse || reducedMotion) return;
      targetPtrX = (e.clientX / Math.max(1, window.innerWidth) - 0.5) * 0.42;
      targetPtrY = (e.clientY / Math.max(1, window.innerHeight) - 0.5) * 0.28;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    let rafId: number | null = null;
    const renderLoop = (now: number) => {
      if (!isVisible) {
        rafId = null;
        return;
      }

      curPtrX += (targetPtrX - curPtrX) * 0.06;
      curPtrY += (targetPtrY - curPtrY) * 0.06;

      const t = now * 0.00034;
      const baseRotY = scrollProg * Math.PI * 0.9 + (reducedMotion ? 0 : t);
      const baseRotX = 0.2 + (scrollProg - 0.5) * 0.3;

      sculptureGroup.rotation.y = baseRotY + curPtrX;
      sculptureGroup.rotation.x = baseRotX - curPtrY;
      // Bounded vertical travel so outer orbital ring never clips top or bottom frustum
      sculptureGroup.position.y = (0.5 - scrollProg) * 0.28;

      const scaleFactor = 0.94 + Math.sin(scrollProg * Math.PI) * 0.06;
      sculptureGroup.scale.setScalar(scaleFactor);

      ribbonMesh.rotation.z = 0.28 + scrollProg * 0.9 + (reducedMotion ? 0 : t * 0.5);
      ringMesh.rotation.y = 0.88 - scrollProg * 0.7 - (reducedMotion ? 0 : t * 0.3);

      sweepLight.position.x = Math.sin(t * 2.1) * 3.4 + curPtrX * 4;
      sweepLight.position.y = Math.cos(t * 1.6) * 2.2 - curPtrY * 3;

      activeRenderer.render(scene, camera);
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(renderLoop);
      }
    };

    let obs: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window) {
      obs = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0].isIntersecting;
          if (isVisible) {
            if (!reducedMotion && rafId === null) {
              rafId = window.requestAnimationFrame(renderLoop);
            } else {
              activeRenderer.render(scene, camera);
            }
          }
        },
        { rootMargin: "150px" }
      );
      obs.observe(triggerEl);
    }

    let st: ScrollTrigger | null = null;
    if (!reducedMotion) {
      st = ScrollTrigger.create({
        trigger: triggerEl,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          scrollProg = self.progress;
        },
      });
      rafId = window.requestAnimationFrame(renderLoop);
    } else {
      activeRenderer.render(scene, camera);
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      st?.kill();
      obs?.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      disposables.forEach((d) => d.dispose());
      activeRenderer.dispose();
    };
  }, [triggerRef, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="work-chrome-canvas"
      id="work-chrome-canvas"
      aria-hidden="true"
    />
  );
}
