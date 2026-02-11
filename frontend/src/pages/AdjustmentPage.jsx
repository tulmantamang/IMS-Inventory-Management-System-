import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gettingallproducts } from "../features/productSlice";
import { createAdjustment, getAllAdjustments } from "../features/adjustmentSlice";
import toast from "react-hot-toast";
import {
    History,
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

const INCREASE_REASONS = [
    "Physical Count Correction",
    "Initial Stock Entry",
    "Found Extra Stock",
    "System Entry Error",
    "Other"
];

const DECREASE_REASONS = [
    "Damaged",
    "Expired",
    "Lost / Theft",
    "Internal Use",
    "System Entry Error",
    "Other"
];

function AdjustmentPage() {
    const dispatch = useDispatch();
    const { Authuser } = useSelector((state) => state.auth);
    const { getallproduct } = useSelector((state) => state.product);
    const { adjustments, loading } = useSelector((state) => state.adjustment);

    // Authorization: Only ADMIN
    const isAdmin = Authuser?.role === 'ADMIN';

    // Form State
    const [productId, setProductId] = useState("");
    const [type, setType] = useState("INCREASE");
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [remarks, setRemarks] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset reason when type changes
    useEffect(() => {
        setReason("");
    }, [type]);

    useEffect(() => {
        dispatch(gettingallproducts());
        dispatch(getAllAdjustments());
    }, [dispatch]);

    // Redirect or block if not admin
    if (!isAdmin) {
        return (
            <div className="bg-neutral-50 min-h-screen">
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
            toast.error("Please fill all required fields");
            return;
        }

        setIsSubmitting(true);
        dispatch(createAdjustment({
            productId,
            type,
            quantity: Number(quantity),
            reason,
            remarks
        }))
            .unwrap()
            .then(() => {
                toast.success("Adjustment recorded successfully!");
                setProductId("");
                setQuantity("");
                setReason("");
                setRemarks("");
                dispatch(gettingallproducts()); // Refresh stock levels
                dispatch(getAllAdjustments()); // Refresh adjustment list
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
            <div className="px-8 pb-8 pt-4 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
                            Stock Adjustments
                        </h1>
                        <p className="text-gray-500 mt-1">Manual corrections for inventory discrepancies and stock counts</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Adjustment Form */}
                    <div className="lg:col-span-4">
                        <div className="card p-6 bg-white border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-800 mb-6">New Adjustment</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Select Product</label>
                                    <select
                                        className="input-field w-full h-12 text-sm appearance-none"
                                        value={productId}
                                        onChange={(e) => setProductId(e.target.value)}
                                        required
                                    >
                                        <option value="">Choose product...</option>
                                        {getallproduct?.filter(p => p.status === 'Active').map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} (Stock: {p.total_stock ?? 0})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Adjustment Type</label>
                                    <select
                                        className="input-field w-full h-12 text-sm"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        required
                                    >
                                        <option value="INCREASE">Increase Stock</option>
                                        <option value="DECREASE">Decrease Stock</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Quantity</label>
                                    <input
                                        type="number"
                                        className="input-field w-full h-12 text-sm"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder="Enter quantity"
                                        min="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Reason</label>
                                    <select
                                        className="input-field w-full h-12 text-sm"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                    >
                                        <option value="">Select reason...</option>
                                        {(type === 'INCREASE' ? INCREASE_REASONS : DECREASE_REASONS).map((r) => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase text-gray-400 mb-2 tracking-widest">Remarks (Optional)</label>
                                    <textarea
                                        className="input-field w-full h-24 text-sm bg-neutral-50 resize-none pt-3"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-95 ${isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-blue-600'}`}
                                >
                                    {isSubmitting ? 'Processing...' : 'Save Adjustment'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Adjustment History */}
                    <div className="lg:col-span-8">
                        <div className="card bg-white border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Adjustment History</h3>
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-white border border-gray-200 text-xs rounded-lg px-4 py-2 w-32 outline-none focus:ring-1 focus:ring-primary"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-gray-100 text-gray-500 uppercase text-[11px] font-bold tracking-widest leading-none">
                                        <tr>
                                            <th className="px-4 py-5">Date</th>
                                            <th className="px-4 py-5">Product</th>
                                            <th className="px-4 py-5 text-center">Type</th>
                                            <th className="px-4 py-5 text-right">Qty</th>
                                            <th className="px-4 py-5">Reason</th>
                                            <th className="px-4 py-5">By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {filteredAdjustments.length > 0 ? (
                                            filteredAdjustments.map((adj) => {
                                                const displayType = adj.type === 'INCREASE' || adj.type === 'DECREASE'
                                                    ? adj.type
                                                    : (adj.type === 'Damage' ? 'DECREASE' : adj.type === 'Return' ? 'INCREASE' : adj.type);

                                                const isIncrease = displayType === 'INCREASE' || displayType === 'Return';
                                                const adjustedQty = adj.quantity;

                                                return (
                                                    <tr key={adj._id} className="hover:bg-blue-50/20 transition group">
                                                        <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-600">
                                                            <FormattedTime timestamp={adj.createdAt} />
                                                        </td>
                                                        <td className="px-4 py-4">
                                                            <div className="font-bold text-gray-800 text-sm truncate max-w-[120px]" title={adj.product?.name}>{adj.product?.name || 'Deleted Product'}</div>
                                                            <div className="text-[10px] text-gray-400 uppercase font-semibold">SKU: {adj.product?.sku || 'N/A'}</div>
                                                        </td>
                                                        <td className="px-4 py-4 text-center">
                                                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gray-100 text-gray-700 border border-gray-200">
                                                                {displayType === 'INCREASE' ? 'Increase' : displayType === 'DECREASE' ? 'Decrease' : displayType}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 text-right font-black text-gray-800 text-sm">
                                                            {isIncrease ? '+' : '-'}{Math.abs(adjustedQty)}
                                                        </td>
                                                        <td className="px-4 py-4 text-sm text-gray-600 break-words max-w-[150px]">{adj.reason}</td>
                                                        <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                            {adj.adjustedBy?.name || 'Admin'}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center py-20 bg-gray-50/30">
                                                    <div className="flex flex-col items-center opacity-40">
                                                        <Package size={48} className="mb-2 text-gray-400" />
                                                        <p className="italic text-gray-500">No adjustment records found.</p>
                                                    </div>
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
                    <AlertCircle className="text-amber-600 w-6 h-6 mr-4 mt-0.5" />
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
