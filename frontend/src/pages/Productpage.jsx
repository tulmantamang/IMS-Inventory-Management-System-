import React, { useEffect, useState } from "react";
import TopNavbar from "../Components/TopNavbar";
import { IoMdAdd } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdCloudUpload } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  Addproduct,
  gettingallproducts,
  Searchproduct,
  Removeproduct,
  EditProduct,
} from "../features/productSlice";
import { gettingallCategory } from "../features/categorySlice";
import { gettingallSupplier } from "../features/SupplierSlice";
import toast from "react-hot-toast";

function Productpage() {
  const { getallproduct, editedProduct, isproductadd, searchdata } = useSelector(
    (state) => state.product
  );
  const { getallCategory } = useSelector((state) => state.category);
  const { getallSupplier: getallsupplier } = useSelector((state) => state.supplier);
  const { Authuser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const isAdmin = Authuser?.role === 'ADMIN';

  // Admin can manage (Add/Edit/Delete). Staff is View Only.
  const canManage = isAdmin;
  // Only Admin can delete (Redundant but clear)
  const canDelete = isAdmin;

  const [query, setquery] = useState("");
  // Form States
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [supplier, setSupplier] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [status, setStatus] = useState("Active");
  const [batchNumber, setBatchNumber] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [productHistory, setProductHistory] = useState([]);

  useEffect(() => {
    dispatch(gettingallproducts());
    dispatch(gettingallCategory());
    dispatch(gettingallSupplier());
  }, [dispatch, editedProduct, isproductadd]);

  useEffect(() => {
    if (query.trim() !== "") {
      const repeatTimeout = setTimeout(() => {
        dispatch(Searchproduct(query));
      }, 500);
      return () => clearTimeout(repeatTimeout);
    }
  }, [query, dispatch]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setImage(reader.result); // Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleremove = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      dispatch(Removeproduct(productId))
        .unwrap()
        .then(() => toast.success("Product removed successfully"))
        .catch((error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to remove product";
          toast.error(errorMessage);
        });
    }
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!selectedProduct) return;

    const updatedData = {
      name,
      category,
      price,
      description,
      sku,
      unit,
      reorderLevel: Number(reorderLevel),
      status,
      image,
      supplier,
      batchNumber,
      serialNumber,
      notes
    };

    dispatch(EditProduct({ id: selectedProduct._id, updatedData }))
      .unwrap()
      .then(() => {
        toast.success("Product updated successfully");
        setIsFormVisible(false);
        setSelectedProduct(null);
        resetForm();
      })
      .catch(() => toast.error("Failed to update product"));
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!supplier) {
      toast.error("Please select a supplier");
      return;
    }

    const productData = {
      name,
      sku,
      description,
      category,
      price,
      unit,
      reorderLevel: Number(reorderLevel),
      status,
      expiryDate,
      image,
      supplier,
      batchNumber,
      serialNumber,
      notes
    };

    dispatch(Addproduct(productData))
      .unwrap()
      .then(() => {
        toast.success("Product added successfully");
        resetForm();
        setIsFormVisible(false);
      })
      .catch((err) => {
        const errorMessage = typeof err === 'string' ? err : err?.message || "Product add unsuccessful";
        toast.error(errorMessage);
      });
  };

  const resetForm = () => {
    setName("");
    setSku("");
    setCategory("");
    setSupplier("");
    setPrice("");
    setDescription("");
    setUnit("pcs");
    setReorderLevel("0");
    setStatus("Active");
    setBatchNumber("");
    setSerialNumber("");
    setNotes("");
    setExpiryDate("");
    setImage("");
    setPreviewImage("");
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setSku(product.sku || "");
    setCategory(product.category?._id || product.Category?._id || "");
    setSupplier(product.supplier?._id || "");
    setPrice(product.price || product.Price);
    setDescription(product.description || product.Desciption);
    setUnit(product.unit || "pcs");
    setReorderLevel(product.reorderLevel || "0");
    setStatus(product.status || "Active");
    setBatchNumber(product.batchNumber || "");
    setSerialNumber(product.serialNumber || "");
    setNotes(product.notes || "");
    setExpiryDate(product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "");
    setPreviewImage(product.image || "");
    setIsFormVisible(true);
  };

  const handleRowClick = async (product) => {
    setSelectedProduct(product);
    setIsDetailVisible(true);
    try {
      const response = await fetch(`http://localhost:3003/api/stock/product/${product._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProductHistory(data);
    } catch (error) {
      toast.error("Failed to load history");
    }
  };

  const [supplierFilter, setSupplierFilter] = useState("");

  const displayProducts = (query.trim() !== "" ? searchdata : getallproduct).filter(p => {
    if (!supplierFilter) return true;
    return p.supplier?._id === supplierFilter || p.supplier === supplierFilter;
  });

  return (
    <div className="bg-neutral-50 min-h-screen text-gray-900 font-sans">
      <TopNavbar />

      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setquery(e.target.value)}
            className="w-full md:w-96 h-12 pl-4 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Search products by Name, SKU..."
          />
          <select
            className="w-full md:w-48 h-12 pl-4 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") {
                dispatch(gettingallproducts());
              } else {
                // Logic to filter by supplier - currently SearchProduct backend doesn't support supplier filter parameter
                // but we can filter displayProducts on frontend for quick results
                setSupplierFilter(val);
              }
            }}
          >
            <option value="">All Suppliers</option>
            {getallsupplier?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          {canManage && (
            <button
              onClick={() => {
                setIsFormVisible(true);
                setSelectedProduct(null);
                resetForm();
              }}
              className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg flex items-center shadow-md transition font-semibold"
            >
              <IoMdAdd className="text-xl mr-2" /> Add Product
            </button>
          )}
        </div>

        {/* Product Form Side Panel */}
        {isFormVisible && (
          <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 p-6 overflow-y-auto border-l border-gray-200 transition-transform duration-300 animate-slide-in">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedProduct ? "Edit Product" : "New Product"}
              </h2>
              <button onClick={() => setIsFormVisible(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition">
                <MdKeyboardDoubleArrowLeft className="text-2xl" />
              </button>
            </div>

            <form onSubmit={selectedProduct ? handleEditSubmit : submitProduct} className="space-y-4">
              {/* Image Upload */}
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition cursor-pointer relative">
                <input type="file" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                {previewImage ? (
                  <img src={previewImage} alt="Preview" className="h-32 object-contain rounded" />
                ) : (
                  <div className="text-center text-gray-500">
                    <MdCloudUpload className="text-4xl mx-auto mb-2 text-primary" />
                    <span className="text-sm">Click to upload product image</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input value={sku} onChange={(e) => setSku(e.target.value)} type="text" className="input-field" placeholder="Unique ID" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" required>
                    <option value="">Select Category</option>
                    {getallCategory?.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select value={supplier} onChange={(e) => setSupplier(e.target.value)} className="input-field" required>
                    <option value="">Select Supplier</option>
                    {getallsupplier?.map((sup) => (
                      <option key={sup._id} value={sup._id}>{sup.name}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="input-field" required min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                  <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="input-field" required min="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input-field" required>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="box">Box</option>
                    <option value="ltr">Liter (ltr)</option>
                    <option value="pkt">Packet (pkt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                  <input type="text" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="input-field" placeholder="B-123" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                  <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} className="input-field" placeholder="SN-456" />
                </div>
              </div>

              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Remarks</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-field h-20" placeholder="Optional notes..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field h-24" required />
              </div>

              <button type="submit" className="w-full btn-primary py-3 rounded-lg font-bold shadow-lg transform transition hover:-translate-y-1">
                {selectedProduct ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div>
        )}

        {/* Product Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Supplier</th>
                  <th className="px-6 py-4 text-center">Unit</th>
                  <th className="px-6 py-4 text-center">Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Array.isArray(displayProducts) && displayProducts.length > 0 ? (
                  displayProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => handleRowClick(product)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {product.image && <img src={product.image} alt="" className="w-10 h-10 rounded object-cover border" />}
                          <div>
                            <div className="font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">{product.description || product.Desciption}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        <span className="bg-gray-200 text-gray-700 py-1 px-2 rounded text-xs">
                          {product.category?.name || product.Category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.supplier?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">
                        {product.unit || "pcs"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${(product.stockQuantity || product.quantity) <= (product.reorderLevel || 0)
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                          }`}>
                          {product.stockQuantity ?? product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-[10px] rounded-full uppercase font-bold ${product.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-900">Rs. {product.price || product.Price}</td>
                      <td className="px-6 py-4 text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {canManage && (
                          <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800 transition text-sm font-medium">Edit</button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleremove(product._id)} className="text-red-600 hover:text-red-800 transition text-sm font-medium ml-2">Delete</button>
                        )}
                        {!canManage && !canDelete && <span className="text-xs text-gray-400">View Only</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400 italic">
                      No products found. Start adding some!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {isDetailVisible && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
              <button onClick={() => setIsDetailVisible(false)} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                <div>
                  {selectedProduct.image && (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-lg border shadow-sm mb-4" />
                  )}
                  <h3 className="text-xl font-bold mb-2">{selectedProduct.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedProduct.description || selectedProduct.Desciption}</p>

                  <div className="space-y-2">
                    <p><strong>SKU:</strong> {selectedProduct.sku}</p>
                    <p><strong>Category:</strong> {selectedProduct.category?.name || "Uncategorized"}</p>
                    <p><strong>Supplier:</strong> {selectedProduct.supplier?.name || "N/A"}</p>
                    <p><strong>Status:</strong> <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedProduct.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedProduct.status}</span></p>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 h-fit">
                  <h4 className="font-bold text-blue-800 mb-4 flex items-center">
                    Inventory Status
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end border-b pb-2">
                      <span className="text-gray-600">Current Stock</span>
                      <span className="text-3xl font-black text-blue-700">{selectedProduct.stockQuantity ?? selectedProduct.quantity} {selectedProduct.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Selling Price</span>
                      <span className="font-bold text-gray-900">Rs. {selectedProduct.price || selectedProduct.Price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reorder Level</span>
                      <span className="font-bold text-red-600">{selectedProduct.reorderLevel || 0}</span>
                    </div>
                    {selectedProduct.batchNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch Number</span>
                        <span className="font-mono text-sm">{selectedProduct.batchNumber}</span>
                      </div>
                    )}
                    {selectedProduct.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date</span>
                        <span className="font-bold text-orange-600">{new Date(selectedProduct.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  {selectedProduct.notes && (
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-xs text-gray-500 uppercase font-bold mb-1">Notes / Remarks</p>
                      <p className="text-sm text-gray-700 italic">{selectedProduct.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Stock Movement History</h4>
                <div className="bg-white border rounded-lg overflow-hidden">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Performed By</th>
                        <th className="px-4 py-3">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {productHistory.length > 0 ? productHistory.map((log, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.type === 'IN' ? 'bg-green-100 text-green-700' : log.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">{log.quantity}</td>
                          <td className="px-4 py-3">{log.performedBy?.name || "System"}</td>
                          <td className="px-4 py-3 text-gray-500 italic">{log.reason || "N/A"}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-gray-400 italic">No movement record found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setIsDetailVisible(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productpage;