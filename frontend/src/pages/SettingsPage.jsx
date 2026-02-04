import React, { useState, useEffect } from "react";
import TopNavbar from "../Components/TopNavbar";
import { Settings, Save } from "lucide-react";
import toast from "react-hot-toast";

function SettingsPage() {
    const [settings, setSettings] = useState({
        storeName: "My Inventory Store",
        currency: "NPR",
        vatPercentage: "13",
        invoicePrefix: "INV-"
    });

    useEffect(() => {
        // Load from local storage for now (Simulating backend settings)
        const saved = localStorage.getItem("appSettings");
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem("appSettings", JSON.stringify(settings));
        toast.success("Settings saved successfully!");
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <TopNavbar />
            <div className="p-8 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                    <Settings className="mr-3 text-gray-700" /> General Settings
                </h1>

                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Store Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Name</label>
                            <input
                                type="text"
                                name="storeName"
                                value={settings.storeName}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Appears on invoices and dashboard.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Currency Symbol</label>
                                <select
                                    name="currency"
                                    value={settings.currency}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
                                >
                                    <option value="NPR">NPR (Rs.)</option>
                                </select>
                            </div>

                            {/* VAT */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">VAT / Tax Percentage (%)</label>
                                <input
                                    type="number"
                                    name="vatPercentage"
                                    value={settings.vatPercentage}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>

                        {/* Invoice Prefix */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Prefix</label>
                            <input
                                type="text"
                                name="invoicePrefix"
                                value={settings.invoicePrefix}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. INV-"
                            />
                            <p className="text-xs text-gray-500 mt-1">Used for generating invoice numbers (e.g., INV-001).</p>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-md transition duration-200 flex items-center"
                            >
                                <Save className="w-5 h-5 mr-2" /> Save Configuration
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
