'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  size: string;
  condition: string;
  available: boolean;
  tags: string[];
  images: string[];
  isRedeemable: boolean;
  pointsCost?: number;
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [offeredItemId, setOfferedItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'swap' | 'redeem'>('swap');

  useEffect(() => {
    const fetchData = async () => {
      // const token = sessionStorage.getItem('token');
      // if (!token) {
      //   toast.error('User token not found');
      //   return;
      // }

      try {
        
        const [itemRes, myItemsRes] = await Promise.all([
          fetch(`https://rewear-w7ik.onrender.com/api/items/${id}`,{credentials:'include'} ),
          fetch(`https://rewear-w7ik.onrender.com/api/items/user`,{credentials:'include'}),
        ]);

        const [itemData, myItemsData] = await Promise.all([
          itemRes.json(),
          myItemsRes.json(),
        ]);

        setItem(itemData);
        setMyItems(myItemsData.filter((i: Item) => i.available && i.id !== Number(id)));
      } catch (err) {
        console.error('Error fetching item or user items:', err);
        toast.error('Failed to fetch item details');
      }
    };

    fetchData();
  }, [id]);

  const handleSwapRequest = async () => {
    
    setLoading(true);
    try {
      const res = await fetch('https://rewear-w7ik.onrender.com/api/swaps', {
        method: 'POST',
        headers:{
          'Content-type':'application/json'
        },
        credentials:'include',
        body: JSON.stringify({
          itemId: Number(id),
          offeredItemId: mode === 'swap' ? Number(offeredItemId) : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Swap request sent!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to send request');
      }
    } catch (err) {
      console.error('Error sending swap request:', err);
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!item) return <p>Loading...</p>;

  return (
    <main className="p-8 max-w-2xl mx-auto bg-muted rounded-xl shadow-md">
      <Button asChild variant="secondary" className="mb-4">
            <Link href="/items">← Back to items</Link>
        </Button>
      <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
      <p className="text-muted-foreground mb-4">{item.description}</p>

      <ul className="mb-4 space-y-1 text-sm">
        <li><strong>Category:</strong> {item.category}</li>
        <li><strong>Size:</strong> {item.size}</li>
        <li><strong>Condition:</strong> {item.condition}</li>
        <li><strong>Tags:</strong> {item.tags.join(', ')}</li>
        {item.isRedeemable && (
          <li><strong>Points Cost:</strong> {item.pointsCost}</li>
        )}
      </ul>

      {item.images.length > 0 && (
        <div className="mb-6">
          
          <Carousel className="w-full max-w-xl mb-6">
  <CarouselContent>
    {item.images.map((url, index) => (
      <CarouselItem key={index} className="flex justify-center">
        
        <img
          src={`http://localhost:8000${url}`}
          alt={`Image ${index + 1}`}
          className="h-64 object-contain rounded-xl shadow-md"
        />

      </CarouselItem>
    ))}
  </CarouselContent>
   <CarouselPrevious />
  <CarouselNext />
</Carousel>

        </div>
      )}

      {/* Mode Selection */}
      <div className="mb-4 flex gap-4">
        <Button variant={mode === 'swap' ? 'default' : 'outline'} onClick={() => setMode('swap')}>
          Swap with Item
        </Button>
        {item.isRedeemable && (
          <Button variant={mode === 'redeem' ? 'default' : 'outline'} onClick={() => setMode('redeem')}>
            Redeem via Points
          </Button>
        )}
      </div>

      {/* Swap with another item */}
      {mode === 'swap' && (
        <div className="mb-6">
          <Label className="mb-2 block">Choose an item to offer</Label>
          <Select onValueChange={(value) => setOfferedItemId(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your item" />
            </SelectTrigger>
            <SelectContent>
              {myItems.map((myItem) => (
                <SelectItem key={myItem.id} value={String(myItem.id)}>
                  {myItem.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button
        onClick={handleSwapRequest}
        disabled={loading || (mode === 'swap' && !offeredItemId)}
        className="w-full"
      >
        {loading ? 'Requesting...' : 'Send Swap Request'}
      </Button>
    </main>
  );
}
