import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { useDispatch, useSelector } from "react-redux";
import { gettingallproducts } from "../features/productSlice";
import { CreateSales, gettingallSales } from "../features/salesSlice";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Save,
  User,
  Package,
  Plus,
  Trash2,
  FileText,
  Eye,
  X,
  Receipt,
  TrendingDown,
  Search,
  AlertCircle,
  ArrowDownRight
} from "lucide-react";
import FormattedTime from "../lib/FormattedTime";

function Salespage() {
  const dispatch = useDispatch();
  const { Authuser } = useSelector((state) => state.auth);
  const { getallproduct } = useSelector((state) => state.product);
  const { getallsales, iscreatedsales } = useSelector((state) => state.sales);

  // Authorization: Admin and Staff
  const userRole = Authuser?.role?.trim().toUpperCase();
  const isAuthorized = userRole === 'ADMIN' || userRole === 'STAFF';

  // Master Form State
  const [customerName, setCustomerName] = useState("Walking Customer");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [paymentType, setPaymentType] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Items State
  const [items, setItems] = useState([{
    productId: "",
    quantity: "",
    price: "",
    availableStock: 0
  }]);

  // UI States
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(gettingallproducts());
    dispatch(gettingallSales());
  }, [dispatch]);

  // Redirect or block if not authorized
  if (!isAuthorized) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <TopNavbar />
        <div className="p-20 text-center">
          <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Access Restricted</h2>
          <p className="text-gray-500">Only authorized personnel (Admin/Staff) can manage sales records.</p>
        </div>
      </div>
    );
  }

  const addItemRow = () => {
    setItems([...items, { productId: "", quantity: "", price: "", availableStock: 0 }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];

    if (field === 'productId') {
      const product = getallproduct?.find(p => p._id === value);
      newItems[index].availableStock = product ? product.stockQuantity : 0;
      newItems[index].price = product ? (product.price || 0) : "";
      newItems[index].productId = value;
    } else {
      newItems[index][field] = value;
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price) || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (items.some(item => !item.productId || !item.quantity || !item.price)) {
      return toast.error("Please fill all required item fields");
    }

    // Stock Validation
    const outOfStock = items.find(item => item.availableStock <= 0);
    if (outOfStock) {
      const prod = getallproduct?.find(p => p._id === outOfStock.productId);
      return toast.error(`${prod?.name || 'Selected product'} is out of stock`);
    }

    const stockError = items.find(item => Number(item.quantity) > item.availableStock);
    if (stockError) {
      const prod = getallproduct?.find(p => p._id === stockError.productId);
      return toast.error(`Insufficient stock for ${prod?.name}. Available: ${stockError.availableStock}`);
    }

    const salesData = {
      customerName,
      invoiceNumber,
      paymentType,
      notes,
      saleDate,
      products: items.map(item => ({
        product: item.productId,
        quantity: Number(item.quantity),
        price: Number(item.price)
      }))
    };

    dispatch(CreateSales(salesData))
      .unwrap()
      .then(() => {
        toast.success("Sale recorded successfully!");
        setIsFormVisible(false);
        resetForm();
      })
      .catch((err) => {
        const errorMessage = typeof err === 'string' ? err : err?.message || "Failed to record sale";
        toast.error(errorMessage);
      });
  };

  const resetForm = () => {
    setCustomerName("Walking Customer");
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setPaymentType("Cash");
    setNotes("");
    setItems([{ productId: "", quantity: "", price: "", availableStock: 0 }]);
  };

  const handleDownloadInvoice = (saleId) => {
    const backendUrl = "http://localhost:3003";
    window.open(`${backendUrl}/api/sales/${saleId}/invoice`, '_blank');
  };

  const filteredSales = (getallsales || []).filter(s =>
    s.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.products?.some(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-neutral-50 min-h-screen font-sans text-gray-900 pb-20">
      <TopNavbar />

      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center tracking-tight">
              <ShoppingCart className="mr-3 text-primary" size={32} /> POS & Sales Management
            </h1>
            <p className="text-gray-500 mt-1">Record new sales and manage transaction history</p>
          </div>
          <button
            onClick={() => {
              setIsFormVisible(true);
              setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
            }}
            className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center shadow-lg transition-all transform hover:-translate-y-1 font-bold"
          >
            <Plus className="mr-2" size={20} /> New Sales Entry
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Receipt size={24} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Orders</p>
              <p className="text-2xl font-black text-gray-800">{getallsales?.length || 0}</p>
            </div>
          </div>
          <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingDown className="rotate-180" size={24} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Today's Revenue</p>
              <p className="text-2xl font-black text-gray-800">
                Rs. {(getallsales || [])
                  .filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString())
                  .reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl"><ArrowDownRight size={24} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Avg. Ticket Size</p>
              <p className="text-2xl font-black text-gray-800">
                Rs. {getallsales?.length
                  ? Math.round(getallsales.reduce((acc, curr) => acc + curr.totalAmount, 0) / getallsales.length).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Invoice, Customer or Product..."
              className="input-field pl-10 h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Sales Table */}
        <div className="card overflow-hidden shadow-xl border-none">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest leading-none">
                <tr>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Invoice #</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5 text-center">Items</th>
                  <th className="px-6 py-5 text-right">Total</th>
                  <th className="px-6 py-5">Method</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-blue-50/20 transition group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <FormattedTime timestamp={sale.saleDate} />
                      </td>
                      <td className="px-6 py-4 font-mono text-sm tracking-tight text-primary font-bold uppercase">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{sale.customerName}</div>
                        <div className="text-[10px] text-gray-400 font-semibold uppercase">By {sale.soldBy?.name || "Admin"}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                          {sale.products?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-800">
                        Rs. {sale.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${sale.paymentType === 'Online' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {sale.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors hover:bg-white rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(sale._id)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors hover:bg-white rounded-lg"
                        >
                          <FileText size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-20 bg-gray-50/30">
                      <div className="flex flex-col items-center opacity-40">
                        <ShoppingCart size={48} className="mb-2 text-gray-400" />
                        <p className="italic text-gray-500">No sales transactions found.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Entry Overlay Form */}
        {isFormVisible && (
          <div className="fixed inset-0 z-[60] overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormVisible(false)} />
            <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-2xl font-black text-gray-800 flex items-center">
                  <ShoppingCart className="mr-3 text-primary" /> Create Sales Transaction
                </h2>
                <button onClick={() => setIsFormVisible(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50/30 rounded-2xl border border-blue-100">
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Customer Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        className="input-field w-full h-12 pl-10 text-sm bg-white"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Invoice #</label>
                    <input
                      type="text"
                      className="input-field w-full h-12 text-sm bg-white font-mono uppercase"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Sale Date</label>
                    <input
                      type="date"
                      className="input-field w-full h-12 text-sm bg-white"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Multi-Item Rows */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest">Sales Items</h3>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-primary hover:text-blue-700 text-xs font-bold flex items-center hover:underline"
                    >
                      <Plus size={14} className="mr-1" /> Add Product Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-start p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="col-span-12 md:col-span-5">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Product *</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="input-field w-full h-10 text-xs bg-white"
                            required
                          >
                            <option value="">Select Product...</option>
                            {getallproduct?.filter(p => p.status === 'Active').map(p => (
                              <option key={p._id} value={p._id} disabled={p.stockQuantity <= 0}>
                                {p.name} (SKU: {p.sku}) - {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'OUT OF STOCK'}
                              </option>
                            ))}
                          </select>
                          {item.productId && (
                            <p className={`text-[10px] mt-1 font-bold ${item.availableStock <= 0 ? 'text-red-600' : item.availableStock < 5 ? 'text-orange-500' : 'text-green-500'}`}>
                              {item.availableStock <= 0 ? '!!! OUT OF STOCK !!!' : `Available: ${item.availableStock} in units`}
                            </p>
                          )}
                        </div>
                        <div className="col-span-5 md:col-span-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Qty *</label>
                          <input
                            type="number"
                            min="1"
                            max={item.availableStock}
                            disabled={item.availableStock <= 0}
                            placeholder={item.availableStock <= 0 ? "0" : "0"}
                            className={`input-field w-full h-10 text-xs bg-white text-center ${item.availableStock <= 0 || Number(item.quantity) > item.availableStock ? 'border-red-500 bg-red-50' : ''}`}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-5 md:col-span-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Price *</label>
                          <input
                            type="number"
                            min="0"
                            placeholder="0.00"
                            className="input-field w-full h-10 text-xs bg-white text-right"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2 md:col-span-1 flex items-center justify-center pt-6">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-red-400 hover:text-red-600 transition p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Payment Mode</label>
                      <div className="flex gap-2">
                        {["Cash", "Credit", "Online"].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPaymentType(type)}
                            className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${paymentType === type ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-primary'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Additional Notes</label>
                      <textarea
                        className="input-field w-full h-24 text-sm bg-neutral-50 resize-none"
                        placeholder="Customer specific requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="bg-neutral-900 rounded-3xl p-8 text-white flex flex-col justify-between shadow-2xl">
                    <div>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-4">Total Calculation</p>
                      <div className="space-y-2 mb-8 border-b border-white/10 pb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Subtotal</span>
                          <span>Rs. {calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Tax (Non-VAT)</span>
                          <span>0%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-8">
                        <span className="text-xl font-bold">Grand Total</span>
                        <span className="text-4xl font-black text-primary">Rs. {calculateTotal().toLocaleString()}</span>
                      </div>
                      <button
                        type="submit"
                        disabled={iscreatedsales}
                        className="w-full bg-primary hover:bg-blue-600 h-16 rounded-2xl text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        {iscreatedsales ? "Processing..." : <><Save size={24} /> Finalize Transaction</>}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details View Modal */}
        {selectedSale && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedSale(null)} />
            <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-blue-50/20">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Sale Summary</h3>
                  <p className="text-primary font-mono text-sm font-bold tracking-widest">{selectedSale.invoiceNumber}</p>
                </div>
                <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-white rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Customer / Client</p>
                    <p className="text-xl font-bold text-gray-800">{selectedSale.customerName}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center"><FileText size={12} className="mr-1" /> Sold by {selectedSale.soldBy?.name || "System Admin"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Payment Method</p>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedSale.paymentType}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Purchased Items</p>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 divide-y divide-gray-200">
                    {selectedSale.products?.map((item, idx) => (
                      <div key={idx} className="p-4 flex justify-between items-center group hover:bg-white transition">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400">#{(idx + 1).toString().padStart(2, '0')}</div>
                          <div>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">Unit Price: Rs.{item.price.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-gray-700">x {item.quantity}</p>
                          <p className="text-sm font-bold text-primary">Rs. {(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-start pt-6 border-t border-gray-100">
                  <div className="max-w-[50%]">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Internal Notes</p>
                    <p className="text-xs text-gray-500 italic leading-relaxed">{selectedSale.notes || "No special instructions recorded for this order."}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Grand Total Paid</p>
                    <p className="text-4xl font-black text-gray-800 leading-none tracking-tighter">Rs. {selectedSale.totalAmount?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => handleDownloadInvoice(selectedSale._id)}
                  className="flex items-center gap-2 text-primary font-bold hover:underline"
                >
                  <FileText size={18} /> Download Official Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Salespage;