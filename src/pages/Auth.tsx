import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ParticleBackground } from '@/components/ParticleBackground';
import { ArrowLeft, Zap, Lock, Users, Shield, Settings } from 'lucide-react';
import { z } from 'zod';

/* =======================
   Validation Schema
======================= */
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginType = 'select' | 'admin' | 'participant';

export default function AuthPage() {
  const [loginType, setLoginType] = useState<LoginType>('select');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  /* =======================
     Redirect after login
  ======================= */
  useEffect(() => {
    if (user && role) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    }
  }, [user, role, navigate]);

  /* =======================
     Form Validation
  ======================= */
  const validateForm = () => {
    try {
      loginSchema.parse({ username, password });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { username?: string; password?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0] === 'username') fieldErrors.username = err.message;
          if (err.path[0] === 'password') fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  /* =======================
     Submit Handler
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const { error, role: loggedInRole } = await signIn(username, password, loginType as 'admin' | 'participant');

    if (error) {
      toast.error('Login failed. Please check your credentials.');
    } else {
      toast.success('Welcome back!');

      const effectiveRole =
        loggedInRole ||
        role ||
        (localStorage.getItem('ai_arena_role') as any) ||
        'participant';

      if (effectiveRole === 'admin') navigate('/admin');
      else if (effectiveRole === 'organizer') navigate('/organizer');
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleBack = () => {
    setLoginType('select');
    setUsername('');
    setPassword('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="glass-card p-8 rounded-2xl border border-border/50">
            <AnimatePresence mode="wait">
              {/* =======================
                 SELECT LOGIN TYPE
              ======================= */}
              {loginType === 'select' ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">AI Battle Arena</h1>
                    <p className="text-muted-foreground text-sm">
                      Select your login type
                    </p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => setLoginType('admin')}
                      className="w-full p-6 rounded-xl border hover:border-secondary transition"
                    >
                      <div className="flex items-center gap-4">
                        <Settings className="w-6 h-6 text-secondary" />
                        <div className="text-left">
                          <h3 className="font-semibold">Admin Login</h3>
                          <p className="text-sm text-muted-foreground">
                            Manage events & teams
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setLoginType('participant')}
                      className="w-full p-6 rounded-xl border hover:border-primary transition"
                    >
                      <div className="flex items-center gap-4">
                        <Users className="w-6 h-6 text-primary" />
                        <div className="text-left">
                          <h3 className="font-semibold">Participant Login</h3>
                          <p className="text-sm text-muted-foreground">
                            Team dashboard access
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* =======================
                   LOGIN FORM
                ======================= */
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          placeholder="team_test_titans"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      {errors.username && (
                        <p className="text-destructive text-sm">{errors.username}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      {errors.password && (
                        <p className="text-destructive text-sm">{errors.password}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Authenticating...' : 'Access Arena'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
