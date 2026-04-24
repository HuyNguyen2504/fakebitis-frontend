'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditAddressPage({ params }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    addressLine: '',
    ward: '',
    city: '',
    province: '',
    isDefault: false
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }
    
    if (status === 'authenticated') {
      fetchAddress();
    }
  }, [status]);

  const fetchAddress = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/user/addresses`, {
        headers: { 'Authorization': `Bearer ${session.user.email}` },
        cache: 'no-store'
      });
      const data = await res.json();
      const addr = data.find(a => a._id === id);
      if (addr) {
        setFormData(addr);
      } else {
        router.push('/profile/addresses');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/user/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        router.push('/profile/addresses');
      } else {
        alert('Failed to update address');
        setSaving(false);
      }
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    setSaving(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/user/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.user.email}` }
      });
      if (res.ok) {
        router.push('/profile/addresses');
      } else {
        alert('Failed to delete address');
        setSaving(false);
      }
    } catch (error) {
      console.error(error);
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">
      <Link href="/profile/addresses" className="inline-flex items-center gap-2 text-sm font-bold text-foreground/60 hover:text-foreground mb-8 transition-colors">
        <ArrowLeft size={16} /> Back to Addresses
      </Link>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">Edit Address</h1>
        <button 
          onClick={handleDelete}
          className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-bold"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>

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
            />
          </div>
        </div>

        <div className="flex items-center gap-3 py-2 border-t border-b border-foreground/10 mt-2">
          <input 
            type="checkbox" 
            id="isDefault"
            checked={formData.isDefault}
            onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
            className="w-5 h-5 accent-primary cursor-pointer"
          />
          <label htmlFor="isDefault" className="font-semibold text-sm cursor-pointer select-none">
            Set as default shipping address
          </label>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-primary text-white hover:bg-primary-dark font-bold text-lg py-4 rounded-xl mt-2 transition-colors disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
