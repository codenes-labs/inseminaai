import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
    },
  ) => string;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type Props = {
  siteKey: string;
  onToken: (token: string) => void;
};

export function TurnstileLogin({ siteKey, onToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    onToken("");
    const mount = () => {
      if (!containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
      });
    };
    const existing = document.querySelector(`script[src^="${SCRIPT_SRC.split("?")[0]}"]`);
    if (existing) {
      mount();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = mount;
    document.body.appendChild(script);
    return () => {
      onToken("");
      widgetIdRef.current = null;
    };
  }, [siteKey, onToken]);

  return <div ref={containerRef} className="flex min-h-[65px] justify-center" />;
}