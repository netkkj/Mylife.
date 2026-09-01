import { useEffect, useRef, useState } from "react";
import type { PoemChapter } from "@/lib/poem";

/**
 * Capítulo do poema: cada linha surge quando entra na viewport,
 * com atraso escalonado. Linhas do universo usam cor estelar;
 * linhas de ênfase brilham em tipografia pixel.
 */
export function PoemChapterView({
  chapter,
  isLast,
}: {
  chapter: PoemChapter;
  isLast: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-label={chapter.title}
      className="relative z-10 mx-auto flex min-h-[85vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center"
    >
      <span
        className={`font-pixel mb-14 text-sm tracking-[0.5em] text-muted-foreground uppercase transition-all duration-1000 ${
          visible ? "opacity-70" : "-translate-y-4 opacity-0"
        }`}
      >
        {chapter.title}
      </span>

      <div className="flex flex-col items-center gap-9">
        {chapter.lines.map((line, i) => (
          <p
            key={i}
            style={{ transitionDelay: `${300 + i * 550}ms` }}
            className={`transition-all duration-[1600ms] ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            } ${
              line.emphasis
                ? "font-pixel animate-glow text-3xl leading-snug text-primary sm:text-4xl"
                : line.speaker === "one"
                  ? "font-serif-poem text-lg leading-relaxed text-primary sm:text-xl"
                  : line.speaker === "two"
                    ? "font-serif-poem text-lg leading-relaxed text-accent sm:text-xl"
                    : "font-serif-poem text-lg leading-relaxed text-foreground/85 sm:text-xl"
            }`}
          >
            {line.text}
          </p>
        ))}
      </div>

      {!isLast && (
        <div
          aria-hidden="true"
          className={`mt-20 h-24 w-px bg-gradient-to-b from-primary/50 to-transparent transition-opacity delay-[2500ms] duration-1000 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </section>
  );
}
