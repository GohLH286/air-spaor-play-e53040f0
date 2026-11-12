import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const TeacherSession = createContext<{ user: User | null; ready: boolean }>({ user: null, ready: false });

export function TeacherSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    void supabase.auth.getUser().then(({ data: u }) => {
      setUser(u.user);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return <TeacherSession.Provider value={{ user, ready }}>{children}</TeacherSession.Provider>;
}

export function useTeacherSession() { return useContext(TeacherSession); }

export function TeacherAccount() {
  const { user } = useTeacherSession();
  if (!user) return null;
  return <div className="flex justify-end gap-3 bg-background px-6 py-2 text-sm"><span>Teacher signed in</span><Button variant="outline" size="sm" onClick={() => void supabase.auth.signOut()}>Sign out</Button></div>;
}

export function TeacherSignIn({ color }: { color: string }) {
  const [error, setError] = useState<string | null>(null);
  const signIn = async (provider: "google" | "lovable") => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) setError("Sign-in did not finish. Please try again.");
  };
  return (
    <div className="mt-4 rounded-2xl border-2 border-dashed p-4 text-center" style={{ borderColor: color }}>
      <p className="text-sm font-semibold">Teacher sign-in is needed to see or add saved materials.</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => void signIn("google")}>Sign in with Google</Button>
        <Button type="button" variant="outline" onClick={() => void signIn("lovable")}>Sign in with Lovable</Button>
      </div>
      {error && <p className="mt-2 text-xs text-[var(--problem)]">{error}</p>}
    </div>
  );
}
