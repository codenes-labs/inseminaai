import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ThemeProvider } from "./components/theme";
import "./index.css";

if ("serviceWorker" in navigator) {
  void navigator.serviceWorker.register("/sw.js").catch(() => {
    /* ambiente sem HTTPS ou SW indisponível */
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);