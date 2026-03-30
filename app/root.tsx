import {
  Links,
  Meta,
  Outlet,
  Scripts,
} from "react-router";
import { AppProvider } from "./context/AppContext";

import "./app.css";

export default function App() {
  return (
    // Le provider rend l'état global disponible dans toutes les pages
    <AppProvider>
      {/* Outlet affiche la route actuellement active */}
      <Outlet />
    </AppProvider>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Layout définit la structure HTML commune à toute l'application
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        {/* Injecte les balises meta générées par React Router */}
        <Meta />
        <Links />
      </head>
      <body>
        {/* children correspond au contenu de la page affichée ( Outlet ) */}
        {children}
        <Scripts />
      </body>
    </html>
  );
}