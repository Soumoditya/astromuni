"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculateVedicChart, calculateChartData } from "@/utils/astrology";
import DiamondChart from "@/components/DiamondChart";
import { Search, MapPin, Loader2, Sparkles, AlertCircle, Menu, X, Globe, Star, BookOpen } from "lucide-react";

export default function Home() {
    const [formData, setFormData] = useState({
        name: "",
        date: "",
        time: "",
        city: "",
        lat: null,
        lon: null
    });
    const [citySuggestions, setCitySuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("general"); // general, varga, details

    // Search City
    const handleCitySearch = async (query) => {
        setFormData(prev => ({ ...prev, city: query }));
        if (query.length < 3) {
            setCitySuggestions([]);
            return;
        }
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`);
            const data = await res.json();
            if (data.results) {
                setCitySuggestions(data.results);
            }
        } catch (e) {
            console.error("Geocoding error", e);
        }
    };

    const selectCity = (city) => {
        setFormData(prev => ({
            ...prev,
            city: `${city.name}, ${city.country}`,
            lat: city.latitude,
            lon: city.longitude
        }));
        setCitySuggestions([]);
    };

    const generateCharts = () => {
        if (!formData.name || !formData.date || !formData.time || !formData.lat) {
            setError("Please fill all fields and select a valid location.");
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const dateTime = new Date(`${formData.date}T${formData.time}`);
            const data = calculateChartData(dateTime, { lat: formData.lat, lon: formData.lon });
            setTimeout(() => {
                setChartData(data);
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError("Error calculating chart: " + err.message);
            setLoading(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === id ? 'bg-amber-600 text-white shadow-lg' : 'bg-white/50 text-amber-900 hover:bg-amber-100'}`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );

    return (
        <main className="min-h-screen relative overflow-hidden bg-[var(--color-bg-primary)]">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            {/* Header */}
            <header className="p-6 flex justify-center items-center relative z-10 border-b border-amber-200/50 backdrop-blur-sm">
                <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-3 mb-1">
                        <Sparkles className="text-amber-500 w-6 h-6" />
                        <h1 className="text-3xl font-bold tracking-widest text-amber-900 font-serif">ASTROMUNI</h1>
                        <Sparkles className="text-amber-500 w-6 h-6" />
                    </div>
                    <p className="text-amber-700 text-sm italic">Ancient Wisdom • Modern Precision</p>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Input Section */}
                <AnimatePresence mode="wait">
                    {!chartData ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="premium-card p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300"></div>
                                <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center">
                                    <Globe className="w-6 h-6 mr-2 text-amber-600" />
                                    Enter Birth Details
                                </h2>

                                {error && (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center mb-6 border border-red-200">
                                        <AlertCircle className="w-5 h-5 mr-2" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-amber-900 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full p-4 rounded-xl bg-amber-50/50 border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder-amber-300/50"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-amber-900 mb-2">Date (DD-MM-YYYY)</label>
                                            <input
                                                type="date"
                                                value={formData.date}
                                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-amber-50/50 border border-amber-200 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-amber-900 mb-2">Time (HH:MM)</label>
                                            <input
                                                type="time"
                                                value={formData.time}
                                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-amber-50/50 border border-amber-200 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-semibold text-amber-900 mb-2">Place of Birth</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 text-amber-400 w-5 h-5" />
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={e => handleCitySearch(e.target.value)}
                                                className="w-full pl-12 p-4 rounded-xl bg-amber-50/50 border border-amber-200 outline-none"
                                                placeholder="Start typing city name..."
                                            />
                                        </div>
                                        {citySuggestions.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-white border border-amber-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                {citySuggestions.map((place) => (
                                                    <div
                                                        key={place.id}
                                                        onClick={() => selectCity(place)}
                                                        className="p-3 hover:bg-amber-50 cursor-pointer border-b border-gray-50 last:border-0"
                                                    >
                                                        <div className="font-bold text-amber-900">{place.name}</div>
                                                        <div className="text-xs text-amber-600">{place.admin1}, {place.country}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={generateCharts}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold text-lg py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex justify-center items-center"
                                    >
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : "Reveal Your Destiny"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 backdrop-blur p-6 rounded-2xl border border-amber-200 shadow-sm">
                                <div>
                                    <h2 className="text-3xl font-bold text-amber-900 font-serif">{formData.name}</h2>
                                    <p className="text-amber-700">{formData.date} • {formData.time} • {formData.city}</p>
                                </div>
                                <div className="flex space-x-2 mt-4 md:mt-0">
                                    <button onClick={() => setChartData(null)} className="text-amber-700 font-semibold px-4 py-2 hover:bg-amber-100 rounded-lg transition-colors">
                                        New Chart
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-center space-x-4 overflow-x-auto pb-2">
                                <TabButton id="general" label="General" icon={Star} />
                                <TabButton id="varga" label="Vargas" icon={Globe} />
                                <TabButton id="details" label="Analysis" icon={BookOpen} />
                            </div>

                            <div className="min-h-[600px]">
                                {activeTab === "general" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                                    >
                                        <DiamondChart title="Lagna (D1)" planets={chartData.d1.planets} lagnaSign={chartData.d1.lagna.sign} />
                                        <DiamondChart title="Navamsa (D9)" planets={chartData.d9.planets} lagnaSign={chartData.d9.lagna.sign} />

                                        <div className="lg:col-span-2 premium-card p-6 overflow-x-auto">
                                            <h3 className="text-xl font-bold mb-4 text-amber-800">Planetary Details</h3>
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="text-amber-900 bg-amber-50">
                                                        <th className="p-4 rounded-l-lg">Planet</th>
                                                        <th className="p-4">Degree</th>
                                                        <th className="p-4">Rasi</th>
                                                        <th className="p-4">Nakshatra</th>
                                                        <th className="p-4 rounded-r-lg">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chartData.d1.planets.map((p, i) => (
                                                        <tr key={i} className="border-b border-amber-100 hover:bg-white/50">
                                                            <td className="p-4 font-bold text-amber-900">{p.name}</td>
                                                            <td className="p-4 font-mono text-amber-700">{Math.floor(p.degree)}° {(p.degree % 1 * 60).toFixed(0)}'</td>
                                                            <td className="p-4 text-gray-700">{["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"][p.sign - 1]}</td>
                                                            <td className="p-4 text-gray-600">{p.nakshatra}</td>
                                                            <td className="p-4">
                                                                {p.isRetro && <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full mr-1">Retro</span>}
                                                                {p.isExalted && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mr-1">Exalted</span>}
                                                                {p.isCombust && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Combust</span>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "varga" && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        <DiamondChart title="Chandra (Moon)" planets={chartData.chandra.planets} lagnaSign={chartData.chandra.lagna.sign} />
                                        <DiamondChart title="Chaturthamsha (D4)" planets={chartData.d4.planets} lagnaSign={chartData.d4.lagna.sign} />
                                        <DiamondChart title="Shashthamsha (D6)" planets={chartData.d6.planets} lagnaSign={chartData.d6.lagna.sign} />
                                        <DiamondChart title="Saptamsha (D7)" planets={chartData.d7.planets} lagnaSign={chartData.d7.lagna.sign} />
                                        <DiamondChart title="Dasamsa (D10)" planets={chartData.d10.planets} lagnaSign={chartData.d10.lagna.sign} />
                                        <DiamondChart title="Shashtiamsha (D60)" planets={chartData.d60.planets} lagnaSign={chartData.d60.lagna.sign} />
                                    </motion.div>
                                )}

                                {activeTab === "details" && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className={`p-6 rounded-2xl border-2 ${chartData.analysis.manglik.isManglik ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                            <h3 className="text-2xl font-bold mb-2">Manglik Dosha</h3>
                                            <div className="text-4xl mb-4">{chartData.analysis.manglik.isManglik ? "⚠️ Present" : "✅ Absent"}</div>
                                            <p className="opacity-80">
                                                {chartData.analysis.manglik.isManglik
                                                    ? "Mars is positioned in a manner that creates Manglik Dosha. Consult an astrologer for remedies."
                                                    : "Mars position is favorable. No Manglik Dosha detected."}
                                            </p>
                                        </div>

                                        <div className={`p-6 rounded-2xl border-2 ${chartData.analysis.sadeSati.status ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                                            <h3 className="text-2xl font-bold mb-2">Sade Sati</h3>
                                            <div className="text-4xl mb-4">{chartData.analysis.sadeSati.status ? "⚠️ Active" : "✅ Inactive"}</div>
                                            <p className="opacity-80">
                                                {chartData.analysis.sadeSati.status
                                                    ? `You are currently in the ${chartData.analysis.sadeSati.phase} of Sade Sati.`
                                                    : "Saturn's transit is currently favorable relative to your Moon sign."}
                                            </p>
                                        </div>

                                        <div className="col-span-1 md:col-span-2 premium-card p-6">
                                            <h3 className="text-xl font-bold mb-4 text-amber-900 border-b pb-2">Panchang & Details</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <div className="text-xs text-amber-600 uppercase tracking-widest">Lagna Nakshatra</div>
                                                    <div className="text-xl font-bold text-amber-900">{chartData.d1.lagna.nakshatra}</div>
                                                    <div className="text-sm text-amber-700/70">{chartData.d1.lagna.nari}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-amber-600 uppercase tracking-widest">Moon Nakshatra</div>
                                                    <div className="text-xl font-bold text-amber-900">{chartData.analysis.nakshatra.moon}</div>
                                                    <div className="text-sm text-amber-700/70">{chartData.analysis.nakshatra.nari}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-amber-600 uppercase tracking-widest">Ayanamsa</div>
                                                    <div className="text-xl font-bold text-amber-900">Lahiri</div>
                                                    <div className="text-sm text-amber-700/70">True Chitrapaksha</div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
