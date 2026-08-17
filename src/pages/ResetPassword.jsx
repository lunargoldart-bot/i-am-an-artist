import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { completePasswordReset } from '@/lib/firebaseAuth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('ready'); // ready | submitting | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (!oobCode) {
      setStatus('error');
      setError('This password reset link is invalid or expired. Please request a new reset link.');
    }
  }, [oobCode]);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Your new password must be at least 6 characters long.');
      return;
    }
    if (password !== confirm) {
      setError('The passwords you entered do not match.');
      return;
    }
    setStatus('submitting');
    try {
      await completePasswordReset(oobCode, password);
      setStatus('success');
    } catch (err) {
      const code = err.code;
      if (code === 'auth/expired-action-code' || code === 'auth/invalid-action-code') {
        setError('This reset link has expired or was already used. Please request a new reset link.');
      } else if (code === 'auth/weak-password') {
        setError('Choose a stronger password (at least 6 characters).');
      } else if (code === 'auth/network-request-failed') {
        setError('You appear to be offline. Check your connection and try again.');
      } else {
        setError(err.message || 'We could not reset your password. Please request a new link and try again.');
      }
      setStatus('error');
    }
  };

  const renderBody = () => {
    if (status === 'success') {
      return (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-700" />
          </div>
          <h2 className="font-playfair text-xl font-bold">Password updated</h2>
          <p className="text-sm text-muted-foreground font-body">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Link to="/login" className="block">
            <Button className="w-full green-gradient text-primary-foreground rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <form onSubmit={submit} className="space-y-4 py-2">
        <div className="space-y-2">
          <Label>New password</Label>
          <Input
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Confirm new password</Label>
          <Input
            type="password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your new password"
            required
          />
        </div>
        {error && (
          <p className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          </p>
        )}
        <Button type="submit" disabled={status === 'submitting'} className="w-full green-gradient text-primary-foreground rounded-full">
          {status === 'submitting' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset password
        </Button>
        {status === 'error' && (
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">
            Request a new reset link
          </Link>
        )}
      </form>
    );
  };

  const requiresCode = mode !== 'resetPassword' && mode !== 'recoverEmail';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 w-12 h-12 green-gradient rounded-xl flex items-center justify-center">
            {requiresCode ? <AlertTriangle className="w-6 h-6 text-primary-foreground" /> : <KeyRound className="w-6 h-6 text-primary-foreground" />}
          </div>
          <CardTitle className="font-playfair text-2xl">Choose a new password</CardTitle>
          <CardDescription className="font-body text-sm">
            Enter a new password for your I Am An Artist account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!oobCode ? (
            <div className="space-y-4 py-2 text-center">
              <p className="flex items-start gap-2 text-sm text-destructive text-left">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                This password reset link is invalid or expired. Please request a new reset link from the sign-in page.
              </p>
              <Link to="/login" className="block">
                <Button className="w-full" variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
                </Button>
              </Link>
            </div>
          ) : (
            renderBody()
          )}
        </CardContent>
      </Card>
    </div>
  );
}