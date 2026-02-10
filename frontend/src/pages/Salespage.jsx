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

      <div className="p-8 max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                <ShoppingCart size={28} />
              </div>
              <h1 className="text-4xl font-black text-gray-800 tracking-tight">Sales & Revenue</h1>
            </div>
            <p className="text-gray-400 font-medium ml-1">Real-time point of sale management and performance overview</p>
          </div>
          <button
            onClick={() => {
              setIsFormVisible(true);
              setInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
            }}
            className="group relative bg-primary hover:bg-blue-600 text-white px-10 py-4 rounded-[1.5rem] flex items-center shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 font-black text-lg flex items-center gap-2">
              <Plus size={24} strokeWidth={3} /> New POS Entry
            </span>
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 -mr-6 group-hover:scale-[1.7] transition-transform duration-1000">
              <Receipt size={120} />
            </div>
            <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] relative z-10"><Receipt size={32} /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Records</p>
              <p className="text-3xl font-black text-gray-800">{getallsales?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 -mr-6 group-hover:scale-[1.7] transition-transform duration-1000">
              <TrendingDown size={120} className="rotate-180" />
            </div>
            <div className="p-5 bg-green-50 text-green-600 rounded-[1.5rem] relative z-10"><TrendingDown className="rotate-180" size={32} /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Daily Revenue</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-green-500">Rs.</span>
                <p className="text-3xl font-black text-gray-800">
                  {(getallsales || [])
                    .filter(s => new Date(s.saleDate).toDateString() === new Date().toDateString())
                    .reduce((acc, curr) => acc + curr.totalAmount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-50 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 -mr-6 group-hover:scale-[1.7] transition-transform duration-1000">
              <ArrowDownRight size={120} />
            </div>
            <div className="p-5 bg-orange-50 text-orange-600 rounded-[1.5rem] relative z-10"><ArrowDownRight size={32} /></div>
            <div className="relative z-10">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Averaged Ticket</p>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-orange-500">Rs.</span>
                <p className="text-3xl font-black text-gray-800">
                  {getallsales?.length
                    ? Math.round(getallsales.reduce((acc, curr) => acc + curr.totalAmount, 0) / getallsales.length).toLocaleString()
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-[500px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by Invoice, Customer or Product..."
              className="w-full bg-white border-2 border-gray-50 rounded-2xl pl-14 pr-6 py-4 text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Reference No.</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Customer Profile</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Items</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Amount Paid</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Receipt size={14} />
                          </div>
                          <span className="text-sm font-bold text-gray-600"><FormattedTime timestamp={sale.saleDate} /></span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-mono text-xs font-black text-primary uppercase bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                          {sale.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-black text-gray-500 uppercase">
                            {sale.customerName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-800">{sale.customerName}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">By {sale.soldBy?.name || "Admin"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 text-gray-600 text-[10px] font-black border border-gray-100">
                          {sale.products?.length || 0}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-gray-800 tracking-tight">
                        <span className="text-[10px] text-gray-400 mr-1 uppercase">Rs.</span>
                        {sale.totalAmount?.toLocaleString()}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sale.paymentType === 'Online'
                          ? 'bg-purple-50 text-purple-600 border border-purple-100'
                          : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                          {sale.paymentType}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all"
                            title="Quick View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDownloadInvoice(sale._id)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                            title="Invoice"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-32 bg-gray-50/20">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 text-gray-200">
                          <ShoppingCart size={64} strokeWidth={1} />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">No Transaction History found</p>
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
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <div className="p-2.5 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
                      <ShoppingCart size={24} />
                    </div>
                    Create Sales Order
                  </h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-2 ml-1">Terminal ID: {invoiceNumber}</p>
                </div>
                <button onClick={() => setIsFormVisible(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                  <div className="md:col-span-1">
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2.5 tracking-[0.2em] ml-1">Customer Profile</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                      <input
                        type="text"
                        className="w-full h-14 bg-white border-none rounded-2xl pl-12 pr-6 text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2.5 tracking-[0.2em] ml-1">Invoice Reference</label>
                    <input
                      type="text"
                      className="w-full h-14 bg-white border-none rounded-2xl px-6 text-sm font-mono font-black text-primary uppercase shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-2.5 tracking-[0.2em] ml-1">Transaction Date</label>
                    <input
                      type="date"
                      className="w-full h-14 bg-white border-none rounded-2xl px-6 text-sm font-bold shadow-sm focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Sales Items Section */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em]">Inventory Items</h3>
                    <button
                      type="button"
                      onClick={addItemRow}
                      className="group flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all duration-300 active:scale-95"
                    >
                      <Plus size={16} strokeWidth={3} />
                      <span className="text-xs font-black uppercase tracking-widest">Add Product Row</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="group grid grid-cols-1 md:grid-cols-12 gap-6 p-8 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-500 relative">
                        <div className="md:col-span-5 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Product Selection</label>
                          <select
                            value={item.productId}
                            onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                            className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-4 focus:ring-primary/5 outline-none transition-all appearance-none cursor-pointer"
                            required
                          >
                            <option value="">Choose a product...</option>
                            {getallproduct?.filter(p => p.status === 'Active').map(p => (
                              <option key={p._id} value={p._id} disabled={p.total_stock <= 0}>
                                {p.name} • {p.total_stock > 0 ? `${p.total_stock} in stock` : 'OUT OF STOCK'}
                              </option>
                            ))}
                          </select>
                          {item.productId && (
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${item.availableStock <= 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                              }`}>
                              {item.availableStock <= 0 ? <X size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                              {item.availableStock <= 0 ? 'Out of Stock' : `${item.availableStock} Units Available`}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Sale Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={item.availableStock}
                            disabled={item.availableStock <= 0}
                            placeholder="0"
                            className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-center text-sm font-black focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                            required
                          />
                        </div>

                        <div className="md:col-span-3 space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit Price (Rs)</label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              placeholder="0.00"
                              className="w-full h-12 bg-gray-50 border-none rounded-xl px-4 text-right text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                              value={item.price}
                              onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                              onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                              required
                            />
                          </div>
                        </div>

                        <div className="md:col-span-1 flex items-end justify-center pb-1">
                          <button
                            type="button"
                            onClick={() => removeItemRow(index)}
                            className="p-3 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2.5 tracking-[0.2em] ml-1">Payment Method</label>
                      <div className="flex gap-2">
                        {["Cash", "Credit", "Online"].map(type => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setPaymentType(type)}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-2xl border transition-all active:scale-95 ${paymentType === type
                              ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                              : 'bg-white text-gray-400 border-gray-100 hover:border-primary hover:text-primary shadow-sm'}`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-2.5 tracking-[0.2em] ml-1">Additional Notes</label>
                      <textarea
                        className="input-field w-full h-32 text-sm bg-gray-50/50 border-none rounded-[1.5rem] p-5 resize-none placeholder:text-gray-300"
                        placeholder="Customer specific requirements or reference numbers..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] p-10 text-gray-800 flex flex-col justify-between shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />

                    <div className="relative z-10">
                      <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Order Calculation</p>
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-gray-400">Items Subtotal</span>
                          <span className="text-gray-600">Rs. {calculateTotal().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-gray-400">Tax & Fees</span>
                          <span className="text-gray-600">Rs. 0.00</span>
                        </div>
                        <div className="h-[1px] bg-gray-100 w-full" />
                      </div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex justify-between items-end mb-10">
                        <span className="text-base font-black text-gray-500 uppercase tracking-widest">Total Amount</span>
                        <div className="text-right">
                          <span className="text-4xl font-black text-gray-800 tracking-tighter">Rs. {calculateTotal().toLocaleString()}</span>
                          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Ready for Checkout</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={iscreatedsales}
                        className={`w-full h-20 rounded-[1.5rem] text-white font-black text-xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 shadow-2xl ${iscreatedsales ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-primary hover:bg-blue-600 shadow-primary/30'
                          }`}
                      >
                        {iscreatedsales ? (
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <><Save size={28} /> Confirm Payment</>
                        )}
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
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setSelectedSale(null)} />
            <div className="bg-white max-w-2xl w-full rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-10 border-b border-gray-100 flex justify-between items-start bg-gray-50/80">
                <div>
                  <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">Transaction Details</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-xs font-black text-primary uppercase bg-white px-3 py-1 rounded-lg border border-gray-200">{selectedSale.invoiceNumber}</span>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">• POS Terminal #1</span>
                  </div>
                </div>
                <button onClick={() => setSelectedSale(null)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Customer Identity</p>
                    <p className="text-2xl font-black text-gray-800 tracking-tight">{selectedSale.customerName}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase mt-2">
                      <User size={12} className="text-primary" />
                      <span>Processed By {selectedSale.soldBy?.name || "System Admin"}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Settlement</p>
                    <span className="inline-block bg-green-50 text-green-600 border border-green-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedSale.paymentType} Payment</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Order Manifest</p>
                  <div className="bg-gray-50/50 rounded-[2rem] overflow-hidden border border-gray-100 divide-y divide-gray-100">
                    {selectedSale.products?.map((item, idx) => (
                      <div key={idx} className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-sm group hover:bg-white transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-xs font-black text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-black text-gray-800 group-hover:text-primary transition-colors">{item.name}</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mt-1">
                              <span>Price: Rs.{item.price.toLocaleString()}</span>
                              <span>•</span>
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-gray-800">Rs. {(item.quantity * item.price).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10 pt-10 border-t border-gray-100">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] ml-1">Transaction Notes</p>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic pr-4">
                      {selectedSale.notes || "No special instructions or internal notes were recorded for this transaction."}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Net Receivables</p>
                    <div className="relative inline-block">
                      <p className="text-5xl font-black text-gray-800 tracking-tighter">
                        <span className="text-xl text-primary align-top mr-1">Rs.</span>
                        {selectedSale.totalAmount?.toLocaleString()}
                      </p>
                      <div className="absolute -bottom-2 right-0 w-full h-1 bg-primary/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => handleDownloadInvoice(selectedSale._id)}
                  className="group flex items-center gap-3 px-8 py-4 bg-white hover:bg-primary text-gray-600 hover:text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 border border-gray-200 hover:border-primary active:scale-95"
                >
                  <FileText size={20} className="group-hover:scale-110 transition-transform" />
                  Generate E-Invoice
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