'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
// import Cookies from "js-cookie";
import { toast } from 'sonner';
import { useEffect, useState } from "react";
import { useAuth } from "./context/authContext";

interface Item {
  id: number;
  title: string;
  category: string;
  size: string;
  images: string[];
}

export default function HomePage() {
  const router = useRouter();
  const { user, setUserProfile, logout } = useAuth();
  // const isAdmin = sessionStorage.getItem('Admin') === 'true';

  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);

  useEffect(() => {
    setUserProfile();
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const res = await fetch('https://rewear-w7ik.onrender.com/api/items/featured',{method:"GET"});
      const data = await res.json();
      setFeaturedItems(data);
    } catch (err) {
      console.error('Error fetching featured items:', err);
    }
  };

  const handleClick = () => {
    user ? router.push("/dashboard") : router.push("/auth/login");
  };

  // const handleStartSwapping = () => {
  //   user ? router.push('/dashboard') : router.push('/auth/login');
  // };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  return (
    <main className="min-h-screen px-6 py-12 bg-background text-foreground">
      <div className="absolute top-4 right-6">
        {user ? (
          <div className="flex gap-3">
            {user?.isAdmin && (
              <Button asChild variant="secondary">
                <Link href="/admin">Admin Dashboard</Link>
              </Button>
            )}
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

        {featuredItems.length === 0 ? (
          <p className="text-center text-muted-foreground">No featured items available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="bg-muted p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/items/${item.id}`)}
              >
                 <img
                    src={`https://rewear-w7ik.onrender.com${item.images[0]}`}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.category} · Size {item.size}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
