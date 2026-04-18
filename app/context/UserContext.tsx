import { createContext, useState } from "react";
type UserType = {
  username: string;
  userId: string;
} | null;
type UserContextType = {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
};
/*Création du contexte global Il permettra de partager les données utilisateur dans toute l'application */
export const UserContext = createContext<UserContextType | null>(null);
/* Provider = rend les données accessibles partout */
export function UserProvider({ children }: { children: React.ReactNode }) {
  /*On stocke uniquement les données essentielles */
  const [user, setUser] = useState<UserType>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}