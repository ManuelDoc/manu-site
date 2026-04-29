import { lazy, Suspense, useCallback, useRef } from "react";
import type { Application } from "@splinetool/runtime";

const Spline = lazy(() => import("@splinetool/react-spline"));

export default function HeroSection() {
  const splineRef = useRef<Application | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);

  const pauseSpline = useCallback((delay = 450) => {
    if (pauseTimeoutRef.current !== null) {
      window.clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = window.setTimeout(() => {
      splineRef.current?.stop();
      pauseTimeoutRef.current = null;
    }, delay);
  }, []);

  const playSplineSoftly = useCallback(() => {
    if (pauseTimeoutRef.current !== null) {
      window.clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }

    splineRef.current?.play();
    pauseSpline(500);
  }, [pauseSpline]);

  const handleSplineLoad = useCallback((spline: Application) => {
    splineRef.current = spline;
    spline.stop();
  }, []);

  return (
    <section
      className="relative flex min-h-screen items-end overflow-hidden bg-hero-bg"
      id="top"
      aria-labelledby="hero-title"
    >
      <div
        className="absolute inset-0"
        onPointerEnter={playSplineSoftly}
        onPointerLeave={() => pauseSpline(250)}
        onPointerMove={playSplineSoftly}
      >
        <Suspense fallback={<div className="absolute inset-0 bg-hero-bg" />}>
          <Spline
            className="h-full w-full"
            onLoad={handleSplineLoad}
            renderOnDemand
            scene="https://prod.spline.design/Slk6b8kz3LRlKiyk/scene.splinecode"
          />
        </Suspense>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/30" />

      <div className="pointer-events-none relative z-10 w-full max-w-[90%] px-6 pb-10 pt-32 sm:max-w-md md:px-10 md:pb-10 lg:max-w-2xl">
        <h1
          className="mb-2 text-5xl font-bold uppercase leading-[1.05] text-foreground animate-fade-up sm:text-6xl md:mb-4 lg:text-8xl"
          id="hero-title"
          style={{ animationDelay: "0.2s" }}
        >
          SENTINEL <span className="text-primary">AI</span>
        </h1>

        <p
          className="mb-3 text-lg font-light text-foreground/80 animate-fade-up sm:text-2xl md:mb-6 lg:text-3xl"
          style={{ animationDelay: "0.4s" }}
        >
          We implement security correctly.
        </p>

        <p
          className="mb-4 text-sm font-light text-muted-foreground animate-fade-up sm:text-base md:mb-8 lg:text-xl"
          style={{ animationDelay: "0.55s" }}
        >
          Enterprise security systems built in days. AI-powered surveillance deployed with zero-trust architecture.
          Smart access control set up for your entire facility. All of it done right, not just fast.
        </p>

        <div className="flex flex-wrap gap-3 font-bold animate-fade-up" style={{ animationDelay: "0.7s" }}>
          <button
            className="pointer-events-auto cursor-pointer rounded-sm bg-primary px-6 py-3 text-sm text-primary-foreground transition-all hover:brightness-110 active:scale-[0.97] md:px-8 md:py-4"
            type="button"
          >
            Book a Call
          </button>
          <button
            className="pointer-events-auto cursor-pointer rounded-sm bg-white px-6 py-3 text-sm text-background transition-all hover:brightness-90 active:scale-[0.97] md:px-8 md:py-4"
            type="button"
          >
            Our Work
          </button>
        </div>

        <p
          className="mt-4 text-xs font-light text-muted-foreground/60 animate-fade-up md:mt-6"
          style={{ animationDelay: "0.85s" }}
        >
          Trusted security partner. Columbus, OH. 12 systems deployed.
        </p>
      </div>
    </section>
  );
}
