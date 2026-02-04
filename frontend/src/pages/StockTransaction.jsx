import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { IoMdAdd } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdSearch, MdFilterList } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import FormattedTime from "../lib/FormattedTime";
import {
  createStockTransaction,
  getAllStockTransactions,
} from "../features/stocktransactionSlice";
import { gettingallproducts } from "../features/productSlice";
import { gettingallSupplier } from "../features/SupplierSlice";
import toast from "react-hot-toast";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

function StockTransaction() {
  const { Authuser } = useSelector((state) => state.auth);
  const { getallStocks, totalPages, currentPage, isgetallStocks, iscreatedStocks } = useSelector((state) => state.stocktransaction);
  const { getallproduct } = useSelector((state) => state.product);
  const { getallSupplier: getallsupplier } = useSelector((state) => state.supplier);

  const dispatch = useDispatch();

  // Filter States
  const [filterType, setFilterType] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Form States
  const [product, setproduct] = useState("");
  const [type, settype] = useState("ADJUST");
  const [quantity, setquantity] = useState("");
  const [reason, setReason] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    dispatch(gettingallproducts());
    dispatch(gettingallSupplier());
  }, [dispatch]);

  useEffect(() => {
    const params = {
      page,
      type: filterType,
      product: filterProduct,
      supplier: filterSupplier,
      startDate,
      endDate
    };
    dispatch(getAllStockTransactions(params));
  }, [dispatch, page, filterType, filterProduct, filterSupplier, startDate, endDate]);

  const resetForm = () => {
    setproduct("");
    settype("ADJUST");
    setquantity("");
    setReason("");
    setSupplierId("");
  };

  const submitstocktranscation = async (event) => {
    event.preventDefault();
    if (!product || !type || !quantity) {
      toast.error("Please fill all required fields");
      return;
    }

    const StocksData = { productId: product, type, quantity, reason, supplierId };

    dispatch(createStockTransaction(StocksData))
      .unwrap()
      .then(() => {
        toast.success("Stock updated successfully");
        resetForm();
        setIsFormVisible(false);
      })
      .catch((err) => {
        const errorMessage = typeof err === 'string' ? err : err?.message || "Stock update failed";
        toast.error(errorMessage);
      });
  };

  const handleExport = () => {
    toast.success("Exporting data...");
    // Future: CSV/PDF export logic
  };

  return (
    <div className="bg-neutral-50 min-h-screen font-sans text-gray-900">
      <TopNavbar />

      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Stock History & Audit</h1>
            <p className="text-gray-500 text-sm">Traceable ledger of all inventory movements</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="btn-secondary px-4 py-2 flex items-center gap-2">
              <Download size={18} /> Export
            </button>
            {Authuser?.role === 'ADMIN' && (
              <button
                onClick={() => setIsFormVisible(true)}
                className="bg-primary hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center shadow-md transition font-semibold"
              >
                <IoMdAdd className="text-xl mr-2" /> Manual Adjustment
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="card p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-white border border-gray-100 shadow-sm">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Activity Type</label>
            <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="input-field py-1.5 h-10">
              <option value="">All Types</option>
              <option value="IN">Stock IN</option>
              <option value="OUT">Stock OUT</option>
              <option value="ADJUST">Adjustment</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Product</label>
            <select value={filterProduct} onChange={(e) => { setFilterProduct(e.target.value); setPage(1); }} className="input-field py-1.5 h-10">
              <option value="">All Products</option>
              {getallproduct?.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="input-field py-1.5 h-10" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">End Date</label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="input-field py-1.5 h-10" />
          </div>
          <button
            onClick={() => { setFilterType(""); setFilterProduct(""); setFilterSupplier(""); setStartDate(""); setEndDate(""); setPage(1); }}
            className="text-gray-500 hover:text-primary text-sm font-semibold h-10 flex items-center justify-center underline"
          >
            Clear Filters
          </button>
        </div>

        {/* Manual Adjustment Form Side Panel */}
        {isFormVisible && (
          <div className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-50 p-6 border-l border-gray-200 transition-transform duration-300">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Manual Stock Adjustment</h2>
                <p className="text-xs text-gray-500 mt-1">Directly modify inventory levels with attribution.</p>
              </div>
              <button onClick={() => setIsFormVisible(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                <MdKeyboardDoubleArrowLeft className="text-2xl" />
              </button>
            </div>

            <form onSubmit={submitstocktranscation} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
                <select value={product} onChange={(e) => setproduct(e.target.value)} className="input-field" required>
                  <option value="">Select Product...</option>
                  {getallproduct?.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Action Type *</label>
                <select value={type} onChange={(e) => settype(e.target.value)} className="input-field">
                  <option value="ADJUST">Inventory Calibration (Adjustment)</option>
                  <option value="IN">Manual Receipt (In)</option>
                  <option value="OUT">Manual Issuance (Out)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input type="number" value={quantity} onChange={(e) => setquantity(e.target.value)} className="input-field" placeholder="e.g. 50" min="1" required />
                <p className="text-[10px] text-gray-400 mt-1">For Adjustment, negative values can be used to subtract via backend logic (or separate manually).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier (Optional)</label>
                <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input-field">
                  <option value="">Select Related Supplier</option>
                  {getallsupplier?.map((s) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Reference *</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="input-field h-24" placeholder="Mention why this adjustment is being made..." required />
              </div>

              <button type="submit" className="w-full btn-primary py-4 rounded-xl font-bold shadow-lg transform transition hover:-translate-y-1" disabled={iscreatedStocks}>
                {iscreatedStocks ? "Processing..." : "Commit Transaction"}
              </button>
            </form>
          </div>
        )}

        {/* History Table */}
        <div className="card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Product Detail</th>
                  <th className="px-6 py-4">Related Supplier</th>
                  <th className="px-6 py-4 text-center">Activity</th>
                  <th className="px-6 py-4 text-center">Amount</th>
                  <th className="px-6 py-4">Attribution</th>
                  <th className="px-6 py-4">Reason/Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {getallStocks?.length > 0 ? (
                  getallStocks.map((log) => (
                    <tr key={log._id} className="hover:bg-blue-50/30 transition border-b border-gray-100">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        <FormattedTime timestamp={log.date || log.createdAt} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{log.product?.name || "N/A"}</div>
                        <div className="text-[10px] text-gray-400 font-mono tracking-tight">{log.product?.sku}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.supplier?.name || log.product?.supplier?.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${log.type === 'IN' ? 'bg-green-50 text-green-700 border-green-200' :
                          log.type === 'OUT' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-center font-black text-base ${log.type === 'IN' || (log.type === 'ADJUST' && log.quantity > 0) ? 'text-green-600' : 'text-red-500'
                        }`}>
                        {log.type === 'IN' ? '+' : log.type === 'ADJUST' && log.quantity > 0 ? '+' : '-'}{Math.abs(log.quantity)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-700">{log.performedBy?.name || "System"}</div>
                        <div className="text-[10px] text-gray-400">{log.performedBy?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs">{log.reason || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-20 bg-gray-50/30">
                      {isgetallStocks ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
                          <p className="text-gray-400 italic">Syncing with ledger...</p>
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">No movement history found for the selected filters.</p>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page <span className="font-bold">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="p-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="p-2 bg-white border rounded hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockTransaction;
