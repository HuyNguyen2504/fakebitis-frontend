'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, DollarSign, Package, ShieldAlert, Plus, Edit, Trash, Upload, X } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, sales
  const [activeDashboardView, setActiveDashboardView] = useState('revenue'); // revenue, orders, shoes_sold
  
  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'admin') {
      fetchData();
    } else if (status === 'unauthenticated' || (status === 'authenticated' && session?.user?.role !== 'admin')) {
      setLoading(false);
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const authHeader = { 'Authorization': `Bearer ${session.user.email}` };
      const statsRes = await fetch(`${apiBase}/admin/stats`, { headers: authHeader, cache: 'no-store' });
      setStats(await statsRes.json());
      
      const prodRes = await fetch(`${apiBase}/products`, { cache: 'no-store' });
      const prodData = await prodRes.json();
      setProducts(prodData.data);
      
      const campRes = await fetch(`${apiBase}/admin/campaigns`, { headers: authHeader, cache: 'no-store' });
      setCampaigns(await campRes.json());
      
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    const numericVal = Number(val) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numericVal);
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const apiRoot = apiBase.replace('/api', '');

  const formatImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${apiRoot}${url}`;
  };

  // --- Image Upload Logic ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await fetch(`${apiBase}/upload`, {
        method: 'POST',
        body: formData
      });
      const imagePath = await res.text();
      const imageUrl = imagePath; // Store relative path in DB for flexibility
      
      if (editingProduct) {
        setEditingProduct(prev => ({ ...prev, images: [...(prev.images || []), imageUrl] }));
      }
    } catch (error) {
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (idx) => {
    if (editingProduct) {
      setEditingProduct(prev => {
        const newImages = [...prev.images];
        newImages.splice(idx, 1);
        return { ...prev, images: newImages };
      });
    }
  };

  // --- Save Product Logic ---
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = editingProduct._id ? `${apiBase}/admin/products/${editingProduct._id}` : `${apiBase}/admin/products`;
    const method = editingProduct._id ? 'PUT' : 'POST';
    
    // Ensure numbers
    const payload = {
      ...editingProduct,
      price: Number(editingProduct.price)
    };

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify(payload)
      });
      setShowProductModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving product');
    }
  };

  // --- Save Campaign Logic ---
  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const url = editingCampaign._id ? `${apiBase}/admin/campaigns/${editingCampaign._id}` : `${apiBase}/admin/campaigns`;
    const method = editingCampaign._id ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.email}`
        },
        body: JSON.stringify(editingCampaign)
      });
      setShowCampaignModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving campaign');
    }
  };

  if (status === 'loading' || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session || session.user.role !== 'admin') return <div className="p-12 text-center">Access Denied</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase flex items-center gap-3">
          <ShieldAlert className="text-primary" /> Admin Dashboard
        </h1>
        <button 
          onClick={() => { setLoading(true); fetchData(); }}
          className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-foreground/10 mb-8">
        {['dashboard', 'products', 'sales'].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`pb-4 px-4 font-bold uppercase tracking-wider text-sm ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-foreground/50 hover:text-foreground'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div 
              onClick={() => setActiveDashboardView('revenue')}
              className={`rounded-2xl p-6 border cursor-pointer transition-colors ${activeDashboardView === 'revenue' ? 'bg-primary/10 border-primary' : 'bg-accent border-foreground/10 hover:border-primary/50'}`}
            >
              <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-bold text-primary mt-1">{stats ? formatCurrency(stats.totalRevenue) : '0 ₫'}</h3>
            </div>
            <div 
              onClick={() => setActiveDashboardView('orders')}
              className={`rounded-2xl p-6 border cursor-pointer transition-colors ${activeDashboardView === 'orders' ? 'bg-primary/10 border-primary' : 'bg-accent border-foreground/10 hover:border-primary/50'}`}
            >
              <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">Orders</p>
              <h3 className="text-3xl font-bold mt-1">{stats ? stats.totalOrders : 0}</h3>
            </div>
            <div 
              onClick={() => setActiveDashboardView('shoes_sold')}
              className={`rounded-2xl p-6 border cursor-pointer transition-colors ${activeDashboardView === 'shoes_sold' ? 'bg-primary/10 border-primary' : 'bg-accent border-foreground/10 hover:border-primary/50'}`}
            >
              <p className="text-sm font-semibold text-foreground/60 uppercase tracking-wider">Shoes Sold</p>
              <h3 className="text-3xl font-bold mt-1">{stats ? stats.totalSold : 0}</h3>
            </div>
          </div>

          {activeDashboardView === 'revenue' && (
            <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold mb-6">Revenue Over Time (Last 7 Days)</h3>
              <div className="h-[300px] w-full">
                {stats?.chartData && stats.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                      <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                      <YAxis tickFormatter={(value) => `${value / 1000000}M`} tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="revenue" stroke="#E3000F" strokeWidth={3} dot={{r: 4, fill: '#E3000F', strokeWidth: 0}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-foreground/40">No data available for chart</div>
                )}
              </div>
            </div>
          )}

          {activeDashboardView === 'orders' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-8">
              <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Top Users by Order Count</h3>
                <div className="h-[300px] w-full">
                  {stats?.topUsers && stats.topUsers.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.topUsers} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fontSize: 12}} />
                        <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12}} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="orderCount" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground/40">No data available</div>
                  )}
                </div>
              </div>

              <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Global Order History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-accent text-foreground/70 uppercase">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Total Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.orderHistory?.map(order => (
                        <tr key={order._id} className="border-b border-foreground/10 hover:bg-accent/30">
                          <td className="p-3 font-mono text-xs text-foreground/70">{order._id}</td>
                          <td className="p-3 font-semibold">{order.user?.name || 'Unknown'}</td>
                          <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold text-primary">{formatCurrency(order.totalAmount)}</td>
                          <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeDashboardView === 'shoes_sold' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-8">
              <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Shoes Sold by Product</h3>
                <div className="h-[400px] w-full">
                  {stats?.shoesSoldData && stats.shoesSoldData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.shoesSoldData} margin={{ top: 5, right: 20, bottom: 60, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{fontSize: 10}} 
                          angle={-45} 
                          textAnchor="end"
                        />
                        <YAxis tickLine={false} axisLine={false} tick={{fontSize: 12}} allowDecimals={false} />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-background border border-foreground/20 p-2 rounded shadow-lg flex flex-col items-center gap-2">
                                  <img src={formatImageUrl(data.images[0])} alt={data.name} className="w-16 h-16 object-cover rounded bg-accent" />
                                  <p className="text-xs font-bold text-center max-w-[150px]">{data.name}</p>
                                  <p className="text-sm font-bold text-primary">Sold: {data.sold}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line type="monotone" dataKey="sold" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-foreground/40">No data available</div>
                  )}
                </div>
              </div>

              <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-6">Product Sales Table</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-accent text-foreground/70 uppercase">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Total Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.shoesSoldData?.map(prod => (
                        <tr key={prod._id} className="border-b border-foreground/10 hover:bg-accent/30">
                          <td className="p-3 flex items-center gap-3">
                            <img src={formatImageUrl(prod.images[0])} alt={prod.name} className="w-10 h-10 rounded object-cover bg-accent" />
                            <span className="font-semibold">{prod.name}</span>
                          </td>
                          <td className="p-3 font-semibold text-lg">{prod.sold}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold">Manage Products</h3>
            <div className="flex gap-4 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Search products..." 
                onChange={(e) => {
                  const val = e.target.value.toLowerCase();
                  if (!val) {
                    fetchData(); // Reset
                  } else {
                    setProducts(products.filter(p => p.name.toLowerCase().includes(val)));
                  }
                }}
                className="border border-foreground/10 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-none focus:border-primary"
              />
              <button 
                onClick={() => {
                  setEditingProduct({ name: '', price: '', category: '', variants: [], images: [] });
                  setShowProductModal(true);
                }}
                className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/80 flex items-center gap-2 shrink-0"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-accent/50 border-y border-foreground/10 text-foreground/70 uppercase">
                <tr>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Sold</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-foreground/10 hover:bg-accent/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={formatImageUrl(p.images[0])} alt={p.name} className="w-10 h-10 rounded object-cover bg-accent" />
                      <span className="font-semibold">{p.name}</span>
                    </td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4 font-semibold text-primary">{formatCurrency(p.price)}</td>
                    <td className="p-4">{p.sold}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditingProduct({...p, _id: p.id}); setShowProductModal(true); }}
                        className="p-2 text-foreground/60 hover:text-primary bg-background border border-foreground/10 rounded"
                      ><Edit size={16} /></button>
                      <button 
                        onClick={async () => {
                          if (confirm('Delete this product?')) {
                            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                            await fetch(`${apiBase}/admin/products/${p.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session.user.email}` } });
                            fetchData();
                          }
                        }}
                        className="p-2 text-foreground/60 hover:text-red-500 bg-background border border-foreground/10 rounded"
                      ><Trash size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <div className="bg-background border border-foreground/10 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Manage Sale Campaigns</h3>
            <button 
              onClick={() => {
                setEditingCampaign({ name: '', discountPercentage: 10, startDate: '', endDate: '', products: [] });
                setShowCampaignModal(true);
              }}
              className="text-sm font-bold bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/80 flex items-center gap-2"
            >
              <Plus size={16} /> New Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(c => (
              <div key={c._id} className="border border-foreground/10 rounded-xl p-5 bg-accent/30 relative">
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingCampaign({
                        _id: c._id,
                        name: c.name,
                        discountPercentage: c.discountPercentage,
                        startDate: c.startDate,
                        endDate: c.endDate,
                        products: c.products.map(p => p._id || p)
                      });
                      setShowCampaignModal(true);
                    }}
                    className="text-foreground/40 hover:text-primary"
                  ><Edit size={16} /></button>
                  <button 
                    onClick={async () => {
                      if (confirm('Delete campaign?')) {
                        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
                        await fetch(`${apiBase}/admin/campaigns/${c._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${session.user.email}` } });
                        fetchData();
                      }
                    }}
                    className="text-foreground/40 hover:text-red-500"
                  ><Trash size={16} /></button>
                </div>
                <h4 className="font-bold text-lg mb-1">{c.name}</h4>
                <div className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded mb-3">-{c.discountPercentage}% OFF</div>
                <p className="text-xs text-foreground/60 mb-1">From: {new Date(c.startDate).toLocaleDateString()}</p>
                <p className="text-xs text-foreground/60 mb-3">To: {new Date(c.endDate).toLocaleDateString()}</p>
                <p className="text-sm font-semibold">{c.products?.length || 0} Products Included</p>
              </div>
            ))}
            {campaigns.length === 0 && <p className="text-foreground/50">No active campaigns.</p>}
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-foreground/10">
              <h2 className="text-2xl font-bold">{editingProduct._id ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setShowProductModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Name</label>
                  <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Category</label>
                  <select required value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full border p-2 rounded bg-background">
                    <option value="" disabled>Select Category</option>
                    <option value="Sneaker">Sneaker</option>
                    <option value="Running">Running</option>
                    <option value="Sandal">Sandal</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Price (VND)</label>
                  <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} className="w-full border p-2 rounded" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase mb-2 block">Variants (Color, Size, Stock)</label>
                <div className="border border-foreground/10 rounded-xl p-4 bg-accent/30 flex flex-col gap-4">
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-xs font-semibold block mb-1">Color (Hex)</label>
                      <input 
                        type="color" 
                        id="newVariantColor" 
                        defaultValue="#000000" 
                        className="w-full h-10 cursor-pointer rounded" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Size</label>
                      <input 
                        type="text" 
                        id="newVariantSize" 
                        placeholder="e.g. 40" 
                        className="w-full border p-2 rounded text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold block mb-1">Stock</label>
                      <input 
                        type="number" 
                        id="newVariantStock" 
                        placeholder="0" 
                        min="0"
                        className="w-full border p-2 rounded text-sm" 
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const color = document.getElementById('newVariantColor').value;
                        const size = document.getElementById('newVariantSize').value;
                        const stock = Number(document.getElementById('newVariantStock').value);
                        if(!size || isNaN(stock)) return alert('Please enter size and stock');
                        
                        setEditingProduct(prev => ({
                          ...prev,
                          variants: [...(prev.variants || []), { color, size, stock }]
                        }));
                        
                        document.getElementById('newVariantSize').value = '';
                        document.getElementById('newVariantStock').value = '';
                      }}
                      className="bg-foreground text-background font-bold py-2 px-4 rounded hover:bg-foreground/80 transition-colors h-10"
                    >
                      Add
                    </button>
                  </div>
                  
                  {editingProduct.variants && editingProduct.variants.length > 0 && (
                    <div className="mt-2 bg-background border border-foreground/10 rounded overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-accent text-foreground/70 uppercase text-xs">
                          <tr>
                            <th className="px-3 py-2">Color</th>
                            <th className="px-3 py-2">Size</th>
                            <th className="px-3 py-2">Stock</th>
                            <th className="px-3 py-2 text-right"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {editingProduct.variants.map((v, i) => (
                            <tr key={i} className="border-t border-foreground/10">
                              <td className="px-3 py-2 flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border border-foreground/20" style={{ backgroundColor: v.color }}></div>
                                {v.color}
                              </td>
                              <td className="px-3 py-2 font-semibold">{v.size}</td>
                              <td className="px-3 py-2">{v.stock}</td>
                              <td className="px-3 py-2 text-right">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setEditingProduct(prev => {
                                      const nv = [...prev.variants];
                                      nv.splice(i, 1);
                                      return { ...prev, variants: nv };
                                    });
                                  }}
                                  className="text-red-500 hover:underline text-xs font-bold"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase mb-2 block">Images</label>
                <div className="flex flex-wrap gap-4 mb-2">
                  {editingProduct.images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={formatImageUrl(img)} className="w-20 h-20 object-cover rounded border" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                    </div>
                  ))}
                  <div className="w-20 h-20 border-2 border-dashed border-foreground/30 rounded flex items-center justify-center relative cursor-pointer hover:border-primary">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    {uploadingImage ? <span className="text-xs">Wait...</span> : <Upload size={20} className="text-foreground/50" />}
                  </div>
                </div>
              </div>

              <button type="submit" className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark mt-4">Save Product</button>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-background rounded-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b border-foreground/10">
              <h2 className="text-2xl font-bold">{editingCampaign._id ? 'Edit Sale Campaign' : 'New Sale Campaign'}</h2>
              <button onClick={() => setShowCampaignModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveCampaign} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold uppercase mb-1 block">Campaign Name</label>
                <input required value={editingCampaign.name} onChange={e => setEditingCampaign({...editingCampaign, name: e.target.value})} className="w-full border p-2 rounded" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Discount (%)</label>
                  <input type="number" min="1" max="100" required value={editingCampaign.discountPercentage} onChange={e => setEditingCampaign({...editingCampaign, discountPercentage: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">Start Date</label>
                  <input type="date" required value={editingCampaign.startDate ? new Date(editingCampaign.startDate).toISOString().split('T')[0] : ''} onChange={e => setEditingCampaign({...editingCampaign, startDate: e.target.value})} className="w-full border p-2 rounded" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase mb-1 block">End Date</label>
                  <input type="date" required value={editingCampaign.endDate ? new Date(editingCampaign.endDate).toISOString().split('T')[0] : ''} onChange={e => setEditingCampaign({...editingCampaign, endDate: e.target.value})} className="w-full border p-2 rounded" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase mb-2 block">Select Products</label>
                <div className="max-h-48 overflow-y-auto border border-foreground/10 rounded p-2 flex flex-col gap-2">
                  {products.map(p => (
                    <label key={p.id} className="flex items-center gap-2 text-sm p-1 hover:bg-accent rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingCampaign.products.includes(p.id)}
                        onChange={(e) => {
                          const newProds = e.target.checked 
                            ? [...editingCampaign.products, p.id]
                            : editingCampaign.products.filter(id => id !== p.id);
                          setEditingCampaign({...editingCampaign, products: newProds});
                        }}
                      />
                      <img src={formatImageUrl(p.images[0])} className="w-8 h-8 rounded object-cover" />
                      <span className="flex-1 truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" className="bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-dark mt-4">Save Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
