import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { StarfieldCanvas } from "@/components/StarfieldCanvas";
import { PoemChapterView } from "@/components/PoemChapterView";
import { POEM } from "@/lib/poem";
import nebula from "@/assets/nebula.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "O Fim do Jogo — Um Poema do Universo" },
      {
        name: "description",
        content:
          "O End Poem de Minecraft narrado, em uma experiência imersiva entre estrelas. Julian Gough (CC0). Acorde.",
      },
      { property: "og:title", content: "O Fim do Jogo — Um Poema do Universo" },
      {
        property: "og:description",
        content:
          "O End Poem de Minecraft narrado, em uma experiência imersiva entre estrelas. Julian Gough (CC0).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EndPoemExperience,
});

function EndPoemExperience() {
  const [started, setStarted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showEnd, setShowEnd] = useState(false);
  const playerRef = useRef<{ playVideo?: () => void; mute?: () => void; unMute?: () => void; isMuted?: () => boolean } | null>(null);
  const playerHostRef = useRef<HTMLDivElement>(null);
  const poemStartRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Player oculto do YouTube: apenas o áudio da narração do End Poem.
  useEffect(() => {
    const w = window as unknown as {
      YT?: { Player: new (el: HTMLElement, opts: Record<string, unknown>) => NonNullable<typeof playerRef.current> };
      onYouTubeIframeAPIReady?: () => void;
    };
    const create = () => {
      if (!w.YT || !playerHostRef.current || playerRef.current) return;
      playerRef.current = new w.YT.Player(playerHostRef.current, {
        videoId: "VqZZLTJkl5Q",
        width: 1,
        height: 1,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1 },
      });
    };
    if (w.YT?.Player) {
      create();
    } else {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        prev?.();
        create();
      };
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }
  }, []);

  const startExperience = () => {
    setStarted(true);
    playerRef.current?.playVideo?.();
    setSoundOn(true);
    requestAnimationFrame(() => {
      poemStartRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const toggleSound = () => {
    const player = playerRef.current;
    if (player?.isMuted?.()) {
      player.unMute?.();
      setSoundOn(true);
    } else {
      player?.mute?.();
      setSoundOn(false);
    }
  };

  useEffect(() => {
    const el = endRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => setShowEnd(entries[0]?.isIntersecting ?? false),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* Nebulosa de fundo — deriva lenta */}
      <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden">
        <img
          src={nebula}
          alt=""
          width={1920}
          height={1080}
          className="animate-nebula-drift absolute inset-0 h-full w-full scale-110 object-cover opacity-80"
        />
      </div>

      {/* Universo de partículas */}
      <StarfieldCanvas intensity={started ? 1 : 0.6} />

      {/* Vinheta cinematográfica */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[2] bg-[radial-gradient(circle_at_center,transparent_25%,oklch(0.02_0.01_280_/_0.85)_92%)]"
      />

      {/* Player oculto da narração (somente áudio) */}
      <div
        ref={playerHostRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-[9999px] h-px w-px overflow-hidden"
      />

      {/* Controle de som */}
      <button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? "Silenciar narração" : "Ativar narração"}
        className="fixed top-6 right-6 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 bg-background/40 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:shadow-[0_0_20px_oklch(0.75_0.12_290_/_0.35)]"
      >
        {soundOn ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>

      {/* HERO */}
      <header className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1
          className="font-pixel animate-fade-in text-6xl leading-none tracking-wide text-foreground [animation-delay:800ms] [animation-fill-mode:backwards] sm:text-7xl md:text-8xl"
          style={{ textShadow: "0 0 40px oklch(0.75 0.12 290 / 0.45)" }}
        >
          O FIM
          <br />
          DO JOGO
        </h1>

        <p className="font-serif-poem mt-8 max-w-xl animate-fade-in text-lg leading-relaxed text-muted-foreground italic [animation-delay:1500ms] [animation-fill-mode:backwards] sm:text-xl">
          "And the universe said I love you, because you are love."
        </p>

        <button
          type="button"
          onClick={startExperience}
          className="group animate-pulse-ring relative mt-14 animate-fade-in rounded-full border border-foreground/25 bg-foreground/5 px-10 py-4 text-sm font-semibold tracking-[0.2em] uppercase backdrop-blur-md transition-all duration-500 [animation-delay:2300ms] [animation-fill-mode:backwards] hover:scale-105 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_45px_oklch(0.75_0.12_290_/_0.5)]"
        >
          Iniciar Experiência
        </button>

        <div
          aria-hidden="true"
          className="absolute bottom-10 flex animate-fade-in flex-col items-center gap-2 [animation-delay:3000ms] [animation-fill-mode:backwards]"
        >
          <span className="text-[10px] tracking-[0.4em] text-muted-foreground/60 uppercase">Role para sonhar</span>
          <div className="animate-scroll-hint h-10 w-px bg-gradient-to-b from-foreground/50 to-transparent" />
        </div>
      </header>

      {/* POEMA */}
      <div ref={poemStartRef} className="relative">
        {POEM.map((chapter, i) => (
          <PoemChapterView key={chapter.id} chapter={chapter} isLast={i === POEM.length - 1} />
        ))}
      </div>

      {/* FINAL */}
      <section
        ref={endRef}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center"
      >
        <h2
          className={`font-pixel text-4xl leading-tight tracking-wide transition-all duration-[2500ms] sm:text-6xl ${
            showEnd ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          style={{
            textShadow: showEnd
              ? "0 0 60px oklch(0.75 0.12 290 / 0.8), 0 0 120px oklch(0.7 0.15 190 / 0.4)"
              : "none",
          }}
        >
          WAKE UP.
        </h2>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`mt-16 rounded-full border border-foreground/20 bg-foreground/5 px-8 py-3 text-xs font-semibold tracking-[0.25em] uppercase backdrop-blur-md transition-all delay-[1800ms] duration-1000 hover:border-primary hover:bg-primary hover:text-primary-foreground ${
            showEnd ? "opacity-100" : "opacity-0"
          }`}
        >
          Sonhar novamente
        </button>

        <footer className="absolute bottom-8 text-[11px] tracking-[0.2em] text-muted-foreground/50 uppercase">
          <span>End Poem — Julian Gough (CC0)</span>
        </footer>
      </section>
    </main>
  );
}
