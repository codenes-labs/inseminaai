import type { MouseEvent } from "react";

export function aoMoverGlowCard(event: MouseEvent<HTMLElement>) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
  card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
}