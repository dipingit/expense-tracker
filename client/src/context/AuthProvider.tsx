import { useState, useEffect, type ReactNode } from "react";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      if (accessToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  //extractApiErrorMessage from backend
  const extractApiErrorMessage = async (
    response: Response,
    fallbackMessage: string
  ) => {
    try {
      const data = (await response.json()) as Record<string, unknown>;

      const details = data?.details;
      if (Array.isArray(details) && details.length > 0) {
        const messages = (
          details as Array<{ message?: string } | undefined | null>
        )
          .map((d) => (typeof d?.message === "string" ? d.message : null))
          .filter(Boolean) as string[];
        if (messages.length > 0) {
          return messages.join(" ");
        }
      }

      const err = data?.error;
      const backendMessage =
        (typeof data?.message === "string" ? data.message : null) ??
        (typeof err === "string" ? err : null) ??
        (typeof err === "object" &&
        err !== null &&
        typeof (err as { message?: string }).message === "string"
          ? (err as { message: string }).message
          : null) ??
        (typeof data?.data === "object" &&
        data.data !== null &&
        typeof (data.data as { message?: unknown }).message === "string"
          ? (data.data as { message: string }).message
          : null);

      if (typeof backendMessage === "string" && backendMessage.trim()) {
        return backendMessage.trim();
      }
    } catch {
      /* non-JSON or empty body */
    }
    return fallbackMessage;
  };

  const persistSession = (
    userData: User,
    accessToken: string,
    refreshToken: string
  ) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  //login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const message = await extractApiErrorMessage(response, "Login failed");
        throw new Error(message);
      }

      const data = (await response.json()) as {
        data?: { id: number; email: string; name?: string | null };
        tokens?: { accessToken?: string; refreshToken?: string };
      };
      const userData = data.data;
      const accessToken = data.tokens?.accessToken;
      const refreshToken = data.tokens?.refreshToken;

      if (
        !userData ||
        typeof accessToken !== "string" ||
        typeof refreshToken !== "string"
      ) {
        throw new Error("Login failed");
      }

      persistSession(userData as User, accessToken, refreshToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  //register
  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    name?: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            confirmPassword,
            ...(name?.trim() ? { name: name.trim() } : {}),
          }),
        }
      );

      if (!response.ok) {
        const message = await extractApiErrorMessage(
          response,
          "Registration failed"
        );
        throw new Error(message);
      }

      const data = (await response.json()) as {
        data?: { id: number; email: string; name?: string | null };
        tokens?: { accessToken?: string; refreshToken?: string };
      };
      const userData = data.data;
      const accessToken = data.tokens?.accessToken;
      const refreshToken = data.tokens?.refreshToken;

      if (
        !userData ||
        typeof accessToken !== "string" ||
        typeof refreshToken !== "string"
      ) {
        throw new Error("Registration failed");
      }

      persistSession(userData as User, accessToken, refreshToken);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed";
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  //logout
  const logout = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        // Call logout API
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
