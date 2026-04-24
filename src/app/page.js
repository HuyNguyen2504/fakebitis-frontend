import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-background">
      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-foreground mb-6">
        Welcome to Biti's Style
      </h1>
      <p className="text-xl text-foreground/70 mb-10 max-w-2xl">
        Experience high-performance footwear with a modern, aesthetic shopping experience.
      </p>
      
      <Link 
        href="/products" 
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-primary rounded-full overflow-hidden transition-all hover:scale-105 shadow-xl hover:shadow-primary/50"
      >
        <span className="relative z-10 flex items-center gap-2">
          Shop Now
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </span>
        <div className="absolute inset-0 bg-primary-dark translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
      </Link>
    </div>
  );
}
