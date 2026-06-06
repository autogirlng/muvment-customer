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
 * viewport. Falls back to fully visible when the browser has no
 * IntersectionObserver, and skips the motion entirely when the visitor has
 * "reduce motion" turned on.
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
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
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
