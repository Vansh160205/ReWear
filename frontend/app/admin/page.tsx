'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface Item {
  id: number;
  title: string;
  description: string;
  status: string; // pending, approved, rejected
  isFeatured?: boolean;
  owner: {
    id: number;
    name: string;
  };
}

export default function AdminPanel() {
  const [pendingItems, setPendingItems] = useState<Item[]>([]);
  const [approvedItems, setApprovedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('token');

      // Fetch pending items
      const pendingRes = await fetch('https://rewear-w7ik.onrender.com/api/admin/pending-items', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:'include'
      });
      const pending = await pendingRes.json();
      setPendingItems(pending || []);

      // Fetch approved (non-featured) items
      const approvedRes = await fetch('https://rewear-w7ik.onrender.com/api/admin/getApprovedItems/', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials:'include'
      });
      const approved = await approvedRes.json();
      setApprovedItems(approved || []);
    } catch (err) {
      toast.error('Failed to fetch items');
    }
  };

  useEffect(() => {
    fetchData();
  }, [loading]);

  const handleItemStatusChange = async (itemId: number, decision: 'approved' | 'rejected') => {
  try {
    const res = await fetch(`https://rewear-w7ik.onrender.com/api/admin/moderate-item`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, decision }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(`Item ${decision}`);
      setLoading(prev => !prev);
    } else {
      toast.error(data.error || 'Failed to update item');
    }
  } catch (err) {
    toast.error('Something went wrong');
  }
};

const handleMakeFeatured = async (itemId: number) => {
  try {
    const res = await fetch(`https://rewear-w7ik.onrender.com/api/admin/makeFeatured`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, isFeatured: true }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success('Item marked as featured');
      setLoading(prev => !prev);
    } else {
      toast.error(data.error || 'Failed to feature item');
    }
  } catch (err) {
    toast.error('Failed to make featured');
  }
};

  return  (
    <main className="p-6">
      <Link href="/admin/uploadCsv"><Button>Upload Items csv</Button></Link>
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Items</TabsTrigger>
          <TabsTrigger value="approved">Approved Items</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <h2 className="text-xl font-semibold mb-4">Pending Items</h2>
          {pendingItems.length === 0 ? (
            <p className="text-muted-foreground">No pending items.</p>
          ) : (
            <ul className="space-y-4">
              {pendingItems.map(item => (
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
        </TabsContent>

        <TabsContent value="approved">
          <h2 className="text-xl font-semibold mb-4">Approved (Not Featured)</h2>
          {approvedItems.length === 0 ? (
            <p className="text-muted-foreground">No non-featured approved items.</p>
          ) : (
            <ul className="space-y-4">
              {approvedItems.map(item => (
                <li key={item.id} className="p-4 bg-muted rounded-lg">
                  <p><strong>Title:</strong> {item.title}</p>
                  <p><strong>Description:</strong> {item.description}</p>
                  <p><strong>Owner:</strong> {item.owner.name}</p>
                  <div className="mt-2">
                    <Button onClick={() => handleMakeFeatured(item.id)}>Make Featured</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
