import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdKeyboardDoubleArrowLeft, MdImage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import {
  Addproduct,
  gettingallproducts,
  Searchproduct,
  Removeproduct,
  EditProduct,
} from "../features/productSlice";
import { gettingallCategory } from "../features/categorySlice";
import { fetchSettings } from "../features/settingsSlice";
import toast from "react-hot-toast";

function Productpage() {
  const { getallproduct, editedProduct, isproductadd, searchdata } = useSelector(
    (state) => state.product
  );
  const { getallCategory } = useSelector((state) => state.category);
  const { Authuser } = useSelector((state) => state.auth);
  const { data: settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();

  const isAdmin = Authuser?.role === 'ADMIN';

  const [query, setquery] = useState("");
  // Form States
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("");
  const [selling_price, setSellingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [reorderLevel, setReorderLevel] = useState("0");
  const [status, setStatus] = useState("Active");
  const [image, setImage] = useState("");

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [productHistory, setProductHistory] = useState([]);

  useEffect(() => {
    dispatch(gettingallproducts());
    dispatch(gettingallCategory());
    dispatch(fetchSettings());
  }, [dispatch, editedProduct, isproductadd]);

  useEffect(() => {
    if (query.trim() !== "") {
      const repeatTimeout = setTimeout(() => {
        dispatch(Searchproduct(query));
      }, 500);
      return () => clearTimeout(repeatTimeout);
    }
  }, [query, dispatch]);

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
      selling_price: Number(selling_price),
      description,
      reorderLevel: Number(reorderLevel),
      status,
      image
    };

    dispatch(EditProduct({ id: selectedProduct._id, updatedData }))
      .unwrap()
      .then(() => {
        toast.success("Product updated successfully");
        setIsFormVisible(false);
        setSelectedProduct(null);
        resetForm();
      })
      .catch((err) => toast.error(err?.message || "Failed to update product"));
  };

  const submitProduct = async (event) => {
    event.preventDefault();

    if (!category) {
      toast.error("Please select a category");
      return;
    }

    if (!selling_price || Number(selling_price) <= 0) {
      toast.error("Selling Price must be greater than 0");
      return;
    }

    const productData = {
      name,
      description,
      category,
      selling_price: Number(selling_price),
      reorderLevel: Number(reorderLevel),
      status,
      image
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
    setSellingPrice("");
    setDescription("");
    setReorderLevel("0");
    setStatus("Active");
    setImage("");
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setName(product.name);
    setSku(product.sku);
    setCategory(product.category?._id || "");
    setSellingPrice(product.selling_price || "");
    setDescription(product.description || "");
    setReorderLevel(product.reorderLevel || "0");
    setStatus(product.status || "Active");
    setImage(""); 
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
      // Silent fail
    }
  };

  const displayProducts = (query.trim() !== "" ? searchdata : getallproduct);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-neutral-50 min-h-screen text-gray-900 font-sans">

      <div className="px-8 pb-8 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setquery(e.target.value)}
            className="w-full md:w-96 h-12 pl-4 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Search products by Name or SKU..."
          />
          {isAdmin && (
            <button
              onClick={() => {
                setIsFormVisible(true);
                setSelectedProduct(null);
                resetForm();
              }}
              className="px-6 py-3 bg-primary hover:bg-transp_primary text-white rounded-lg flex items-center shadow-md transition font-semibold"
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

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="input-field" required />
                </div>
              </div>

              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Auto-Generated)</label>
                  <input value={sku} disabled type="text" className="input-field bg-gray-100 cursor-not-allowed" />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field" required>
                    <option value="">Select Category</option>
                    {getallCategory?.filter(cat => cat.status === 'Active').map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <input
                    type="number"
                    value={selling_price}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="input-field"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Set customer facing price"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Cost price is system-managed via Purchases</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level *</label>
                  <input type="number" value={reorderLevel} onChange={(e) => setReorderLevel(e.target.value)} className="input-field" required min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field" required>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field h-32" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  onChange={handleImageUpload} 
                  className="input-field cursor-pointer p-2 bg-white" 
                />
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">Max size 5MB (JPG, PNG)</p>
              </div>

              <button type="submit" className="w-full btn-primary py-3 rounded-lg font-bold shadow-lg transform transition hover:-translate-y-1">
                {selectedProduct ? "Update Product" : "Create Product"}
              </button>
            </form>
          </div >
        )
        }

        {/* Product Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">Image</th>
                  <th className="px-6 py-4">Product / SKU</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Total Stock</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Purchase Price</th>
                  <th className="px-6 py-4 text-right">Selling Price</th>
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
                      <td className="px-6 py-4 text-center h-full">
                        <div className="flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt="thumbnail" className="w-10 h-10 rounded-md shadow-sm object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-md shadow-sm border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-300">
                              <MdImage className="text-xl" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-xs text-primary font-mono">{product.sku}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-200 text-gray-700 py-1 px-2 rounded text-xs">
                          {product.category?.name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${(product.total_stock || 0) <= (product.reorderLevel || 0)
                          ? "bg-red-100 text-red-600"
                          : "bg-green-100 text-green-600"
                          }`}>
                          {product.total_stock ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 text-[10px] rounded-full uppercase font-bold ${product.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                          {product.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-gray-600 text-sm italic">
                        {settings?.currency_symbol || 'Rs.'} {product.current_cost_price || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        {settings?.currency_symbol || 'Rs.'} {product.selling_price || 0}
                      </td>
                      <td className="px-6 py-4 text-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        {isAdmin && (
                          <>
                            <button onClick={() => handleEditClick(product)} className="text-blue-600 hover:text-blue-800 transition text-sm font-medium">Edit</button>
                            <button onClick={() => handleremove(product._id)} className="text-red-600 hover:text-red-800 transition text-sm font-medium ml-2">Delete</button>
                          </>
                        )}
                        {!isAdmin && <span className="text-xs text-gray-400">View Only</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-gray-400 italic">
                      No products found. Start adding some!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div >

      {/* Product Detail Modal */}
      {
        isDetailVisible && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
                <button onClick={() => setIsDetailVisible(false)} className="text-gray-500 hover:text-gray-700 text-3xl">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-8">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-2xl font-black text-gray-900">{selectedProduct.name}</h3>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-mono font-bold">{selectedProduct.sku}</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                      <p className="text-xs text-gray-400 uppercase font-black mb-1">Description</p>
                      <p className="text-gray-700 leading-relaxed text-sm">{selectedProduct.description}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 text-sm">Category</span>
                        <span className="font-bold">{selectedProduct.category?.name || "Uncategorized"}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500 text-sm">Status</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${selectedProduct.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{selectedProduct.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 h-fit shadow-inner">
                    <h4 className="font-black text-blue-800 mb-6 flex items-center uppercase text-xs tracking-widest">
                      Financial & Stock Summary
                    </h4>
                    <div className="space-y-5">
                      <div className="flex justify-between items-end border-b border-blue-200 pb-3">
                        <span className="text-gray-600 text-sm">Total Inventory Stock</span>
                        <span className="text-4xl font-black text-blue-700">{selectedProduct.total_stock ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weighted Avg Cost</span>
                        <span className="font-bold text-gray-900">{settings?.currency_symbol || 'Rs.'} {selectedProduct.current_cost_price || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Selling Price</span>
                        <span className="font-bold text-gray-900">{settings?.currency_symbol || 'Rs.'} {selectedProduct.selling_price || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-blue-100">
                        <span className="text-gray-600 italic">Profit Margin (Projected)</span>
                        <span className="font-bold text-green-600">{settings?.currency_symbol || 'Rs.'} {(selectedProduct.selling_price - selectedProduct.current_cost_price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reorder Alert Level</span>
                        <span className="font-bold text-red-600">{selectedProduct.reorderLevel || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-black text-gray-800 mb-4 border-b pb-2 text-sm uppercase tracking-widest">Recent Stock Movements</h4>
                  <div className="bg-white border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black">
                        <tr>
                          <th className="px-4 py-4">Date</th>
                          <th className="px-4 py-4">Type</th>
                          <th className="px-4 py-4">Qty</th>
                          <th className="px-4 py-4">Performed By</th>
                          <th className="px-4 py-4">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {productHistory.length > 0 ? productHistory.map((log, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3 text-gray-500 tabular-nums">{new Date(log.createdAt).toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${log.type === 'IN' ? 'bg-green-100 text-green-700' : log.type === 'OUT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {log.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-bold">{log.quantity}</td>
                            <td className="px-4 py-3 font-medium">{log.performedBy?.name || "System"}</td>
                            <td className="px-4 py-3 text-gray-400 italic text-xs">{log.reason || "N/A"}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="text-center py-10 text-gray-400 italic">No movement record found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t flex justify-end">
                <button onClick={() => setIsDetailVisible(false)} className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition font-bold shadow-lg">Close Details</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}

export default Productpage;
