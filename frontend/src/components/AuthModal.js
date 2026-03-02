import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Phone, User, Chrome } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const AuthModal = () => {
  const { showAuthModal, closeAuthModal, signIn } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate auth - will be replaced with Supabase later
    setTimeout(() => {
      if (mode === 'signup' && !formData.phone) {
        toast.error('Phone number is required');
        setLoading(false);
        return;
      }

      // Mock successful auth
      signIn({
        id: 'mock-user-' + Date.now(),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        phone: formData.phone
      });
      
      toast.success(mode === 'signin' ? 'Welcome back!' : 'Account created successfully!');
      setLoading(false);
    }, 800);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    // Simulate Google OAuth - will be replaced with Supabase later
    setTimeout(() => {
      signIn({
        id: 'google-user-' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        provider: 'google'
      });
      toast.success('Signed in with Google!');
      setLoading(false);
    }, 800);
  };

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={closeAuthModal}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="glass-card p-8 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[hsl(var(--brand-gold))] to-[hsl(var(--brand-gold-light))]" />
            
            {/* Close button */}
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'signin' 
                  ? 'Sign in to unlock advanced optimization features' 
                  : 'Get access to powerful loan strategies'}
              </p>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 mb-4 font-semibold"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  required
                />
              </div>

              {mode === 'signup' && (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full h-12 pl-11 pr-4 rounded-lg border border-border bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 premium-button font-semibold"
                disabled={loading}
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-sm mt-6 text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline font-semibold"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
