'use client';
import { useState, useContext } from 'react';
import { ShoppingBag, Truck, RotateCcw } from 'lucide-react';
import { CartContext } from '@/components/Providers';

export default function ProductActions({ product }) {
  const { variants = [] } = product;
  const { addToCart } = useContext(CartContext);
  const [added, setAdded] = useState(false);

  // Extract unique colors
  const uniqueColors = [...new Set(variants.map(v => v.color))];
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || null);
  
  // Get sizes for the selected color
  const availableSizes = variants.filter(v => v.color === selectedColor);
  const [selectedSize, setSelectedSize] = useState(null);

  const selectedVariant = availableSizes.find(v => v.size === selectedSize);
  const stock = selectedVariant ? selectedVariant.stock : null;

  const handleAddToCart = () => {
    if (!selectedColor) return alert('Please select a color first');
    if (!selectedSize) return alert('Please select a size first');
    if (stock === 0) return alert('Out of stock');
    
    addToCart(product, selectedSize, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Color Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider text-foreground/80">
          Color: <span className="text-foreground">{selectedColor || 'None'}</span>
        </h3>
        <div className="flex items-center gap-3">
          {uniqueColors.map(color => (
            <button 
              key={color}
              onClick={() => {
                setSelectedColor(color);
                setSelectedSize(null); // Reset size when color changes
              }}
              className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-foreground/20 hover:border-primary/50'}`} 
              style={{ backgroundColor: color }}
            ></button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/80">Select Size</h3>
          <button className="text-sm text-foreground/60 underline hover:text-primary transition-colors">Size Guide</button>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {availableSizes.map(({ size, stock: variantStock }) => (
            <button
              key={size}
              disabled={variantStock === 0}
              onClick={() => setSelectedSize(size)}
              className={`py-3 border-2 rounded-xl text-center font-bold transition-all ${
                variantStock === 0 
                  ? 'bg-accent/50 border-transparent text-foreground/30 cursor-not-allowed'
                  : selectedSize === size 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-foreground/10 hover:border-foreground text-foreground'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {!selectedSize && <p className="text-sm text-primary mt-3 font-medium">Please select a size.</p>}
        {stock !== null && stock > 0 && stock <= 5 && (
          <p className="text-sm text-orange-500 mt-2 font-bold animate-pulse">Hurry! Only {stock} left in stock!</p>
        )}
        {stock === 0 && (
          <p className="text-sm text-red-500 mt-2 font-bold">Out of stock for this size/color combination.</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 mb-10">
        <button 
          onClick={handleAddToCart}
          disabled={!selectedColor || !selectedSize || stock === 0}
          className="w-full bg-primary hover:bg-primary-dark text-white h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag /> {added ? 'Added!' : stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-foreground/10 pt-6">
        <div className="flex items-center gap-3">
          <Truck className="text-primary" />
          <div>
            <p className="font-semibold text-sm">Free Shipping</p>
            <p className="text-xs text-foreground/60">On orders over 1,000,000đ</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RotateCcw className="text-primary" />
          <div>
            <p className="font-semibold text-sm">7 Days Return</p>
            <p className="text-xs text-foreground/60">No questions asked</p>
          </div>
        </div>
      </div>
    </>
  );
}
