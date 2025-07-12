'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // allow cookie to be set
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        sessionStorage.setItem('token', (await res.json()).token);
        console.log(localStorage.getItem('token'));
        toast.success('Account created!');
        router.push('/');
      } else {
        const err = await res.json();
        console.error('Registration error:', err);
        toast.error(err.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-background text-foreground">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md p-6 bg-muted rounded-xl shadow-md"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        <div className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </Button>

        <p className="text-sm text-center mt-4 text-muted-foreground">
          Already have an account? <a href="/auth/login" className="underline">Login</a>
        </p>
      </form>
    </main>
  );
}
