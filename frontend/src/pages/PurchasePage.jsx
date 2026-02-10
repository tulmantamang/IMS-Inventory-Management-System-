import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { useDispatch, useSelector } from "react-redux";
import { gettingallproducts } from "../features/productSlice";
import { gettingallSupplier } from "../features/SupplierSlice";
import { addPurchase, getPurchaseHistory } from "../features/purchaseSlice";
import toast from "react-hot-toast";
import {
    ShoppingBag,
    Save,
    Truck,
    Package,
    Plus,
    Trash2,
    Calendar,
    FileText,
    Eye,
    X,
    ClipboardList,
    TrendingUp,
    Search
} from "lucide-react";
import FormattedTime from "../lib/FormattedTime";

function PurchasePage() {
    const dispatch = useDispatch();
    const { getallproduct } = useSelector((state) => state.product);
    const { getallSupplier: getallsupplier } = useSelector((state) => state.supplier);
    const { history, loading: actionLoading } = useSelector((state) => state.purchase);
    const { Authuser } = useSelector((state) => state.auth);

    // Permissions
    const isAdmin = Authuser?.role === 'ADMIN';
    const isStaff = Authuser?.role === 'STAFF';
    const hasAccess = isAdmin || isStaff;

    // Master Form State
    const [supplierId, setSupplierId] = useState("");
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [paymentType, setPaymentType] = useState("Cash");
    const [notes, setNotes] = useState("");
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    // Items State
    const [items, setItems] = useState([{
        productId: "",
        quantity: "",
        costPrice: "",
        batchNumber: "",
        expiryDate: ""
    }]);

    // UI States
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        dispatch(gettingallproducts());
        dispatch(gettingallSupplier());
        dispatch(getPurchaseHistory());
    }, [dispatch]);

    const addItemRow = () => {
        setItems([...items, { productId: "", quantity: "", costPrice: "", batchNumber: "", expiryDate: "" }]);
    };

    const removeItemRow = (index) => {
        if (items.length === 1) return;
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.costPrice) || 0), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!supplierId) return toast.error("Please select a supplier");
        if (items.some(item => !item.productId || Number(item.quantity) <= 0 || Number(item.costPrice) <= 0)) {
            return toast.error("Please fill all required item fields (Product, Qty > 0, Price > 0)");
        }

        const purchaseData = {
            supplierId,
            invoiceNumber,
            paymentType,
            notes,
            purchaseDate,
            items: items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                costPrice: Number(item.costPrice)
            }))
        };

        dispatch(addPurchase(purchaseData))
            .unwrap()
            .then(() => {
                toast.success("Purchase recorded successfully!");
                setIsFormVisible(false);
                resetForm();
            })
            .catch((err) => {
                const errorMessage = typeof err === 'string' ? err : err?.message || "Failed to record purchase";
                toast.error(errorMessage);
            });
    };

    const resetForm = () => {
        setSupplierId("");
        setInvoiceNumber("");
        setPaymentType("Cash");
        setNotes("");
        setItems([{ productId: "", quantity: "", costPrice: "", batchNumber: "", expiryDate: "" }]);
    };

    const handleDownloadInvoice = (purchaseId) => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://advanced-inventory-management-system-v1.onrender.com";
        const url = `${backendUrl}/api/purchase/${purchaseId}/invoice`;
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
                a.download = `purchase-invoice-${purchaseId}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(err => {
                console.error(err);
                toast.error("Failed to generate purchase invoice");
            });
    };

    const filteredHistory = history.filter(p =>
        p.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-gray-900 pb-20">
            <TopNavbar />

            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center tracking-tight">
                            <ShoppingBag className="mr-3 text-primary" size={32} /> Inventory Procurement
                        </h1>
                        <p className="text-gray-500 mt-1">Manage bulk purchases, invoices, and stock receipts</p>
                    </div>
                    {hasAccess && (
                        <button
                            onClick={() => setIsFormVisible(true)}
                            className="bg-primary hover:bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center shadow-lg transition-all transform hover:-translate-y-1 font-bold"
                        >
                            <Plus className="mr-2" size={20} /> New Purchase Order
                        </button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><TrendingUp size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Total Purchases</p>
                            <p className="text-2xl font-black text-gray-800">{history.length}</p>
                        </div>
                    </div>
                    <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><ClipboardList size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Recent (30 Days)</p>
                            <p className="text-2xl font-black text-gray-800">
                                {history.filter(p => new Date(p.purchaseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                            </p>
                        </div>
                    </div>
                    <div className="card p-6 bg-white border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Truck size={24} /></div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase">Active Suppliers</p>
                            <p className="text-2xl font-black text-gray-800">{getallsupplier?.length || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Invoice or Supplier..."
                            className="input-field pl-10 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Purchase List */}
                <div className="card overflow-hidden shadow-xl border-none">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest leading-none">
                                <tr>
                                    <th className="px-6 py-5">Date</th>
                                    <th className="px-6 py-5">Invoice #</th>
                                    <th className="px-6 py-5">Supplier</th>
                                    <th className="px-6 py-5 text-center">Items</th>
                                    <th className="px-6 py-5 text-right">Total Amount</th>
                                    <th className="px-6 py-5 text-center">Status</th>
                                    <th className="px-6 py-5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredHistory.length > 0 ? (
                                    filteredHistory.map((p) => (
                                        <tr key={p._id} className="hover:bg-blue-50/20 transition group">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                <FormattedTime timestamp={p.purchaseDate} />
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm tracking-tight text-primary font-bold">
                                                {p.invoiceNumber || <span className="text-gray-300 italic text-xs">NO-INV</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800">{p.supplier?.name || "Deleted Supplier"}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-semibold">{p.paymentType}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                                                    {p.items?.length || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-black text-gray-800">
                                                Rs. {p.totalAmount?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                                                    Received
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => setSelectedPurchase(p)}
                                                        className="p-2 text-gray-400 hover:text-primary transition-colors rounded-lg hover:bg-white border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadInvoice(p._id)}
                                                        className="p-2 text-gray-400 hover:text-green-500 transition-colors rounded-lg hover:bg-white border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm"
                                                        title="Download Invoice"
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
                                                <p className="italic text-gray-500">No purchase records found matching your query.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Slide-over New Purchase Form */}
                {isFormVisible && (
                    <div className="fixed inset-0 z-[60] overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsFormVisible(false)} />
                        <div className="absolute inset-y-0 right-0 max-w-4xl w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-2xl font-black text-gray-800 flex items-center">
                                    <ShoppingBag className="mr-3 text-primary" /> Create New Purchase Order
                                </h2>
                                <button onClick={() => setIsFormVisible(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
                                {/* Header Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50/30 rounded-2xl border border-blue-100">
                                    <div className="col-span-full md:col-span-1">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-black uppercase text-gray-400 tracking-widest">Supplier</label>
                                            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Required</span>
                                        </div>
                                        <select
                                            value={supplierId}
                                            onChange={(e) => setSupplierId(e.target.value)}
                                            className={`input-field w-full h-12 text-sm bg-white ${!supplierId ? 'border-red-200 focus:ring-red-500' : ''}`}
                                            required
                                        >
                                            <option value="">Select Vendor...</option>
                                            {getallsupplier?.filter(s => s.status === 'Active').map(s => (
                                                <option key={s._id} value={s._id}>{s.name} ({s.pan_vat || 'No PAN'})</option>
                                            ))}
                                        </select>
                                        {getallsupplier?.filter(s => s.status === 'Active').length === 0 && (
                                            <p className="text-[10px] text-red-500 mt-1 font-bold italic">! No active suppliers found in system.</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Invoice / Bill #</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. INV-9002"
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
                                            value={purchaseDate}
                                            onChange={(e) => setPurchaseDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Items Management */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <h3 className="text-sm font-black uppercase text-gray-500 tracking-widest">Purchase Items</h3>
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
                                                <div className="col-span-12 md:col-span-4">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Product *</label>
                                                    <select
                                                        value={item.productId}
                                                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                                                        className="input-field w-full h-10 text-xs bg-white"
                                                        required
                                                    >
                                                        <option value="">Choose Listing...</option>
                                                        {getallproduct?.filter(p => p.status === 'Active' && p.category?.status === 'Active').map(p => (
                                                            <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-span-4 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Qty *</label>
                                                    <input
                                                        type="number"
                                                        onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                        className="input-field w-full h-10 text-xs bg-white text-right"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-4 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Unit Cost *</label>
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        className="input-field w-full h-10 text-xs bg-white text-right"
                                                        value={item.costPrice}
                                                        onChange={(e) => handleItemChange(index, 'costPrice', e.target.value)}
                                                        onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-span-3 md:col-span-3">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Batch/Expiry</label>
                                                    <div className="flex gap-1">
                                                        <input
                                                            type="text"
                                                            placeholder="BN-101"
                                                            className="input-field flex-1 h-10 text-[10px] bg-white font-mono"
                                                            value={item.batchNumber}
                                                            onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                                                        />
                                                        <input
                                                            type="date"
                                                            className="input-field w-1/2 h-10 text-[10px] bg-white p-1"
                                                            value={item.expiryDate}
                                                            onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                                                        />
                                                    </div>
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
                                                placeholder="Shipping details, damaged items note, etc..."
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-3xl p-8 text-gray-800 flex flex-col justify-between shadow-xl border border-gray-100">
                                        <div>
                                            <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">Final Summary</p>
                                            <div className="space-y-2 mb-8 border-b border-gray-100 pb-4">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Subtotal</span>
                                                    <span className="font-bold">Rs. {calculateTotal().toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Tax (0%)</span>
                                                    <span className="font-bold">Rs. 0</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-end mb-8">
                                                <span className="text-lg font-bold text-gray-600">Grand Total</span>
                                                <span className="text-4xl font-black text-primary">Rs. {calculateTotal().toLocaleString()}</span>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={actionLoading || !supplierId}
                                                className={`w-full h-16 rounded-2xl text-white font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl ${!supplierId || actionLoading
                                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                                    : 'bg-primary hover:bg-blue-600 shadow-primary/20'
                                                    }`}
                                            >
                                                {actionLoading ? "Processing..." : <><Save size={24} /> Confirm & Finalize</>}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Purchase Detail Modal */}
                {selectedPurchase && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedPurchase(null)} />
                        <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-start bg-blue-50/20">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-800">Purchase Details</h3>
                                    <p className="text-primary font-mono text-sm font-bold tracking-widest">{selectedPurchase.invoiceNumber || 'TXN-' + selectedPurchase._id.slice(-6).toUpperCase()}</p>
                                </div>
                                <button onClick={() => setSelectedPurchase(null)} className="p-2 hover:bg-white rounded-full transition">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Supplier</p>
                                        <p className="text-lg font-bold text-gray-800">{selectedPurchase.supplier?.name}</p>
                                        <p className="text-sm text-gray-500">{selectedPurchase.supplier?.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Payment Method</p>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPurchase.paymentType}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Line Items</p>
                                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                                        {selectedPurchase.items?.map((item, idx) => (
                                            <div key={idx} className="p-4 flex justify-between items-center border-b border-gray-200 last:border-0">
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.product?.name || "Deleted Product"}</p>
                                                    <p className="text-xs text-gray-400 font-mono tracking-tighter">SKU: {item.product?.sku} | Cost: Rs.{item.costPrice}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-gray-700">x {item.quantity}</p>
                                                    <p className="text-xs font-bold text-primary">Rs. {(item.quantity * item.costPrice).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-end border-t border-gray-100 pt-6">
                                    <div className="max-w-[60%]">
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Notes</p>
                                        <p className="text-xs text-gray-500 italic leading-relaxed">{selectedPurchase.notes || "No internal notes provided for this transaction."}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Grand Total</p>
                                        <p className="text-3xl font-black text-gray-800 leading-none">Rs. {selectedPurchase.totalAmount?.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                                <button
                                    onClick={() => handleDownloadInvoice(selectedPurchase._id)}
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition shadow-lg shadow-primary/20"
                                >
                                    <FileText size={18} /> Download Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PurchasePage;
