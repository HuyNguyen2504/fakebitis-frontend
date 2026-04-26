'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44'];


const PRICE_RANGES = [
  { label: 'Under 500,000đ', min: 0, max: 500000 },
  { label: '500,000đ - 1,000,000đ', min: 500000, max: 1000000 },
  { label: 'Over 1,000,000đ', min: 1000000, max: 99999999 },
];

function FilterSection({ title, defaultOpen = true, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-foreground/10 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between font-semibold text-foreground"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <div className={`mt-4 grid gap-3 overflow-hidden transition-all ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
        <div className="min-h-0 flex flex-col gap-3">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function FilterSidebar({ filters, updateFilter }) {
  const [dynamicColors, setDynamicColors] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    const fetchColors = async () => {
      try {
        const res = await fetch(`${apiBase}/products/colors`);
        const data = await res.json();
        setDynamicColors(data);
      } catch (err) { console.error('Failed to fetch colors', err); }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${apiBase}/products/categories`);
        const data = await res.json();
        setDynamicCategories(data);
      } catch (err) { console.error('Failed to fetch categories', err); }
    };

    fetchColors();
    fetchCategories();
  }, []);

  
  const handleCheckbox = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const handlePriceRange = (min, max) => {
    updateFilter('minPrice', min);
    updateFilter('maxPrice', max);
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <h2 className="text-xl font-bold mb-4 hidden lg:block">Filters</h2>
      
      <div className="flex flex-col">
        {/* Categories */}
        <FilterSection title="Categories">
          <div className="space-y-2">
            {dynamicCategories.map(cat => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.category?.includes(cat) || false}
                    onChange={() => handleCheckbox('category', cat)}
                    className="peer appearance-none w-5 h-5 border-2 border-foreground/10 rounded-md checked:bg-primary checked:border-primary transition-all"
                  />
                  <Check size={14} className="absolute left-0.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-medium text-foreground/70 group-hover:text-primary transition-colors uppercase">{cat}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price">
          {PRICE_RANGES.map(range => {
            const isActive = filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <label key={range.label} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="price_range"
                  checked={isActive}
                  onChange={() => handlePriceRange(range.min, range.max)}
                  className="w-4 h-4 text-primary focus:ring-primary accent-primary"
                />
                <span className="text-sm group-hover:text-primary transition-colors">{range.label}</span>
              </label>
            )
          })}
          {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
            <button 
              onClick={() => { updateFilter('minPrice', undefined); updateFilter('maxPrice', undefined); }}
              className="text-xs text-primary text-left hover:underline mt-2"
            >
              Clear Price Filter
            </button>
          )}
        </FilterSection>

        {/* Size */}
        <FilterSection title="Size">
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map(size => {
              const isSelected = filters.sizes?.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => handleCheckbox('sizes', size)}
                  className={`py-2 text-sm text-center border rounded-md transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary text-white' 
                      : 'border-foreground/20 hover:border-foreground/50'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </FilterSection>

        {/* Color */}
        <FilterSection title="Color">
          <div className="flex flex-wrap gap-3">
            {dynamicColors.map(hex => {
              const isSelected = filters.color?.includes(hex);
              return (
                <button
                  key={hex}
                  title={hex}
                  onClick={() => handleCheckbox('color', hex)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-foreground/10 hover:scale-110'
                  }`}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && <Check size={14} className={hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} />}
                </button>
              )
            })}
            {dynamicColors.length === 0 && <p className="text-xs text-foreground/40 italic">No colors found</p>}
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}
