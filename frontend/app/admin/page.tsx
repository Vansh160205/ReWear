'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { headers } from 'next/headers';

interface Item {
  id: number;
  title: string;
  description: string;
  status: string; // pending, approved, rejected
  owner: {
    id: number;
    name: string;
  };
}

export default function AdminPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        const itemRes = await fetch('http://localhost:8000/api/admin/pending-items',
            {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}` || '',
                },
                credentials: 'include',
            }
        );

        const itemsData = await itemRes.json();
        console.log('Pending items:', itemsData);
        setItems(itemsData);
      } catch (err) {
        toast.error('Failed to fetch pending items');
      }
    };

    fetchPendingItems();
  }, [loading]);

  const handleItemStatusChange = async (itemId: number, decision: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/moderate-item`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}` || '',
                },
                credentials: 'include',
                body: JSON.stringify({
                    itemId,
                    decision,
                }),
            });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Item ${decision}`);
        setLoading((prev) => !prev); // re-fetch items
      } else {
        toast.error(data.error || 'Failed to update item');
      }
    } catch (err) {
      toast.error('Something went wrong');
    }
  };
  let pendingItems:Item[]=[];
  if(items.length>0){
      pendingItems = items?.filter((item) => item.status === 'pending');
    }
  return (
    <main className="p-8 space-y-10">
      <section className="space-y-4">
        <h2 className="text-xl font-bold">Pending Items</h2>
        {pendingItems.length === 0 ? (
          <p className="text-muted-foreground">No pending items.</p>
        ) : (
          <ul className="space-y-4">
            {pendingItems.map((item) => (
              <li key={item.id} className="p-4 bg-muted rounded-lg">
                <p><strong>Title:</strong> {item.title}</p>
                <p><strong>Description:</strong> {item.description}</p>
                <p><strong>Owner:</strong> {item.owner.name}</p>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => handleItemStatusChange(item.id, 'approved')}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleItemStatusChange(item.id, 'rejected')}>Reject</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
