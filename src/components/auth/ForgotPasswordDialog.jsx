import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/services/api';

export function ForgotPasswordDialog({ open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!email.toLowerCase().endsWith('@wayne.edu')) {
      setError('Please use your Wayne State email (@wayne.edu)');
      setLoading(false);
      return;
    }

    try {
      await api.auth.forgotPassword(email);
      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onOpenChange(false);
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center">Check your email</DialogTitle>
            <DialogDescription className="text-center">
              We've sent a password reset link to <strong>{email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-zinc-500">
              The link will expire in 24 hours. If you don't see the email, check your spam folder.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-center">Forgot Password?</DialogTitle>
          <DialogDescription className="text-center">
            Enter your email and we'll send you a link to reset your password
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="email"
              placeholder="your.email@wayne.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              disabled={loading}
            />
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[var(--wsu-green)] hover:bg-[var(--wsu-green)]/90"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Reset Link
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="w-full"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ForgotPasswordDialog;
