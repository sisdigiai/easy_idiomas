import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("v_easy_profiles").select("*").eq("id", userId).maybeSingle();
      if (data && !error) {
        setProfile(data);
        return data;
      } else {
        setProfile(null);
        console.warn("Could not fetch profile for user", userId, error);
        return null;
      }
    } catch (error) {
      setProfile(null);
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const mockRole = localStorage.getItem("mock_user_role");
      const mockEmail = localStorage.getItem("mock_user_email");
      
      if (mockRole && mockEmail) {
        setProfile({ id: "mock-id", full_name: "Usuário Teste", email: mockEmail, role: mockRole });
        setSession({ user: { id: "mock-id", email: mockEmail } } as any);
      } else {
        setProfile(null);
        setSession(null);
      }
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      window.setTimeout(async () => {
        await fetchProfile(nextSession.user.id);
        setLoading(false);
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!isSupabaseConfigured) {
        localStorage.removeItem("mock_user_role");
        localStorage.removeItem("mock_user_email");
        setProfile(null);
        setSession(null);
        window.location.href = "/login";
        return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
