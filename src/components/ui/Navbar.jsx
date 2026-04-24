'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ShoppingCart, User, LogOut, History, ShieldAlert, Search, MapPin } from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../Providers";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const { cartItems } = useContext(CartContext);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiBase}/products/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to fetch categories', err));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-foreground/10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-black text-primary tracking-tighter uppercase shrink-0">
          Biti's
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-6 font-semibold text-sm uppercase tracking-wider">
          {Array.isArray(categories) && categories.slice(0, 4).map(cat => (
            <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-primary transition-colors">
              {cat}
            </Link>
          ))}
          <Link href="/products" className="hover:text-primary transition-colors">All Collections</Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden md:flex items-center relative">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/5 border border-foreground/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
          <button type="submit" className="absolute right-3 text-foreground/50 hover:text-primary">
            <Search size={18} />
          </button>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/cart" className="relative text-foreground hover:text-primary transition-colors">
            <ShoppingCart size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 group relative cursor-pointer">
                {session.user.image ? (
                  <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center">
                    <User size={16} />
                  </div>
                )}
                
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-foreground/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
                  <div className="px-4 py-2 border-b border-foreground/10 mb-2">
                    <p className="font-semibold text-sm truncate">{session.user.name}</p>
                    <p className="text-xs text-foreground/60 truncate">{session.user.email}</p>
                  </div>
                  
                  {session.user.role === 'admin' && (
                    <Link href="/admin" className="px-4 py-2 text-sm hover:bg-foreground/5 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-primary" /> Admin Dashboard
                    </Link>
                  )}
                  
                  <Link href="/profile/addresses" className="px-4 py-2 text-sm hover:bg-foreground/5 flex items-center gap-2">
                    <MapPin size={16} /> Shipping Addresses
                  </Link>
                  
                  <Link href="/history" className="px-4 py-2 text-sm hover:bg-foreground/5 flex items-center gap-2">
                    <History size={16} /> Order History
                  </Link>
                  
                  <button onClick={() => signOut()} className="px-4 py-2 text-sm text-left hover:bg-foreground/5 text-primary flex items-center gap-2">
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => signIn('google')} 
              className="text-sm font-semibold bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/80 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
