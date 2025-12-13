import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';

export function AuthView({ onShowVerify }) {
  const { signIn, signInSSO, signUp, loading, error, clearError } = useAuth();
  const [tab, setTab] = useState('login');
  
  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [localError, setLocalError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    
    if (!loginEmail || !loginPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    await signIn(loginEmail, loginPassword);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();
    
    if (!registerName || !registerEmail || !registerPassword) {
      setLocalError('Please fill in all fields');
      return;
    }
    
    if (registerPassword !== registerConfirm) {
      setLocalError('Passwords do not match');
      return;
    }
    
    if (registerPassword.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    const result = await signUp({
      name: registerName,
      email: registerEmail,
      password: registerPassword,
    });

    if (result.success && onShowVerify) {
      onShowVerify();
    }
  };

  const handleSSO = async () => {
    setLocalError('');
    clearError();
    await signInSSO();
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-16 h-16 bg-[var(--wsu-green)] rounded-2xl flex items-center justify-center mb-2">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">WSU Forum</CardTitle>
          <CardDescription>
            Connect with the Wayne State community
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* SSO Button */}
          <Button
            onClick={handleSSO}
            disabled={loading}
            className="w-full h-12 bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90 text-white font-medium"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Continue with Wayne State SSO
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-zinc-500">
              or continue with email
            </span>
          </div>

          {/* Error Display */}
          {displayError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Sign In
                </Button>
              </form>
              <button
                type="button"
                className="w-full text-sm text-[var(--wsu-green)] hover:underline"
                onClick={() => {/* TODO: Forgot password */}}
              >
                Forgot your password?
              </button>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="text"
                    placeholder="Full name"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder="Password (min 8 characters)"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={registerConfirm}
                    onChange={(e) => setRegisterConfirm(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Create Account
                </Button>
              </form>
              <p className="text-xs text-center text-zinc-500">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthView;
