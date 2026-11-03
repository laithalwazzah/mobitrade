"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { authStateFromUser, SafeAuthError, type AuthAdapter, type AuthState, type AuthUser } from "@/lib/auth";
import { createAuthAdapter } from "@/lib/firebaseAuthAdapter";

type AuthContextValue = {
  state: AuthState;
  available: boolean | null;
  register(email: string, password: string): Promise<AuthUser>;
  login(email: string, password: string): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  logout(): Promise<void>;
  sendPasswordReset(email: string): Promise<void>;
  sendVerification(): Promise<void>;
  reloadUser(): Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const adapterRef = useRef<AuthAdapter | null>(null);
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const adapter = createAuthAdapter();
    adapterRef.current = adapter;
    queueMicrotask(() => setAvailable(adapter.available));
    if (!adapter.available) {
      queueMicrotask(() => setState({ status: "signed-out", user: null }));
      return () => { adapterRef.current = null; };
    }
    const unsubscribe = adapter.subscribe((user) => setState(authStateFromUser(user)));
    return () => {
      adapterRef.current = null;
      unsubscribe();
    };
  }, []);

  const adapter = useCallback(() => {
    if (!adapterRef.current?.available) throw new SafeAuthError("auth/unavailable");
    return adapterRef.current;
  }, []);
  const register = useCallback(async (email: string, password: string) => {
    const user = await adapter().register(email, password);
    setState(authStateFromUser(user));
    return user;
  }, [adapter]);
  const login = useCallback(async (email: string, password: string) => {
    const user = await adapter().login(email, password);
    setState(authStateFromUser(user));
    return user;
  }, [adapter]);
  const signInWithGoogle = useCallback(async () => {
    const user = await adapter().signInWithGoogle();
    setState(authStateFromUser(user));
    return user;
  }, [adapter]);
  const logout = useCallback(async () => {
    await adapter().logout();
    setState({ status: "signed-out", user: null });
  }, [adapter]);
  const sendPasswordReset = useCallback((email: string) => adapter().sendPasswordReset(email), [adapter]);
  const sendVerification = useCallback(() => adapter().sendVerification(), [adapter]);
  const reloadUser = useCallback(async () => {
    const user = await adapter().reloadUser();
    setState(authStateFromUser(user));
    return user;
  }, [adapter]);

  return <AuthContext.Provider value={{ state, available, register, login, signInWithGoogle, logout, sendPasswordReset, sendVerification, reloadUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
