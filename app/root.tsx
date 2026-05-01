import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import "./app.css";
import { UserProvider } from "./context/UserContext";
import Footer from "./components/Footer";

// point d'entrée de l'app, toutes les routes sont rendues à travers <Outlet />
// UserProvider rend le contexte utilisateur disponible sur toutes les pages
export default function App() {
  const location = useLocation();

  return (
    <UserProvider>
      <div key={location.pathname} className="route-content">
        <Outlet />
      </div>
    </UserProvider>
  );
}

// layout HTML commun à toutes les routes
// Meta et Links permettent aux routes de définir leur propre <head>
// ScrollRestoration remet le scroll en haut lors d'un changement de page
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="app-shell">
          {children}
          <Footer />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}