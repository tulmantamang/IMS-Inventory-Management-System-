import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { useDispatch, useSelector } from "react-redux";
import { gettingallproducts } from "../features/productSlice";
import { createAdjustment, getAllAdjustments } from "../features/adjustmentSlice";
import toast from "react-hot-toast";
import {
    History,
    ShieldAlert,
    RotateCcw,
    Edit3,
    Search,
    AlertCircle,
    Calendar,
    User,
    Package,
    ArrowRightCircle,
    CheckCircle2
} from "lucide-react";
import FormattedTime from "../lib/FormattedTime";

function AdjustmentPage() {
    const dispatch = useDispatch();
    const { Authuser } = useSelector((state) => state.auth);
    const { getallproduct } = useSelector((state) => state.product);
    const { adjustments, loading } = useSelector((state) => state.adjustment);

    // Authorization: Only ADMIN
    const isAdmin = Authuser?.role === 'ADMIN';

    // Form State
    const [productId, setProductId] = useState("");
    const [type, setType] = useState("Damage");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        dispatch(gettingallproducts());
        dispatch(getAllAdjustments());
    }, [dispatch]);

    // Redirect or block if not admin
    if (!isAdmin) {
        return (
            <div className="bg-neutral-50 min-h-screen">
                <TopNavbar />
                <div className="p-20 text-center">
                    <AlertCircle size={64} className="mx-auto text-red-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Access Restricted</h2>
                    <p className="text-gray-500">Only administrators are authorized to make stock adjustments.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!productId || !quantity || !reason) {
            toast.error("Please fill all fields");
            return;
        }

        setIsSubmitting(true);
        dispatch(createAdjustment({ productId, type, quantity: Number(quantity), reason }))
            .unwrap()
            .then(() => {
                toast.success("Adjustment recorded successfully!");
                setProductId("");
                setQuantity("");
                setReason("");
                dispatch(gettingallproducts()); // Refresh stock levels
            })
            .catch((err) => {
                const errorMessage = typeof err === 'string' ? err : err?.message || "Adjustment failed";
                toast.error(errorMessage);
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    const filteredAdjustments = adjustments.filter(adj =>
        adj.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        adj.type?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-neutral-50 min-h-screen font-sans text-gray-900 pb-20">
            <TopNavbar />
            <div className="p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center tracking-tight">
                            <History className="mr-3 w-8 h-8 text-primary" />
                            Stock Adjustments
                        </h1>
                        <p className="text-gray-500 mt-1">Manual corrections for damages, returns, or stock counts.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Adjustment Form */}
                    <div className="lg:col-span-5">
                        <div className="card p-6 bg-white border border-gray-100 shadow-xl">
                            <div className="flex items-center space-x-2 mb-6 text-primary">
                                <Edit3 size={20} />
                                <h2 className="text-lg font-bold">New Correction</h2>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Select Product</label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <select
                                            className="input-field w-full pl-10 h-12 text-sm appearance-none"
                                            value={productId}
                                            onChange={(e) => setProductId(e.target.value)}
                                            required
                                        >
                                            <option value="">Choose item...</option>
                                            {getallproduct?.filter(p => p.status === 'Active').map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.name} (Stock: {p.stockQuantity ?? 0})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Adjustment Type</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setType('Damage')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${type === 'Damage' ? 'border-red-500 bg-red-50 text-red-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <ShieldAlert className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] font-black uppercase">Damage</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('Return')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${type === 'Return' ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <RotateCcw className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] font-black uppercase">Return</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('Correction')}
                                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${type === 'Correction' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                                        >
                                            <Edit3 className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] font-black uppercase">Correction</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Quantity</label>
                                        <input
                                            type="number"
                                            className="input-field w-full h-12 text-sm text-center font-bold"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                            placeholder="0"
                                            min="1"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-center pt-5">
                                        <p className="text-[10px] text-gray-400 font-bold leading-tight">
                                            {type === 'Damage' ? '⚠️ Will be deducted from inventory.' : type === 'Return' ? '✅ Will be added back to inventory.' : 'ℹ️ Adjust based on stock count.'}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Reason / Memo</label>
                                    <textarea
                                        className="input-field w-full h-24 text-sm bg-neutral-50 resize-none pt-3"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Brief explanation for the audit trail..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-blue-600 shadow-primary/20 hover:shadow-primary/40'}`}
                                >
                                    {isSubmitting ? 'Processing...' : <><ArrowRightCircle size={20} /> Post Adjustment</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Adjustment Audit History */}
                    <div className="lg:col-span-7">
                        <div className="card bg-white border border-gray-100 shadow-xl overflow-hidden flex flex-col h-full max-h-[750px]">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" /> Recent Activity Audit
                                </h3>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search audit trail..."
                                        className="bg-white border text-xs rounded-lg pl-8 pr-4 py-2 w-48 outline-none focus:ring-1 focus:ring-primary"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4 text-center">Qty</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Audit By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredAdjustments.length > 0 ? (
                                            filteredAdjustments.map((adj) => (
                                                <tr key={adj._id} className="hover:bg-gray-50 transition border-transparent border-l-4 hover:border-primary">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-800 text-sm">{adj.product?.name || 'Unknown'}</div>
                                                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                            <Calendar size={10} /> <FormattedTime timestamp={adj.createdAt} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`font-black text-sm ${adj.quantity < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                                            {adj.quantity > 0 ? `+${adj.quantity}` : adj.quantity}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter ${adj.type === 'Damage' ? 'bg-red-50 text-red-600' :
                                                            adj.type === 'Return' ? 'bg-green-50 text-green-600' :
                                                                'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            {adj.type}
                                                        </span>
                                                        <div className="text-[10px] text-gray-500 mt-1 italic truncate max-w-[120px]" title={adj.reason}>
                                                            "{adj.reason}"
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs font-bold text-gray-700 flex items-center gap-1">
                                                            <User size={12} className="text-gray-300" /> {adj.adjustedBy?.name || 'Admin'}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center py-20 opacity-30">
                                                    <History className="mx-auto mb-2" size={40} />
                                                    <p className="italic text-sm">No adjustment records found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start shadow-sm">
                    <ShieldAlert className="text-amber-600 w-6 h-6 mr-4 mt-0.5" />
                    <div className="max-w-2xl">
                        <h4 className="font-black text-amber-800 text-sm uppercase tracking-wider mb-1">Strict Compliance Notice</h4>
                        <p className="text-sm text-amber-800/80 leading-relaxed">
                            Stock adjustments are final and cannot be edited. Every transaction is recorded in the <strong>Stock History Ledger</strong> for end-of-quarter audits. Unauthorized manipulation is automatically flagged.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdjustmentPage;
