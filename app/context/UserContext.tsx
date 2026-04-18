import { createContext, useState } from "react";

// infos minimales stockées en mémoire pour l'utilisateur connecté
// null = aucun utilisateur
type UserType = {
  username: string;
  userId: string;
} | null;

// valeur exposée par le contexte, avec un setter pour mettre à jour le user
type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};

// contexte global, permet de partager le user sans passer par les props
export const UserContext = createContext<UserContextType | null>(null);

// provider à placer en haut de l'app pour rendre le user accessible partout
export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}