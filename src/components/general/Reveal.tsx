"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay before the animation starts, in milliseconds. Useful for staggering. */
  delay?: number;
  /** How far the element rises into place, in pixels. */
  distance?: number;
};

/**
 * Fades and lifts its children into view the first time they enter the
 * viewport. It reveals as soon as any part of the element appears, so blocks
 * taller than the screen still show. It falls back to fully visible when the
 * browser has no IntersectionObserver, when the visitor prefers reduced
 * motion, and as a final safety net after a short delay, so content is never
 * left hidden.
 */
function Reveal({ children, className = "", delay = 0, distance = 16 }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      setAnimate(false);
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) {
      setVisible(true);
      return;
    }

    const reveal = () => setVisible(true);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.unobserve(entry.target);
          }
        }
      },
      // threshold 0: trigger as soon as a single pixel enters, so elements
      // taller than the viewport still reveal. The small bottom margin starts
      // the motion just after the element appears.
      { threshold: 0, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(el);

    // Safety net: if the observer never fires for any reason, reveal anyway so
    // content is never stuck hidden.
    const fallback = window.setTimeout(reveal, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : `translateY(${distance}px)`,
        transition: animate
          ? `opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`
          : "none",
        willChange: animate ? "opacity, transform" : undefined,
      }}
    >
      {children}
    </div>
  );
}

export default Reveal;
