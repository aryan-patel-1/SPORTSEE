import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getToken, removeToken, saveToken } from "../utils/auth";

type AppContextValue = {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (nextToken: string) => void;
  logout: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Indique si l'utilisateur est connecté
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Indique si la vérification initiale est encore en cours
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Au démarrage, on regarde si un token existe déjà dans le navigateur
    setIsAuthenticated(!!getToken());
    setIsCheckingAuth(false);
  }, []);

  const login = (nextToken: string) => {
    // On enregistre le token puis on met à jour l'état global
    saveToken(nextToken);
    setIsAuthenticated(true);
  };

  const logout = () => {
    // On supprime le token puis on repasse l'état à déconnecté
    removeToken();
    setIsAuthenticated(false);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isCheckingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    // Empêche d'utiliser le contexte en dehors du provider
    throw new Error("useAppContext doit être utilisé dans un AppProvider");
  }

  return context;
}