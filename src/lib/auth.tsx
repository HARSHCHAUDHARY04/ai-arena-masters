import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type UserRole = 'admin' | 'organizer' | 'participant';

type User = {
  id: string;
  username: string;
  role: UserRole;
};

type Session = {
  user: User;
  accessToken: string;
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (
    username: string,
    password: string,
    loginType: 'admin' | 'participant'
  ) => Promise<{ error: Error | null; role?: UserRole }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = 'http://localhost:4000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     Restore session on load
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem('ai_arena_token');
    const storedUser = localStorage.getItem('ai_arena_user');

    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      setRole(parsedUser.role);
      setSession({ user: parsedUser, accessToken: token });
    }

    setLoading(false);
  }, []);

  /* =========================
     Sign In
  ========================== */
  const signIn = async (
    username: string,
    password: string,
    loginType: 'admin' | 'participant'
  ) => {
    try {
      setLoading(true);

      const endpoint =
        loginType === 'admin'
          ? `${API_BASE}/auth/admin/login`
          : `${API_BASE}/auth/team/login`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      /*
        Expected backend response:
        {
          token: "jwt",
          user: {
            id,
            username,
            role
          }
        }
      */

      const loggedInUser: User = data.user;

      localStorage.setItem('ai_arena_token', data.token);
      localStorage.setItem('ai_arena_user', JSON.stringify(loggedInUser));
      localStorage.setItem('ai_arena_role', loggedInUser.role);

      setUser(loggedInUser);
      setRole(loggedInUser.role);
      setSession({ user: loggedInUser, accessToken: data.token });
      setLoading(false);

      return { error: null, role: loggedInUser.role };
    } catch (err: any) {
      setLoading(false);
      return { error: err instanceof Error ? err : new Error('Login failed') };
    }
  };

  /* =========================
     Sign Out
  ========================== */
  const signOut = () => {
    localStorage.removeItem('ai_arena_token');
    localStorage.removeItem('ai_arena_user');
    localStorage.removeItem('ai_arena_role');

    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, role, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
