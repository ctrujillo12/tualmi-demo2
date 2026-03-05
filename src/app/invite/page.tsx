'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function InviteLandingPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });

    if (error) {
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f5f2] px-6">
      <div className="w-full max-w-md text-center space-y-8">

        <h1 className="text-5xl text-[#b3a67d] font-serif">
          Tualmi
        </h1>

        <p className="text-xl italic text-[#5f5a4d]">
          You’re Invited…
        </p>

        <p className="text-sm tracking-wide text-[#6e6a5c]">
          Join the Trailblazing Club
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <input
            type="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-full border border-[#d8d4c6] bg-white text-sm focus:outline-none focus:ring-1 focus:ring-[#b3a67d]"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#b3a67d] text-white text-sm tracking-widest uppercase hover:opacity-90 transition"
          >
            Join
          </button>
        </form>

        {status === 'success' && (
          <p className="text-green-600 text-sm">You're on the list ✨</p>
        )}

        {status === 'error' && (
          <p className="text-red-600 text-sm">Error: {errorMsg}</p>
        )}

        <p className="text-xs text-[#9b9686] pt-2">
          Early access • Limited drops • No spam
        </p>

      </div>
    </main>
  );
}