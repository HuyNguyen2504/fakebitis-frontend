'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Package, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      fetch(`${apiBase}/orders/history`, {
        headers: {
          'Authorization': `Bearer ${session.user.email}` // Simple demo auth
        }
      })
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  if (status === 'loading' || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading your history...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Please log in to view order history</h2>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-accent rounded-xl p-12 text-center">
          <Package size={48} className="text-foreground/30 mb-4" />
          <h3 className="text-xl font-bold mb-2">No orders found</h3>
          <p className="text-foreground/60 mb-6">Looks like you haven't made any purchases yet.</p>
          <Link href="/products" className="bg-foreground text-background px-6 py-2 rounded-lg font-semibold">
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => (
            <div key={order._id} className="border border-foreground/10 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-accent/50 p-4 border-b border-foreground/10 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Order Date</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                  <p className="font-bold text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    order.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                    order.status === 'Failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-mono text-sm">{order._id.slice(-8)}</p>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover bg-accent" />
                    <div className="flex-1">
                      <Link href={`/products/${item.product}`} className="font-semibold hover:text-primary transition-colors flex items-center gap-1 w-fit">
                        {item.name} <ExternalLink size={14} className="text-foreground/40" />
                      </Link>
                      <p className="text-sm text-foreground/60">Size: {item.size} | Qty: {item.quantity}</p>
                    </div>
                    <div className="font-semibold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
