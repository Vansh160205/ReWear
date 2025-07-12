'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
      import { toast, Toaster } from 'sonner';
import { useEffect, useState } from "react";


export default function HomePage() {
const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    setHasToken(!!token);
  }, []);

  const handleClick = () => {
    const token = sessionStorage.getItem('token');
    console.log('Token:', token);
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  };

   const handleStartSwapping = () => {
    const token = sessionStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    toast.success('Logged out successfully');
    setHasToken(false);
    router.push('/');
  };
  return (
    <main className="min-h-screen px-6 py-12 bg-background text-foreground">
       <div className="absolute top-4 right-6">
        {hasToken ? (
          <div className="flex gap-3">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Dashboard
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        ) : (
          <Button onClick={() => router.push('/auth/login')}>Login</Button>
        )}
      </div>
      <section className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-primary">Rewear</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          A community-powered clothing exchange platform to give your clothes a second life.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={handleClick}>Start Swapping</Button>
          <Link href="/items">
            <Button variant="outline">Browse Items</Button>
          </Link>
          <Link href="/addItem">
            <Button variant="secondary">List an Item</Button>
          </Link>
        </div>
      </section>

      <section className="mt-20 max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Featured Items</h2>
        {/* Placeholder: Replace with actual featured items carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-muted p-6 rounded-xl text-center shadow-sm">👕 T-Shirt - Large</div>
          <div className="bg-muted p-6 rounded-xl text-center shadow-sm">👗 Dress - Medium</div>
          <div className="bg-muted p-6 rounded-xl text-center shadow-sm">🧥 Jacket - Small</div>
        </div>
      </section>
    </main>
  );
}
