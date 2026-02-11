import React, { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    Save,
    Building2,
    BadgePercent,
    Box,
    ShieldCheck,
    Upload,
    Clock,
    Lock,
    AlertCircle,
    ShoppingBag
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSettings, updateSettings } from "../features/settingsSlice";
import toast from "react-hot-toast";

function SettingsPage() {
    const dispatch = useDispatch();
    const { data: savedSettings, isLoading } = useSelector((state) => state.settings);
    const [activeTab, setActiveTab] = useState("company");
    const [localSettings, setLocalSettings] = useState({});

    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    useEffect(() => {
        if (savedSettings) {
            setLocalSettings(savedSettings);
        }
    }, [savedSettings]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLocalSettings({
            ...localSettings,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleSave = (sectionKeys) => {
        const updates = {};
        sectionKeys.forEach(key => {
            updates[key] = localSettings[key];
        });
        dispatch(updateSettings(updates));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for DB storage
                toast.error("Logo must be smaller than 1MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setLocalSettings({ ...localSettings, company_logo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-6 py-4 border-b-2 font-semibold text-sm transition-all duration-200 ${activeTab === id
                ? "border-blue-600 text-blue-600 bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );

    const SectionHeader = ({ title, description, onSave, keys }) => (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            <button
                onClick={() => onSave(keys)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-sm transition-all flex items-center shrink-0"
            >
                <Save size={18} className="mr-2" />
                Save Changes
            </button>
        </div>
    );

    if (isLoading && !Object.keys(localSettings).length) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-900">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-4">

                {/* Page Title */}
                {/* Header Removed - Moved to TopNavbar */}

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[600px]">

                    {/* Tabs Sidebar */}
                    <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 flex md:flex-col overflow-x-auto md:overflow-x-visible">
                        <TabButton id="company" label="Company" icon={Building2} />
                        <TabButton id="financial" label="Financial" icon={BadgePercent} />
                        <TabButton id="inventory" label="Inventory" icon={Box} />
                        <TabButton id="security" label="Security" icon={ShieldCheck} />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 md:p-10 bg-white">

                        {/* Company Settings */}
                        {activeTab === "company" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <SectionHeader
                                    title="Company Profile"
                                    description="General information about your business used in invoices and reports."
                                    keys={["company_name", "company_email", "company_phone", "company_address", "company_pan", "timezone", "invoice_footer", "company_logo"]}
                                    onSave={handleSave}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                                            <input
                                                type="text"
                                                name="company_name"
                                                value={localSettings.company_name || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    name="company_email"
                                                    value={localSettings.company_email || ""}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                                <input
                                                    type="text"
                                                    name="company_phone"
                                                    value={localSettings.company_phone || ""}
                                                    onChange={handleChange}
                                                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">PAN / VAT Number</label>
                                            <input
                                                type="text"
                                                name="company_pan"
                                                value={localSettings.company_pan || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Timezone</label>
                                            <select
                                                name="timezone"
                                                value={localSettings.timezone || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                            >
                                                <option value="Asia/Kathmandu">Asia/Kathmandu (+5:45)</option>
                                                <option value="UTC">UTC</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Company Logo</label>
                                            <div className="mt-1 flex flex-col items-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30">
                                                {localSettings.company_logo ? (
                                                    <div className="relative group">
                                                        <img src={localSettings.company_logo} alt="Logo Preview" className="h-32 w-auto object-contain rounded-lg shadow-sm" />
                                                        <button
                                                            onClick={() => setLocalSettings({ ...localSettings, company_logo: null })}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <Upload size={14} className="rotate-180" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Building2 className="w-12 h-12 text-gray-300 mb-3" />
                                                )}
                                                <label className="mt-4 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-50 transition-colors flex items-center">
                                                    <Upload size={16} className="mr-2" />
                                                    {localSettings.company_logo ? "Change Logo" : "Upload Logo"}
                                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                </label>
                                                <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-widest font-bold">Max 1MB (PNG, JPG)</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Company Address</label>
                                            <textarea
                                                name="company_address"
                                                value={localSettings.company_address || ""}
                                                onChange={handleChange}
                                                rows="2"
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                                            ></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Invoice Footer Text</label>
                                            <textarea
                                                name="invoice_footer"
                                                value={localSettings.invoice_footer || ""}
                                                onChange={handleChange}
                                                rows="2"
                                                className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Financial Settings */}
                        {activeTab === "financial" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <SectionHeader
                                    title="Financial Rules"
                                    description="Configure default tax and discount behavior."
                                    keys={["default_tax_percentage", "default_discount_percentage", "purchase_default_tax", "purchase_default_discount"]}
                                    onSave={handleSave}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-2">
                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
                                                <BadgePercent className="mr-2 text-blue-600" size={18} />
                                                Sales Defaults
                                            </label>
                                            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 space-y-6">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">Default Sale Tax (%)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            name="default_tax_percentage"
                                                            value={localSettings.default_tax_percentage || 0}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-blue-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">Default Sale Discount (%)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            name="default_discount_percentage"
                                                            value={localSettings.default_discount_percentage || 0}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-blue-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
                                                <ShoppingBag className="mr-2 text-green-600" size={18} />
                                                Purchase Defaults
                                            </label>
                                            <div className="p-6 bg-green-50 rounded-2xl border border-green-100 space-y-6">
                                                <div>
                                                    <label className="block text-[11px] font-bold text-green-600 uppercase tracking-widest mb-2">Default Purchase Tax (%)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            name="purchase_default_tax"
                                                            value={localSettings.purchase_default_tax || 0}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-green-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">Default Purchase Discount (%)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            name="purchase_default_discount"
                                                            value={localSettings.purchase_default_discount || 0}
                                                            onChange={handleChange}
                                                            className="w-full bg-white border border-green-200 p-4 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                                                        />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-400 font-bold">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Inventory Settings */}
                        {activeTab === "inventory" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <SectionHeader
                                    title="Inventory Control"
                                    description="Manage stock behavior, reorder logic, and automation."
                                    keys={["allow_negative_stock", "default_reorder_level", "enable_low_stock_alert", "auto_stock_deduction"]}
                                    onSave={handleSave}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-2">
                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                            <AlertCircle className="mr-2 text-blue-600" size={18} />
                                            Stock Behavior
                                        </label>
                                        <div className="space-y-3">
                                            <ToggleOption
                                                icon={AlertCircle}
                                                label="Allow Negative Stock"
                                                description="Permit sales even if stock count is zero."
                                                name="allow_negative_stock"
                                                checked={localSettings.allow_negative_stock}
                                                onChange={handleChange}
                                                danger={true}
                                            />
                                            <ToggleOption
                                                icon={Box}
                                                label="Auto Stock Deduction"
                                                description="Automatically update stock counts upon sale completion."
                                                name="auto_stock_deduction"
                                                checked={localSettings.auto_stock_deduction}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                                            <AlertCircle className="mr-2 text-blue-600" size={18} />
                                            Alerts & Defaults
                                        </label>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
                                            <ToggleOption
                                                label="Dashboard Low Stock Alerts"
                                                description="Show red warnings on dashboard for items below reorder level."
                                                name="enable_low_stock_alert"
                                                checked={localSettings.enable_low_stock_alert}
                                                onChange={handleChange}
                                            />
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Default Reorder Level</label>
                                                <input
                                                    type="number"
                                                    name="default_reorder_level"
                                                    value={localSettings.default_reorder_level || 0}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === "security" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2">
                                <SectionHeader
                                    title="Security & Access"
                                    description="Control authentication policies and access level behavior."
                                    keys={["session_timeout", "min_password_length", "enable_rbac"]}
                                    onSave={handleSave}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-2">
                                    <div className="space-y-6">
                                        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-amber-800 mb-2 flex items-center">
                                                    <Clock className="mr-2" size={18} />
                                                    Session Timeout (Minutes)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="session_timeout"
                                                    value={localSettings.session_timeout || 60}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-amber-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                                                />
                                                <p className="text-[10px] text-amber-600 font-bold mt-2 uppercase">Users will be logged out after idle time.</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-amber-800 mb-2 flex items-center">
                                                    <Lock className="mr-2" size={18} />
                                                    Min Password Length
                                                </label>
                                                <input
                                                    type="number"
                                                    name="min_password_length"
                                                    value={localSettings.min_password_length || 6}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-amber-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center">
                                            <ShieldCheck className="mr-2 text-blue-600" size={18} />
                                            Advanced Access
                                        </label>
                                        <ToggleOption
                                            label="Enable RBAC Enforcement"
                                            description="Strictly lock pages based on Admin/Staff roles."
                                            name="enable_rbac"
                                            checked={localSettings.enable_rbac}
                                            onChange={handleChange}
                                        />
                                        <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-start gap-3">
                                            <Lock size={16} className="text-gray-400 mt-1" />
                                            <p className="text-xs text-gray-500 italic leading-relaxed">
                                                * Disabling RBAC is not recommended for production environments as it grants global access.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

const ToggleOption = ({ icon: Icon, label, description, name, checked, onChange, danger }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
        <div className="flex items-start space-x-3">
            {Icon && <div className={`p-2 rounded-lg ${danger ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}><Icon size={16} /></div>}
            <div>
                <p className="text-sm font-bold text-gray-800 leading-tight">{label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                name={name}
                checked={checked || false}
                onChange={onChange}
                className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${danger ? 'peer-checked:bg-red-500' : 'peer-checked:bg-blue-600'}`}></div>
        </label>
    </div>
);

export default SettingsPage;
