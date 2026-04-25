'use client';
import { useContext, useState, useEffect, useMemo } from 'react';
import { CartContext } from '@/components/Providers';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { Trash2, ShoppingCart, ArrowRight, CheckSquare, Square, X } from 'lucide-react';

export default function CartPage() {
  const { cartItems, removeFromCart, clearCart, setCartItems } = useContext(CartContext);
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [selectedItemKeys, setSelectedItemKeys] = useState(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Initialize all items as selected by default when cart changes
  useEffect(() => {
    const allKeys = new Set(cartItems.map(item => `${item.product}-${item.size}-${item.color}`));
    setSelectedItemKeys(allKeys);
  }, [cartItems]);

  const toggleSelection = (itemKey) => {
    const newSelection = new Set(selectedItemKeys);
    if (newSelection.has(itemKey)) {
      newSelection.delete(itemKey);
    } else {
      newSelection.add(itemKey);
    }
    setSelectedItemKeys(newSelection);
  };

  const selectedItems = useMemo(() => {
    return cartItems.filter(item => selectedItemKeys.has(`${item.product}-${item.size}-${item.color}`));
  }, [cartItems, selectedItemKeys]);

  const total = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [selectedItems]);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace('/api', '');
  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiBase}${url}`;
  };

  const handleCheckoutClick = () => {
    if (selectedItems.length === 0) return;
    if (!session) {
      signIn('google');
      return;
    }
    setShowConfirmModal(true);
  };

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [bankCode, setBankCode] = useState(''); // Default: let VNPAY show all

  useEffect(() => {
    if (showConfirmModal && session) {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      setLoadingAddresses(true);
      fetch(`${apiBase}/user/addresses`, {
        headers: { 'Authorization': `Bearer ${session.user.email}` },
        cache: 'no-store'
      })
      .then(res => res.json())
      .then(data => {
        setAddresses(data);
        const defaultAddr = data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAddresses(false));
    }
  }, [showConfirmModal, session]);

  const proceedToVNPAY = async () => {
    if (!selectedAddressId && addresses.length > 0) {
      alert('Please select a shipping address');
      return;
    }
    
    setLoading(true);
    const selectedAddr = addresses.find(a => a._id === selectedAddressId);
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    
    try {
      const res = await fetch(`${apiBase}/payment/create_payment_url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}` 
        },
        body: JSON.stringify({
          amount: total, // Send full amount
          items: selectedItems,
          bankCode: bankCode, // Dynamic bank code
          address: selectedAddr
        })
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Server error response:', errorText);
        alert('Server returned an error. Is the backend running on port 5000?');
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.url) {
        // We no longer clear the cart here. 
        // It will be cleared in HistoryPage upon success.
        window.location.href = data.url;
      } else {
        alert('Payment initiation failed.');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Checkout error: Make sure the backend server is running.');
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <ShoppingCart size={64} className="text-foreground/20" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Link href="/products" className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-12 relative">
      <h1 className="text-3xl font-black uppercase mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1 flex flex-col gap-6">
          {cartItems.map((item, idx) => {
            const itemKey = `${item.product}-${item.size}-${item.color}`;
            const isSelected = selectedItemKeys.has(itemKey);
            return (
              <div key={`${itemKey}-${idx}`} className={`flex gap-4 border p-4 rounded-xl items-center transition-all ${isSelected ? 'border-primary/50 bg-primary/5' : 'border-foreground/10'}`}>
                <button onClick={() => toggleSelection(itemKey)} className="text-primary p-2">
                  {isSelected ? <CheckSquare size={24} /> : <Square size={24} className="text-foreground/30" />}
                </button>
                <img src={formatImageUrl(item.image)} alt={item.name} className="w-24 h-24 object-cover rounded-lg bg-accent" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-foreground/60 mb-2">
                    <div className="w-4 h-4 rounded-full border border-foreground/20" style={{ backgroundColor: item.color }}></div>
                    <span>Size: {item.size}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-primary">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                    <p className="text-sm font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.product, item.size, item.color)}
                  className="p-2 text-foreground/40 hover:text-primary transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
          <button 
            onClick={clearCart}
            className="text-sm text-foreground/50 hover:text-foreground self-start underline"
          >
            Clear Cart
          </button>
        </div>

        <div className="w-full lg:w-[350px]">
          <div className="bg-accent rounded-xl p-6 flex flex-col gap-4 sticky top-24">
            <h2 className="text-xl font-bold border-b border-foreground/10 pb-4">Order Summary</h2>
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground/70">Selected Items ({selectedItems.length})</span>
              <span className="font-semibold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-foreground/10 pb-4">
              <span className="text-foreground/70">Shipping</span>
              <span className="font-semibold">{selectedItems.length > 0 ? 'Free' : '-'}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold mt-2">
              <span>Total</span>
              <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
            </div>
            
            <button 
              onClick={handleCheckoutClick}
              disabled={loading || selectedItems.length === 0}
              className="mt-4 w-full bg-foreground text-background py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-foreground/80 transition-all disabled:opacity-50"
            >
              Checkout <ArrowRight size={20} />
            </button>
            {!session && (
              <p className="text-xs text-center text-foreground/60 mt-2">You will be asked to login before checkout.</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-foreground/10">
              <h2 className="text-2xl font-bold">Confirm Order</h2>
              <button onClick={() => setShowConfirmModal(false)} className="text-foreground/50 hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 max-h-[40vh] overflow-y-auto flex flex-col gap-4 border-b border-foreground/10">
              {selectedItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <div className="flex-1 flex gap-3 items-center">
                    <img src={formatImageUrl(item.image)} alt={item.name} className="w-12 h-12 rounded object-cover" />
                    <div>
                      <p className="font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-foreground/60">Size: {item.size} x{item.quantity}</p>
                    </div>
                  </div>
                  <div className="font-bold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-accent flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Shipping Address</h3>
                  <Link href="/profile/addresses" className="text-xs text-primary font-bold hover:underline">Manage</Link>
                </div>
                {loadingAddresses ? (
                  <p className="text-sm text-foreground/60">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                  <div className="bg-background border border-foreground/10 rounded-lg p-4 text-center">
                    <p className="text-sm text-foreground/60 mb-2">You don't have any shipping address.</p>
                    <Link href="/profile/addresses/add" className="text-primary font-bold text-sm hover:underline">Add New Address</Link>
                  </div>
                ) : (
                  <select 
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full bg-background border border-foreground/10 rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="" disabled>Select an address</option>
                    {addresses.map(a => (
                      <option key={a._id} value={a._id}>
                        {a.name} - {a.addressLine}, {a.ward}, {a.city} {a.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-sm uppercase tracking-wider">Payment Method</h3>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${bankCode === '' ? 'border-primary bg-primary/5' : 'border-foreground/10'}`}>
                    <input type="radio" name="payment" value="" checked={bankCode === ''} onChange={(e) => setBankCode(e.target.value)} className="accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">VNPAY Default</p>
                      <p className="text-xs text-foreground/60">Choose at VNPAY gateway</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${bankCode === 'VNPAYQR' ? 'border-primary bg-primary/5' : 'border-foreground/10'}`}>
                    <input type="radio" name="payment" value="VNPAYQR" checked={bankCode === 'VNPAYQR'} onChange={(e) => setBankCode(e.target.value)} className="accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">VNPAY-QR</p>
                      <p className="text-xs text-foreground/60">Scan with Mobile Banking Apps</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${bankCode === 'VNBANK' ? 'border-primary bg-primary/5' : 'border-foreground/10'}`}>
                    <input type="radio" name="payment" value="VNBANK" checked={bankCode === 'VNBANK'} onChange={(e) => setBankCode(e.target.value)} className="accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">Local ATM Card</p>
                      <p className="text-xs text-foreground/60">Domestic Bank Accounts</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${bankCode === 'INTCARD' ? 'border-primary bg-primary/5' : 'border-foreground/10'}`}>
                    <input type="radio" name="payment" value="INTCARD" checked={bankCode === 'INTCARD'} onChange={(e) => setBankCode(e.target.value)} className="accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-bold">International Cards</p>
                      <p className="text-xs text-foreground/60">Visa, Mastercard, JCB</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center text-xl font-bold mt-2 pt-4 border-t border-foreground/10">
                <span>Total Amount:</span>
                <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</span>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 font-bold border-2 border-foreground/20 rounded-xl hover:bg-foreground/5 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={proceedToVNPAY}
                  disabled={loading || (addresses.length === 0)}
                  className="flex-1 py-3 font-bold bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Pay with VNPAY'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
