import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Palette, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { registerWithEmail, signInWithEmail, signInWithGoogle } from '@/lib/firebaseAuth';

const redirectAfterLogin = (user) => {
  if (user?.role === 'admin') return '/admin';
  const saved = sessionStorage.getItem('artist_login_redirect');
  sessionStorage.removeItem('artist_login_redirect');
  if (saved) {
    try {
      const url = new URL(saved, window.location.origin);
      if (url.origin === window.location.origin) return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      // Ignore malformed redirect values.
    }
  }
  return '/dashboard';
};

export default function Login() {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isLoadingAuth && isAuthenticated) return <Navigate to={redirectAfterLogin(user)} replace />;

  const finish = (user) => window.location.assign(redirectAfterLogin(user));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (mode === 'register') user = await registerWithEmail(form.email, form.password, form.fullName);
      else user = await signInWithEmail(form.email, form.password);
      finish(user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      finish(user);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-12 h-12 green-gradient rounded-xl flex items-center justify-center">
            <Palette className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="font-playfair text-2xl">{mode === 'register' ? 'Join I Am An Artist' : 'Welcome Back'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={googleLogin} disabled={loading}>
            Continue with Google
          </Button>
          <div className="relative text-center text-xs text-muted-foreground before:absolute before:left-0 before:right-0 before:top-1/2 before:border-t before:border-border">
            <span className="relative bg-card px-3">or use email</span>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} required />
              </div>
            )}
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" minLength={6} value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full green-gradient text-primary-foreground" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'register' ? 'Create Account' : 'Sign In'}
            </Button>
          </form>
          <button className="w-full text-sm text-primary hover:underline" onClick={() => setMode(mode === 'register' ? 'login' : 'register')}>
            {mode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
