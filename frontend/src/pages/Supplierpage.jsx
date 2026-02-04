import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { useDispatch, useSelector } from "react-redux";
import { IoMdAdd } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import {
  CreateSupplier,
  gettingallSupplier,
  deleteSupplier,
  SearchSupplier,
  EditSupplier,
} from "../features/SupplierSlice";
import { gettingallproducts } from "../features/productSlice";
import toast from "react-hot-toast";
import FormattedTime from "../lib/FormattedTime";
import { getPurchaseHistory } from "../features/purchaseSlice";

function Supplierpage() {
  const dispatch = useDispatch();
  const { getallSupplier, searchdata } = useSelector((state) => state.supplier);
  const { history: purchaseHistory } = useSelector((state) => state.purchase);
  const { getallproduct } = useSelector((state) => state.product);
  const { Authuser } = useSelector((state) => state.auth);

  // Strictly ADMIN vs STAFF
  const isAdmin = Authuser?.role === 'ADMIN';
  const isStaff = Authuser?.role === 'STAFF';

  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [Phone, setPhone] = useState("");
  const [Address, setAddress] = useState("");
  const [Email, setEmail] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  // State for new fields
  const [contactPerson, setContactPerson] = useState("");
  const [panVat, setPanVat] = useState("");
  const [status, setStatus] = useState("Active");
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    dispatch(gettingallSupplier());
    dispatch(getPurchaseHistory());
    dispatch(gettingallproducts());
  }, [dispatch]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setAddress("");
    setEmail("");
    setContactPerson("");
    setPanVat("");
    setStatus("Active");
    setSelectedSupplier(null);
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!selectedSupplier) return;

    const updatedData = {
      name,
      contactPerson,
      phone: Phone,
      email: Email,
      address: Address,
      panVat,
      status
    };

    dispatch(EditSupplier({ supplierId: selectedSupplier._id, updatedData }))
      .unwrap()
      .then(() => {
        setIsFormVisible(false);
        resetForm();
      })
      .catch((err) => {
        console.error("Edit failed:", err);
      });
  };

  const handleEditClick = (supplier) => {
    setSelectedSupplier(supplier);
    setName(supplier.name);
    setPhone(supplier.phone);
    setEmail(supplier.email);
    setAddress(supplier.address);
    setContactPerson(supplier.contactPerson || "");
    setPanVat(supplier.panVat || "");
    setStatus(supplier.status || "Active");
    setIsFormVisible(true);
  };

  const handleRemove = async (SupplierId) => {
    if (!isAdmin) {
      toast.error("Only Admin can delete suppliers");
      return;
    }
    if (window.confirm("Are you sure?")) {
      dispatch(deleteSupplier(SupplierId));
    }
  };

  const submitSupplier = async (event) => {
    event.preventDefault();
    const supplierInfo = {
      name,
      contactPerson,
      phone: Phone,
      email: Email,
      address: Address,
      panVat,
      status: "Active"
    };
    dispatch(CreateSupplier(supplierInfo))
      .unwrap()
      .then(() => {
        resetForm();
        setIsFormVisible(false);
        dispatch(gettingallSupplier());
      })
      .catch((err) => {
        console.error("Create failed:", err);
      });
  };

  const displaySuppliers = query.trim() !== "" ? searchdata : getallSupplier;

  return (
    <div className="bg-neutral-50 min-h-screen text-gray-900 font-sans">
      <TopNavbar />

      <div className="p-8">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-900 mb-8 w-64">
          <h1 className="text-gray-500 text-sm font-semibold uppercase">Total Suppliers</h1>
          <p className="text-3xl font-bold text-gray-800 mt-2">{getallSupplier?.length || "0"}</p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full md:w-96 h-12 pl-4 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Search suppliers..."
          />
          {isAdmin && (
            <button
              onClick={() => {
                setIsFormVisible(true);
                setSelectedSupplier(null);
                resetForm();
              }}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center shadow-md transition font-semibold"
            >
              <IoMdAdd className="text-xl mr-2" /> Add Supplier
            </button>
          )}
        </div>

        {isFormVisible && (
          <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 p-6 border-l transition-transform duration-300">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-xl font-bold">
                {selectedSupplier ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <button
                onClick={() => setIsFormVisible(false)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition"
              >
                <MdKeyboardDoubleArrowLeft className="text-2xl" />
              </button>
            </div>

            <form onSubmit={selectedSupplier ? handleEditSubmit : submitSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. ABC Trading Pvt Ltd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  type="text"
                  className="input-field"
                  required
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    value={Phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="number"
                    className="input-field"
                    required
                    placeholder="98XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN/VAT *</label>
                  <input
                    value={panVat}
                    onChange={(e) => setPanVat(e.target.value)}
                    type="number"
                    className="input-field"
                    required
                    placeholder="Validation No."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  value={Email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="input-field"
                  placeholder="suppier@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  value={Address}
                  onChange={(e) => setAddress(e.target.value)}
                  type="text"
                  className="input-field"
                  required
                  placeholder="City, Street"
                />
              </div>

              {selectedSupplier && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-lg font-bold shadow mt-4"
              >
                {selectedSupplier ? "Update Supplier" : "Create Supplier"}
              </button>
            </form>
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Contact Person</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">PAN/VAT</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(displaySuppliers) && displaySuppliers.length > 0 ? (
                  displaySuppliers.map((supplier, index) => (
                    <tr key={supplier._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{supplier.contactPerson}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="font-medium">{supplier.phone}</div>
                        <div className="text-xs text-blue-600">{supplier.email}</div>
                        <div className="text-xs text-gray-400 mt-1">{supplier.address}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {supplier.panVat}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${supplier.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {supplier.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-3 whitespace-nowrap">
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setShowHistory(true);
                              }}
                              className="text-green-600 hover:text-green-800 font-bold text-xs transition uppercase tracking-tighter"
                            >
                              History
                            </button>
                            <button
                              onClick={() => handleEditClick(supplier)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleRemove(supplier._id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm transition"
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-400 text-xs">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      No Suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Supplier History Modal */}
      {showHistory && selectedSupplier && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Procurement History</h3>
                <p className="text-sm text-primary font-bold uppercase">{selectedSupplier.name}</p>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <MdKeyboardDoubleArrowLeft className="rotate-180 text-2xl" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {purchaseHistory.filter(p => p.supplier?._id === selectedSupplier._id).length > 0 ? (
                  purchaseHistory.filter(p => p.supplier?._id === selectedSupplier._id).map((p, idx) => (
                    <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Invoice / Date</p>
                          <p className="font-mono text-xs font-bold text-primary">{p.invoiceNumber || 'N/A'}</p>
                          <p className="text-xs text-gray-500"><FormattedTime timestamp={p.purchaseDate} /></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Total Amount</p>
                          <p className="font-black text-gray-800 text-lg">Rs. {p.totalAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 divide-y">
                        {p.items?.map((item, i) => (
                          <div key={i} className="p-2 flex justify-between text-xs">
                            <span className="font-bold underline decoration-blue-200 underline-offset-4">{item.product?.name}</span>
                            <span className="text-gray-600">Qty: <b className="text-gray-900">{item.quantity}</b> @ Rs. {item.costPrice}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 opacity-40">
                    <p className="italic">No purchase records found for this vendor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Supplierpage;