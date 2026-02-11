import React, { useState, useEffect } from 'react'
import { IoMdAdd } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { gettingallCategory, CreateCategory, RemoveCategory, SearchCategory, UpdateCategory } from "../features/categorySlice";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, Trash2, Edit, Tag, Package, X } from "lucide-react";

function Categorypage() {
  const { Authuser } = useSelector((state) => state.auth);
  const { getallCategory, searchdata } = useSelector((state) => state.category);
  const dispatch = useDispatch();

  const [query, setquery] = useState("");
  const [name, setname] = useState("");
  const [description, setdescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const isAdmin = Authuser?.role?.toUpperCase() === 'ADMIN';

  useEffect(() => {
    dispatch(gettingallCategory());
  }, [dispatch]);

  useEffect(() => {
    if (query.trim() !== "") {
      const repeatTimeout = setTimeout(() => {
        dispatch(SearchCategory(query));
      }, 500);
      return () => clearTimeout(repeatTimeout);
    } else {
      dispatch(gettingallCategory());
    }
  }, [query, dispatch]);

  const handleremove = async (categoryId) => {
    if (!isAdmin) {
      toast.error("Only Admin can delete categories");
      return;
    }
    if (window.confirm("Permanent deletion is only for categories without products. Proceed?")) {
      dispatch(RemoveCategory(categoryId))
        .unwrap()
        .then(() => toast.success("Category removed successfully"))
        .catch((error) => {
          const errorMessage = typeof error === 'string' ? error : error?.message || "Failed to remove category";
          toast.error(errorMessage);
        });
    }
  };

  const toggleStatus = async (cat) => {
    if (!isAdmin) return;
    const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    dispatch(UpdateCategory({
      categoryId: cat._id,
      updatedCategory: { status: newStatus }
    })).unwrap()
      .then(() => dispatch(gettingallCategory())); // Refresh to ensure accuracy
  };

  const submitCategory = async (event) => {
    event.preventDefault();
    const CategoryData = { name, description, status };

    if (editingId) {
      dispatch(UpdateCategory({ categoryId: editingId, updatedCategory: CategoryData }))
        .unwrap()
        .then(() => {
          resetForm();
          setIsFormVisible(false);
          dispatch(gettingallCategory());
        })
        .catch((err) => {
          const errorMessage = typeof err === 'string' ? err : err?.message || "Update failed";
          toast.error(errorMessage);
        });
    } else {
      dispatch(CreateCategory(CategoryData))
        .unwrap()
        .then(() => {
          toast.success("Category added successfully");
          resetForm();
          setIsFormVisible(false);
          dispatch(gettingallCategory());
        })
        .catch((err) => {
          const errorMessage = typeof err === 'string' ? err : err?.message || "Category add unsuccessful";
          toast.error(errorMessage);
        });
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setname(cat.name);
    setdescription(cat.description || "");
    setStatus(cat.status || "Active");
    setIsFormVisible(true);
  };

  const resetForm = () => {
    setname("");
    setdescription("");
    setStatus("Active");
    setEditingId(null);
  };

  const displayCategory = query.trim() !== "" ? searchdata : getallCategory;

  return (
    <div className='bg-neutral-50 min-h-screen font-sans text-gray-900'>

      <div className="px-8 pb-8 pt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="hidden"></div>
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setIsFormVisible(true); }}
              className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-primary/20 transition-all font-bold group"
            >
              <IoMdAdd className='text-xl group-hover:scale-110 transition-transform' />
              New Category
            </button>
          )}
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
          <div className="w-full md:flex-1">
            <input
              type='text'
              value={query}
              onChange={(e) => setquery(e.target.value)}
              placeholder='Search by category name...'
              className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-sm focus:ring-2 focus:ring-primary outline-none font-medium"
            />
          </div>
        </div>

        {isFormVisible && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsFormVisible(false)} />
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-800">{editingId ? 'Edit category' : 'Create Category'}</h3>
                <button onClick={() => setIsFormVisible(false)} className="p-3 hover:bg-gray-200 rounded-2xl transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitCategory} className="p-8 space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Category Name</label>
                  <input
                    value={name}
                    onChange={(e) => setname(e.target.value)}
                    type="text"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setdescription(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5 ml-1">Availability Status</label>
                  <select
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Save Changes' : 'Initialize Category'}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Category Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Products</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Array.isArray(displayCategory) && displayCategory.length > 0 ? (
                  displayCategory.map((cat) => (
                    <tr key={cat._id} className="hover:bg-blue-50/30 transition group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{cat.name}</p>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-[200px]">{cat.description || "No description provided."}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><Package className="w-4 h-4" /></div>
                          <span className="font-black text-gray-700">{cat.productCount || 0}</span>
                          <span className="text-[10px] font-bold text-gray-300 uppercase">Items</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button
                          onClick={() => toggleStatus(cat)}
                          disabled={!isAdmin}
                          className={`mx-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm ${cat.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100' : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100'
                            }`}
                        >
                          {cat.status === 'Active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {cat.status || 'Active'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Edit Category"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleremove(cat._id)}
                            className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-20">
                      <div className="flex flex-col items-center opacity-30">
                        <Tag className="w-16 h-16 mb-4" />
                        <p className="font-bold text-xl">No Categories Found</p>
                        <p className="text-sm">Start by adding your first product category.</p>
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
  )
}

export default Categorypage;