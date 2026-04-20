import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../styles/global.scss";
import { AppThemeProvider } from "../theme";
import App from "./views/App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </StrictMode>,
);
