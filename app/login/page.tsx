// 'use client';
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        router.push(profile?.is_admin ? '/admin' : '/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — subtle, clean, nothing loud */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden lg:flex lg:w-1/2 text-white items-center justify-center"
            style={{background: "url('/3.jpeg')", backgroundSize: 'contain', backgroundPosition: 'center'}}
          >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="px-16 text-center"
        >
          <h2 className="text-4xl font-semibold mb-4">Welcome Back</h2>
          <p className="text-gray-300 text-lg">
            Continue your journey with a clear, distraction-free workspace.
          </p>
        </motion.div>
      </motion.div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-sm w-full"
        >
          {/* Brand Logo minimal */}
          <Link href="/">
            <h1 className="text-2xl text-black font-bold tracking-tight mb-10">
              Bouquet
            </h1>
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sign in</h2>
          <p className="text-gray-600 mb-8">
            Don’t have an account?{' '}
            <Link href="/signup" className="text-black font-medium underline">
              Create one
            </Link>
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-100 border border-red-200 rounded-lg p-3"
              >
                <p className="text-sm text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  className="w-full rounded-full border border-gray-300 pl-12 pr-4 py-3 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              type="submit"
              className="w-full rounded-full py-3.5 font-semibold text-white bg-black disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </motion.button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            By signing in, you agree to our Terms & Privacy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
