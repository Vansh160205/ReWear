// app/items/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  images: string[];
}

export default function AllItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('https://rewear-w7ik.onrender.com/api/items', {
          credentials: 'include',
        });
        const data = await res.json();
        setItems(data || []);
      } catch (err) {
        console.error('Failed to fetch items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading items...</p>;

  return (
    <main className="px-6 py-10 max-w-7xl mx-auto">
        <Button asChild variant="secondary" className="mb-4">
            <Link href="/">← Back to Home</Link>
        </Button>
      <h1 className="text-3xl font-bold mb-6 text-center">Browse All Items</h1>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground">No items found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-muted p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <Link href={`/items/${item.id}`}>
                <div className="cursor-pointer">
                  <img
                    src={`http://localhost:8000${item.images[0]}`}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <h2 className="text-xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {item.description}
                  </p>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span>Size: {item.size} | </span>
                    <span>Condition: {item.condition}</span>
                  </div>
                </div>
              </Link>
              <Link href={`/items/${item.id}`}>
                <Button variant="outline" className="mt-4 w-full">
                  View Details
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
