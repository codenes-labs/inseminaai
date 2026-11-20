import { useEffect } from "react";

export function useLandingReveal(rootSelector = ".landing-page") {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const elementos = root.querySelectorAll(".landing-reveal");
    if (elementos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );

    elementos.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [rootSelector]);
}