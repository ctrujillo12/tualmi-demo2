'use client';

import { useState } from 'react';
import HeaderStaticBlack from '@/components/HeaderStaticBlack';

export default function InvitePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setStatus('error');
      } else {
        setStatus('success');
        setEmail('');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  return (
    <>
      <HeaderStaticBlack />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h1 className="text-lg font-normal tracking-[0.3em] uppercase mb-12">
          Trailblazer's Club
        </h1>

        <div className="space-y-8 text-sm leading-relaxed">
          <p className="tracking-wide">
            Be the first to join the club!
          </p>

          <p className="tracking-wide">
            Special perks &  early access to limited drops. Exciting things coming soon... 
          </p>

          
        </div>

        <div className="mt-16">
          {status === 'success' ? (
            <p className="text-sm tracking-[0.15em] uppercase">
              We'll be in touch!
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 border-b border-black bg-transparent text-sm py-2 px-0 placeholder-gray-400 focus:outline-none focus:border-black tracking-wide"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="text-sm tracking-[0.2em] uppercase border border-black px-6 py-2 hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-40"
              >
                {status === 'loading' ? 'Submitting...' : 'Notify Me'}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-4 text-sm text-red-600 tracking-wide">{errorMsg}</p>
          )}
        </div>
      </main>
    </>
  );
}