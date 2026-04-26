'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState, Suspense, useContext } from 'react';
import { Package, ExternalLink, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { CartContext } from '@/components/Providers';
import Link from 'next/link';

function HistoryContent() {
  const { data: session, status } = useSession();
  const { cartItems, setCartItems } = useContext(CartContext);
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const paymentStatus = searchParams.get('status');
  const errorCode = searchParams.get('code');
  const orderId = searchParams.get('orderId');

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${apiUrl}/orders/history`, {
        headers: {
          'Authorization': `Bearer ${session.user.email}`
        }
      });
      const data = await res.json();
      setOrders(data);
      
      // If payment was successful, clear those items from cart
      if (paymentStatus === 'success' && orderId) {
        const successfulOrder = data.find(o => o._id === orderId);
        if (successfulOrder) {
          const paidItems = successfulOrder.items;
          const remainingCart = cartItems.filter(cartItem => {
            return !paidItems.some(paidItem => 
              paidItem.product === cartItem.product && 
              paidItem.size === cartItem.size && 
              paidItem.color === cartItem.color
            );
          });
          setCartItems(remainingCart);
          // Remove query params to avoid re-clearing
          window.history.replaceState({}, '', '/history');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, session]);

  const handleDeleteOrder = async (id) => {
    if (!confirm('Are you sure you want to delete this order from history?')) return;
    
    try {
      const res = await fetch(`${apiUrl}/payment/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.user.email}`
        }
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o._id !== id));
      } else {
        alert('Failed to delete order');
      }
    } catch (error) {
      console.error(error);
      alert('Error deleting order');
    }
  };

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

      {paymentStatus === 'success' && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-green-500 text-white p-2 rounded-full">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-green-800 text-lg">Payment Successful!</h3>
            <p className="text-green-700 text-sm">Your order has been confirmed and the items have been removed from your cart.</p>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-red-500 text-white p-2 rounded-full">
            <XCircle size={24} />
          </div>
          <div>
            <h3 className="font-bold text-red-800 text-lg">Payment Failed</h3>
            <p className="text-red-700 text-sm">
              {errorCode === '24' ? 'Transaction cancelled by user.' : 'There was an error processing your payment.'}
            </p>
          </div>
        </div>
      )}

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
                <div className="flex items-center gap-6">
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-foreground/60 font-medium uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm">{order._id.slice(-8)}</p>
                  </div>
                  <button 
                    onClick={() => handleDeleteOrder(order._id)}
                    className="p-2 text-foreground/30 hover:text-red-500 transition-colors"
                    title="Delete History"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col gap-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img src={formatImageUrl(item.image)} alt={item.name} className="w-16 h-16 rounded object-cover bg-accent" />
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

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
