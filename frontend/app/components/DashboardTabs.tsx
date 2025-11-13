'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ListingItem {
  id: number;
  title: string;
}

interface SwapData {
  id: number;
  status: string;
  item: {
    id: number;
    title: string;
  };
  requester: {
    id: number;
    name: string;
  };
  owner: {
    id: number;
    name: string;
  };
}

export default function DashboardTabs() {
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<SwapData[]>([]);
  const [swaps, setSwaps] = useState<SwapData[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem('token');
         const headers = {
          'Authorization': `Bearer ${token}`,
        };

        const [res1, res2, res3] = await Promise.all([
          fetch(`https://rewear-w7ik.onrender.com/api/items/user`, {
            method: 'GET',
            headers,
            credentials: 'include',
          }),
          fetch(`https://rewear-w7ik.onrender.com/api/swaps/incoming`, {
            method: 'GET',
            headers,
            credentials: 'include',
          }),
          fetch(`https://rewear-w7ik.onrender.com/api/swaps/history`, {
            method: 'GET',
            headers,
            credentials: 'include',
          }),
        ]);

        const [listingsData, requestsData, swapsData] = await Promise.all([
          res1.json(),
          res2.json(),
          res3.json(),
        ]);

        setListings(listingsData || []);
        setIncomingRequests(requestsData || []);
        setSwaps(swapsData || []);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchData();
  }, [refresh]);

  const handleRespond = async (swapId: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`https://rewear-w7ik.onrender.com/api/swaps/respond/${swapId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}` 
        },
        body: JSON.stringify({ decision:status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Swap ${status} successfully`);
        setRefresh(prev => !prev); // trigger re-fetch
      } else {
        toast.error(data.error || 'Failed to update swap');
      }
    } catch (err) {
      toast.error('Something went wrong while updating swap.');
    }
  };

  const renderListings = () => (
    <ul className="space-y-2">
      {listings.map((item) => (
        <li key={item.id} className="p-4 bg-muted rounded-lg">
          <Link href={`/items/${item.id}`} className="text-primary hover:underline">
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );

  const renderIncomingRequests = () => (
    <ul className="space-y-4">
      {incomingRequests.map((swap) => (
        <li key={swap.id} className="p-4 bg-muted rounded-lg space-y-2">
          <p>
            <strong>{swap.requester.name}</strong> wants to swap your item{' '}
            <Link href={`/items/${swap.item.id}`} className="text-primary hover:underline">
              {swap.item.title}
            </Link>
          </p>
          <p className="text-sm text-muted-foreground">Status: {swap.status}</p>
          {swap.status === 'pending' && (
            <div className="flex gap-2">
              <Button variant="default" onClick={() => handleRespond(swap.id, 'approved')}>
                Approve
              </Button>
              <Button variant="destructive" onClick={() => handleRespond(swap.id, 'rejected')}>
                Reject
              </Button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const renderSwaps = () => (
    <ul className="space-y-4">
      {swaps.map((swap) => (
        <li key={swap.id} className="p-4 bg-muted rounded-lg">
          <p>
            You requested{' '}
            <Link href={`/items/${swap.item.id}`} className="text-primary hover:underline">
              {swap.item.title}
            </Link>{' '}
            from <strong>{swap.owner.name}</strong>
          </p>
          <p className="text-sm text-muted-foreground">Status: {swap.status}</p>
        </li>
      ))}
    </ul>
  );

  return (
    <Tabs defaultValue="listings" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="listings">My Listings</TabsTrigger>
        <TabsTrigger value="requests">Incoming Requests</TabsTrigger>
        <TabsTrigger value="swaps">My Swaps</TabsTrigger>
      </TabsList>

      <TabsContent value="listings">
        {listings.length > 0 ? renderListings() : <p>You haven’t listed any items yet.</p>}
      </TabsContent>

      <TabsContent value="requests">
        {incomingRequests.length > 0 ? renderIncomingRequests() : <p>No incoming requests at the moment.</p>}
      </TabsContent>

      <TabsContent value="swaps">
        {swaps.length > 0 ? renderSwaps() : <p>No past swaps yet.</p>}
      </TabsContent>
    </Tabs>
  );
}
