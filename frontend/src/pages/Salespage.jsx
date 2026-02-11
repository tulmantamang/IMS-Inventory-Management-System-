import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gettingallproducts } from "../features/productSlice";
import { CreateSales, gettingallSales } from "../features/salesSlice";
import { fetchSettings } from "../features/settingsSlice";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Save,
  Trash2,
  FileText,
  Eye,
  X,
  Receipt,
  TrendingUp,
  AlertCircle,
  Package,
  TrendingDown,
  BadgePercent
} from "lucide-react";
import FormattedTime from "../lib/FormattedTime";

function Salespage() {
  const dispatch = useDispatch();
  const { Authuser } = useSelector((state) => state.auth);
  const { getallproduct } = useSelector((state) => state.product);
  const { getallsales, iscreatedsales } = useSelector((state) => state.sales);
  const { data: settings } = useSelector((state) => state.settings);

  // Authorization: Admin and Staff
  const userRole = Authuser?.role?.trim().toUpperCase();
  const isAuthorized = userRole === 'ADMIN' || userRole === 'STAFF';

  // Master Form State
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [paymentType, setPaymentType] = useState("Cash");
  const [notes, setNotes] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [taxPercent, setTaxPercent] = useState(13);

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
  const [hasInitializedSettings, setHasInitializedSettings] = useState(false);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(gettingallproducts());
    dispatch(gettingallSales());
  }, [dispatch]);

  // Update defaults when settings are loaded
  useEffect(() => {
    if (settings && !hasInitializedSettings) {
      if (settings.default_discount_percentage !== undefined) {
        setDiscountPercent(settings.default_discount_percentage);
      }
      if (settings.default_tax_percentage !== undefined) {
        setTaxPercent(settings.default_tax_percentage);
      }
      setHasInitializedSettings(true);
    }
  }, [settings, hasInitializedSettings]);

  // Redirect or block if not authorized
  if (!isAuthorized) {
    return (
      <div className="bg-neutral-50 min-h-screen">
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
      newItems[index].availableStock = product ? product.total_stock : 0;
      newItems[index].price = product ? product.selling_price : "";
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
      })),
      discountPercentage: Number(discountPercent),
      taxPercentage: Number(taxPercent)
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
    setCustomerName("");
    setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
    setPaymentType("Cash");
    setNotes("");
    setDiscountPercent(settings?.default_discount_percentage || 10);
    setTaxPercent(settings?.default_tax_percentage || 13);
    setItems([{ productId: "", quantity: "", price: "", availableStock: 0 }]);
  };

  const handleDownloadInvoice = (saleId) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://advanced-inventory-management-system-v1.onrender.com";
    const url = `${backendUrl}/api/sales/${saleId}/invoice`;
    const token = localStorage.getItem('token');

    if (!token || token === "undefined") {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem('token');
      return;
    }

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error generating invoice");
        return res.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sale-invoice-${saleId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to generate sale invoice");
      });
  };

  const filteredSales = (getallsales || []).filter(s =>
    s.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.products?.some(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-neutral-50 min-h-screen font-sans text-gray-900 pb-20">

      <div className="px-8 pb-8 pt-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="hidden"></div>
          {isAuthorized && (
            <button
              onClick={() => {
                setIsFormVisible(true);
                setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
              }}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 font-bold"
            >
              New Sales Entry
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Receipt size={24} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Sales</p>
              <p className="text-2xl font-black text-gray-800">{getallsales?.length || 0}</p>
            </div>
          </div>
          <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><TrendingUp size={24} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Daily Revenue</p>
              <p className="text-2xl font-black text-gray-800">
                {settings?.currency_symbol || 'Rs.'} {(getallsales || [])
                  .filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString())
                  .reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><TrendingDown className="rotate-180" size={24} /></div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Avg Ticket</p>
              <p className="text-2xl font-black text-gray-800">
                {settings?.currency_symbol || 'Rs.'} {getallsales?.length
                  ? Math.round(getallsales.reduce((acc, curr) => acc + curr.totalAmount, 0) / getallsales.length).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <input
            type="text"
            placeholder="Search by Invoice, Customer or Product..."
            className="input-field h-10 w-full md:w-96"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sales List */}
        <div className="card overflow-hidden shadow-xl border-none">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest leading-none">
                <tr>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Invoice #</th>
                  <th className="px-6 py-5">Customer</th>
                  <th className="px-6 py-5 text-center">Items</th>
                  <th className="px-6 py-5 text-right">Amount Paid</th>
                  <th className="px-6 py-5 text-center">Status</th>
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
                      <td className="px-6 py-4 font-mono text-sm tracking-tight text-primary font-bold">
                        {sale.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{sale.customerName}</div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">By {sale.soldBy?.name || "Admin"}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                          {sale.products?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-gray-800">
                        {settings?.currency_symbol || 'Rs.'} {sale.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${sale.paymentType === 'Online'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                          {sale.paymentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-white border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(sale._id)}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-lg hover:bg-white border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-20 bg-gray-50/30">
                      <div className="flex flex-col items-center opacity-40">
                        <Package size={48} className="mb-2 text-gray-400" />
                        <p className="italic text-gray-500">No transaction records found matching your query.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slide-over New Sales Form */}
        {isFormVisible && (
          <div className="fixed inset-0 z-[60] overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormVisible(false)} />
            <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-2xl font-black text-gray-800 flex items-center">
                  <ShoppingCart className="mr-3 text-primary" /> Create Sales Order
                </h2>
                <button onClick={() => setIsFormVisible(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Header Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="col-span-full md:col-span-1">
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Customer Name</label>
                    <input
                      type="text"
                      className="input-field w-full h-12 text-sm bg-white"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Invoice / Bill #</label>
                    <input
                      type="text"
                      className="input-field w-full h-12 text-sm bg-white font-mono"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Date</label>
                    <input
                      type="date"
                      className="input-field w-full h-12 text-sm bg-white"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Items Management */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest">Sales Items</h3>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="text-primary hover:text-blue-700 text-xs font-bold hover:underline"
                    >
                      + Add Product Row
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
                            <option value="">Choose Listing...</option>
                            {getallproduct?.filter(p => p.status === 'Active').map(p => (
                              <option key={p._id} value={p._id} disabled={p.total_stock <= 0}>
                                {p.name} ({p.total_stock} in stock)
                              </option>
                            ))}
                          </select>
                          {item.productId && (
                            <p className={`text-[9px] mt-1 font-bold uppercase ${item.availableStock <= 0 ? 'text-red-500' : 'text-green-500'}`}>
                              {item.availableStock} Units Available
                            </p>
                          )}
                        </div>
                        <div className="col-span-5 md:col-span-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Qty *</label>
                          <input
                            type="number"
                            onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="input-field w-full h-10 text-xs bg-white text-right"
                            max={item.availableStock}
                            required
                          />
                        </div>
                        <div className="col-span-6 md:col-span-4">
                          <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Unit Price *</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            className="input-field w-full h-10 text-xs bg-white text-right"
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                            onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                            required
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center pt-6">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="text-red-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Form Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Payment Type</label>
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
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Internal Notes</label>
                      <textarea
                        className="input-field w-full h-32 text-sm bg-neutral-50 resize-none"
                        placeholder="Shipping details, reference numbers, etc..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col justify-between shadow-xl border border-gray-100">
                    <div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Final Summary</p>
                      <div className="space-y-4 mb-8 border-b border-gray-100 pb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500 font-bold">Subtotal</span>
                          <span className="font-bold">{settings?.currency_symbol || 'Rs.'} {calculateTotal().toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm p-3 bg-red-50/30 rounded-xl border border-red-100/50">
                          <span className="text-gray-600 flex items-center gap-3">
                            <BadgePercent size={16} className="text-red-400" />
                            <span className="font-bold">Discount (%)</span>
                            <div className="relative">
                              <input
                                type="number"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(e.target.value === "" ? "" : Math.max(0, e.target.value))}
                                className="w-20 h-9 bg-white border border-red-200 rounded-lg px-2 font-black text-primary transition-all focus:ring-2 focus:ring-primary/20 outline-none text-center"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-red-300">%</span>
                            </div>
                          </span>
                          <span className="font-black text-red-500">- {settings?.currency_symbol || 'Rs.'} {(calculateTotal() * (discountPercent / 100)).toLocaleString()}</span>
                        </div>

                        <div className="flex justify-between items-center text-sm p-3 bg-green-50/30 rounded-xl border border-green-100/50">
                          <span className="text-gray-600 flex items-center gap-3">
                            <TrendingUp size={16} className="text-green-400" />
                            <span className="font-bold">Tax (%)</span>
                            <div className="relative">
                              <input
                                type="number"
                                value={taxPercent}
                                onChange={(e) => setTaxPercent(e.target.value === "" ? "" : Math.max(0, e.target.value))}
                                className="w-20 h-9 bg-white border border-green-200 rounded-lg px-2 font-black text-primary transition-all focus:ring-2 focus:ring-primary/20 outline-none text-center"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-300">%</span>
                            </div>
                          </span>
                          <span className="font-black text-green-600">+ {settings?.currency_symbol || 'Rs.'} {((calculateTotal() - (calculateTotal() * (discountPercent / 100))) * (taxPercent / 100)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-end mb-8">
                        <span className="text-lg font-bold text-gray-600">Grand Total</span>
                        <span className="text-4xl font-black text-primary">
                          {settings?.currency_symbol || 'Rs.'} {(
                            calculateTotal() -
                            (calculateTotal() * (discountPercent / 100)) +
                            ((calculateTotal() - (calculateTotal() * (discountPercent / 100))) * (taxPercent / 100))
                          ).toLocaleString()}
                        </span>
                      </div>
                      <button
                        type="submit"
                        disabled={iscreatedsales}
                        className={`w-full h-16 rounded-2xl text-white font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl ${iscreatedsales
                          ? 'bg-gray-300 cursor-not-allowed shadow-none'
                          : 'bg-primary hover:bg-blue-600 shadow-primary/20'
                          }`}
                      >
                        {iscreatedsales ? "Processing..." : <><Save size={24} /> Confirm & Finalize</>}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sales Detail Modal */}
        {selectedSale && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedSale(null)} />
            <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-blue-50/20">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">Sales Details</h3>
                  <p className="text-primary font-mono text-sm font-bold tracking-widest">{selectedSale.invoiceNumber}</p>
                </div>
                <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-white rounded-full transition">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Customer</p>
                    <p className="text-lg font-bold text-gray-800">{selectedSale.customerName}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase mt-1">Processed By {selectedSale.soldBy?.name || "Admin"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Payment Method</p>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedSale.paymentType}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Line Items</p>
                  <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 overflow-x-auto">
                    <div className="min-w-[400px]">
                      {selectedSale.products?.map((item, idx) => (
                        <div key={idx} className="p-4 flex justify-between items-center border-b border-gray-200 last:border-0">
                          <div>
                            <p className="font-bold text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-400 font-mono tracking-tighter">Price: {settings?.currency_symbol || 'Rs.'}{item.price.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-gray-700">x {item.quantity}</p>
                            <p className="text-xs font-bold text-primary">{settings?.currency_symbol || 'Rs.'} {(item.quantity * item.price).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                  <div className="max-w-[60%]">
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Notes</p>
                    <p className="text-xs text-gray-500 italic leading-relaxed">{selectedSale.notes || "No internal notes provided for this transaction."}</p>
                    <button
                      onClick={() => handleDownloadInvoice(selectedSale._id)}
                      className="mt-4 flex items-center gap-2 text-primary hover:text-blue-700 text-xs font-bold uppercase transition-colors"
                    >
                      <FileText size={16} /> Download Invoice
                    </button>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex justify-between gap-10 text-xs">
                      <span className="text-gray-400 font-bold uppercase">Subtotal</span>
                      <span className="font-bold text-gray-600">{settings?.currency_symbol || 'Rs.'} {selectedSale.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-10 text-xs">
                      <span className="text-gray-400 font-bold uppercase">Discount ({selectedSale.discountPercentage}%)</span>
                      <span className="font-bold text-red-500">- {settings?.currency_symbol || 'Rs.'} {selectedSale.discountAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between gap-10 text-xs">
                      <span className="text-gray-400 font-bold uppercase">Tax ({selectedSale.taxPercentage}%)</span>
                      <span className="font-bold text-green-600">+ {settings?.currency_symbol || 'Rs.'} {selectedSale.taxAmount?.toLocaleString()}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Grand Total</p>
                      <p className="text-3xl font-black text-gray-800 leading-none">{settings?.currency_symbol || 'Rs.'} {selectedSale.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Salespage;