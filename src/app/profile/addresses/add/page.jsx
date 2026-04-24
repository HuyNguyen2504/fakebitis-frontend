'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddAddressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine: '',
    ward: '',
    city: '',
    province: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/user/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/profile/addresses');
      } else {
        alert('Failed to add address');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">
      <Link href="/profile/addresses" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Addresses
      </Link>

      <h1 className="text-3xl font-black uppercase mb-8">Add New Address</h1>

      <form onSubmit={handleSubmit} className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold uppercase mb-2 block">Full Name</label>
            <input 
              required 
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border border-foreground/10 rounded-lg p-3 focus:outline-none focus:border-primary" 
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase mb-2 block">Phone Number</label>
            <input 
              required 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-foreground/10 rounded-lg p-3 focus:outline-none focus:border-primary" 
              placeholder="0901234567"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase mb-2 block">Address Line</label>
          <input 
            required 
            type="text"
            value={formData.addressLine}
            onChange={(e) => setFormData({...formData, addressLine: e.target.value})}
            className="w-full border border-foreground/10 rounded-lg p-3 focus:outline-none focus:border-primary" 
            placeholder="123 Example Street, Apt 4B"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-bold uppercase mb-2 block">Ward</label>
            <input 
              required 
              type="text"
              value={formData.ward}
              onChange={(e) => setFormData({...formData, ward: e.target.value})}
              className="w-full border border-foreground/10 rounded-lg p-3 focus:outline-none focus:border-primary" 
              placeholder="Ward 1"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase mb-2 block">City/District</label>
            <input 
              required 
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              className="w-full border border-foreground/10 rounded-lg p-3 focus:outline-none focus:border-primary" 
              placeholder="District 1"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase mb-2 block">Province</label>
            <input 
              required 
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({...formData, province: e.target.value})}
              className="w-full border border-foreground/10 rounded-lg p-3 focus:outline-none focus:border-primary" 
              placeholder="Ho Chi Minh City"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary text-white hover:bg-primary-dark font-bold text-lg py-4 rounded-xl mt-4 transition-colors disabled:opacity-70"
        >
          {loading ? 'Saving...' : 'Save Address'}
        </button>
      </form>
    </div>
  );
}
