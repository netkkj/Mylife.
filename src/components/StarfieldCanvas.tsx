import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  hue: number;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  hue: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * Campo de estrelas infinito: 3 camadas de parallax que reagem ao mouse,
 * poeira cósmica flutuante atraída pelo cursor e estrelas cadentes ocasionais.
 */
export function StarfieldCanvas({ intensity = 1 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, active: false });
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const stars: Star[] = [];
    const dust: Dust[] = [];
    const shooting: ShootingStar[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // 3 camadas de profundidade
    const STAR_COUNT = 420;
    for (let i = 0; i < STAR_COUNT; i++) {
      const z = Math.random(); // 0 longe, 1 perto
      stars.push({
        x: Math.random(),
        y: Math.random(),
        z,
        size: 0.4 + z * 1.8,
        baseAlpha: 0.25 + z * 0.75,
        twinkleSpeed: 0.4 + Math.random() * 1.6,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() < 0.12 ? 265 : Math.random() < 0.2 ? 190 : 0,
      });
    }

    const DUST_COUNT = 70;
    for (let i = 0; i < DUST_COUNT; i++) {
      dust.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        size: 0.6 + Math.random() * 1.6,
        alpha: 0.15 + Math.random() * 0.4,
        hue: Math.random() < 0.5 ? 265 : 190,
      });
    }

    const onMouse = (e: MouseEvent) => {
      mouse.current = { x: e.clientX / w, y: e.clientY / h, active: true };
    };
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    const onResize = () => resize();
    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    let nextShooting = performance.now() + 3500;

    const tick = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      const t = now / 1000;
      const px = (mouse.current.x - 0.5) * 2;
      const py = (mouse.current.y - 0.5) * 2;
      const scroll = scrollRef.current;

      // Estrelas com parallax de mouse + rolagem lenta
      for (const s of stars) {
        const depth = 0.15 + s.z * 0.85;
        const sx = ((s.x * w + px * depth * -22 + w) % w);
        const sy = ((s.y * h + py * depth * -14 + scroll * depth * 0.04) % h + h) % h;
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const alpha = s.baseAlpha * twinkle * intensity;
        if (alpha <= 0.01) continue;
        ctx.beginPath();
        if (s.hue === 0) {
          ctx.fillStyle = `rgba(235, 240, 255, ${alpha})`;
        } else {
          ctx.fillStyle = `hsla(${s.hue}, 80%, 75%, ${alpha})`;
        }
        ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
        ctx.fill();
        // brilho nas maiores
        if (s.z > 0.85) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(220, 225, 255, ${alpha * 0.12})`;
          ctx.arc(sx, sy, s.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Poeira cósmica — atraída suavemente pelo cursor
      for (const d of dust) {
        if (mouse.current.active) {
          const mx = mouse.current.x * w;
          const my = mouse.current.y * h;
          const dx = mx - d.x;
          const dy = my - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 260 && dist > 1) {
            d.vx += (dx / dist) * 0.012;
            d.vy += (dy / dist) * 0.012;
          }
        }
        d.vx *= 0.985;
        d.vy *= 0.985;
        d.x += d.vx + Math.sin(t * 0.3 + d.y * 0.01) * 0.05;
        d.y += d.vy + Math.cos(t * 0.25 + d.x * 0.01) * 0.04;
        if (d.x < -10) d.x = w + 10;
        if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        if (d.y > h + 10) d.y = -10;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${d.hue}, 70%, 70%, ${d.alpha * 0.5 * intensity})`;
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Estrelas cadentes
      if (now > nextShooting) {
        shooting.push({
          x: Math.random() * w * 0.7 + w * 0.15,
          y: Math.random() * h * 0.3,
          vx: 6 + Math.random() * 5,
          vy: 2.5 + Math.random() * 2,
          life: 0,
          maxLife: 60 + Math.random() * 30,
        });
        nextShooting = now + 4000 + Math.random() * 7000;
      }
      for (let i = shooting.length - 1; i >= 0; i--) {
        const s = shooting[i];
        if (!s) continue;
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const p = 1 - s.life / s.maxLife;
        if (p <= 0) {
          shooting.splice(i, 1);
          continue;
        }
        const grad = ctx.createLinearGradient(s.x - s.vx * 12, s.y - s.vy * 12, s.x, s.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(1, `rgba(230, 225, 255, ${0.8 * p * intensity})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 12, s.y - s.vy * 12);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
    />
  );
}
