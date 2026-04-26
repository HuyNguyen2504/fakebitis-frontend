'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { MapPin, Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      fetchAddresses();
    }
  }, [status]);

  const fetchAddresses = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${apiBase}/user/addresses`, {
        headers: { 'Authorization': `Bearer ${session.user.email}` },
        cache: 'no-store'
      });
      const data = await res.json();
      setAddresses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase flex items-center gap-3">
          <MapPin className="text-primary" /> Shipping Addresses
        </h1>
        <Link href="/profile/addresses/add" className="bg-primary text-white hover:bg-primary-dark px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
          <Plus size={16} /> Add Address
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-foreground/10 rounded-2xl">
            <p className="text-foreground/50 mb-4">You have no saved addresses.</p>
            <Link href="/profile/addresses/add" className="text-primary font-bold hover:underline">
              Add your first address
            </Link>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr._id} className="border border-foreground/10 rounded-2xl p-6 relative bg-background shadow-sm">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                  Default
                </span>
              )}
              <h3 className="font-bold text-lg mb-1 pr-16">{addr.name}</h3>
              <p className="text-sm font-semibold text-foreground/70 mb-3">{addr.phone}</p>
              
              <div className="text-sm text-foreground/80 flex flex-col gap-1 mb-6">
                <p>{addr.addressLine}</p>
                <p>{addr.ward}, {addr.city}</p>
                <p>{addr.province}</p>
              </div>

              <Link 
                href={`/profile/addresses/${addr._id}/edit`}
                className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors"
              >
                <Edit size={16} /> Edit
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
