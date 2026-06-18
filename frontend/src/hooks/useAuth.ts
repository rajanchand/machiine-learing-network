import { useEffect, useState } from "react";
import { getMe, login as apiLogin, logout as apiLogout } from "../api";

export function useAuth() {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((data) => setUser(data.username))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password);
    setUser(data.username);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return { user, loading, login, logout };
}
