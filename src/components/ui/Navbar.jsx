'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { ShoppingCart, User, LogOut, History, ShieldAlert, Search, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../Providers";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const { cartItems } = useContext(CartContext);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);
  
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const fetchCats = async () => {
      try {
        const res = await fetch(`${apiBase}/products/categories?t=${Date.now()}`, { cache: 'no-store' });
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      } catch (err) { console.error('Failed to fetch categories', err); }
    };
    fetchCats();
    // Refresh when window regains focus or custom event is fired
    window.addEventListener('focus', fetchCats);
    window.addEventListener('categoriesUpdated', fetchCats);
    return () => {
      window.removeEventListener('focus', fetchCats);
      window.removeEventListener('categoriesUpdated', fetchCats);
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

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

        {/* Links / Category Slider */}
        <div className="hidden lg:flex items-center gap-2 flex-1 max-w-xl relative px-8 group/nav">
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 p-1 hover:text-primary opacity-0 group-hover/nav:opacity-100 transition-opacity bg-background/50 rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex items-center gap-6 font-semibold text-xs uppercase tracking-widest overflow-x-auto no-scrollbar scroll-smooth py-2"
          >
            {Array.isArray(categories) && categories.map(cat => (
              <Link key={cat} href={`/products?category=${encodeURIComponent(cat)}`} className="hover:text-primary transition-colors whitespace-nowrap">
                {cat}
              </Link>
            ))}
            <Link href="/products" className="hover:text-primary transition-colors whitespace-nowrap font-black text-primary border-l border-foreground/10 pl-6">
              All Collections
            </Link>
          </div>

          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 p-1 hover:text-primary opacity-0 group-hover/nav:opacity-100 transition-opacity bg-background/50 rounded-full"
          >
            <ChevronRight size={20} />
          </button>
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
