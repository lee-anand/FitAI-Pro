import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

import { Profile } from "../types/profile";

interface UserContextType {
  profile: Profile | null;

  setProfile: (profile: Profile | null) => void;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  setProfile: () => {},
});

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}