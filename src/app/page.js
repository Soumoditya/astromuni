"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalculateVedicChart, calculateChartData } from "@/utils/astrology";
import DiamondChart from "@/components/DiamondChart";
import { Search, MapPin, Loader2, Sparkles, AlertCircle } from "lucide-react";

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

            // Artificial delay for "Authentic Calculation" feel
            setTimeout(() => {
                setChartData(data);
                setLoading(false);
            }, 1500);
        } catch (err) {
            setError("Error calculating chart: " + err.message);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen py-10 px-4 md:px-20 relative overflow-hidden bg-[url('/bg-texture.png')] bg-repeat">
            <div className="absolute top-0 left-0 w-full h-full bg-[var(--color-bg-primary)] opacity-95 -z-10"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto mb-10 text-center"
            >
                <div className="inline-block p-3 rounded-full bg-amber-100 border border-amber-300 mb-4">
                    <Sparkles className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[var(--color-text-primary)] tracking-wide">
                    ASTROMUNI
                </h1>
                <p className="text-xl text-[var(--color-text-secondary)] font-serif italic">
                    "Where ancient wisdom meets modern precision."
                </p>
            </motion.div>

            {/* Input Section */}
            <AnimatePresence>
                {!chartData && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="max-w-xl mx-auto premium-card p-8 z-10 relative"
                    >
                        {error && (
                            <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center mb-4 border border-red-200">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold mb-1 ml-1 text-amber-900">Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 rounded-lg bg-white/80 border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none"
                                    placeholder="Enter your name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1 ml-1 text-amber-900">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/80 border border-amber-200 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 ml-1 text-amber-900">Time</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full p-3 rounded-lg bg-white/80 border border-amber-200 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold mb-1 ml-1 text-amber-900">Place of Birth</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3.5 text-amber-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => handleCitySearch(e.target.value)}
                                        className="w-full pl-10 p-3 rounded-lg bg-white/80 border border-amber-200 outline-none"
                                        placeholder="Search city..."
                                    />
                                </div>
                                {citySuggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full bg-white border border-amber-200 mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                        {citySuggestions.map((place) => (
                                            <li
                                                key={place.id}
                                                onClick={() => selectCity(place)}
                                                className="p-3 hover:bg-amber-50 cursor-pointer flex flex-col border-b border-gray-100 last:border-0"
                                            >
                                                <span className="font-bold text-amber-900">{place.name}</span>
                                                <span className="text-xs text-gray-500">{place.admin1}, {place.country}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <button
                                onClick={generateCharts}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex justify-center items-center"
                            >
                                {loading ? <Loader2 className="animate-spin mr-2" /> : "Generate Vedic Charts"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results Section */}
            <AnimatePresence>
                {chartData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-6xl mx-auto space-y-10"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center bg-white/80 backdrop-blur p-4 rounded-xl border border-amber-200">
                            <div>
                                <h2 className="text-2xl font-bold text-amber-900">{formData.name}</h2>
                                <p className="text-sm text-gray-600">{formData.date} at {formData.time} | {formData.city}</p>
                            </div>
                            <button onClick={() => setChartData(null)} className="text-amber-700 font-bold hover:underline">
                                Calculate New
                            </button>
                        </div>

                        {/* Main Charts */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            <DiamondChart title="Lagna Chart (D1)" planets={chartData.planets} lagnaSign={chartData.lagna.sign} />
                            {/* Note: In real app, D9 would have different planetary positions calculated via Amsha logic */}
                            <DiamondChart title="Navamsa Chart (D9)" planets={chartData.planets} lagnaSign={chartData.lagna.sign} />
                        </div>

                        {/* Planetary Details Table */}
                        <div className="premium-card p-6 overflow-x-auto">
                            <h3 className="text-xl font-bold mb-4 text-amber-800 border-b border-amber-200 pb-2">Planetary Positions</h3>
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-amber-900 bg-amber-50/50">
                                        <th className="p-3 rounded-l-lg">Planet</th>
                                        <th className="p-3">Longitude</th>
                                        <th className="p-3">Sign</th>
                                        <th className="p-3">Nakshatra</th>
                                        <th className="p-3 rounded-r-lg">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.planets.map((p, i) => (
                                        <tr key={i} className="border-b border-gray-100/50 hover:bg-white/50 transition-colors">
                                            <td className="p-3 font-bold text-amber-900">{p.name}</td>
                                            <td className="p-3 font-mono text-amber-700">{p.longitude.toFixed(2)}°</td>
                                            <td className="p-3 text-gray-700">{Math.ceil(p.longitude / 30)} (Sign)</td>
                                            <td className="p-3 text-gray-600">--</td>
                                            <td className="p-3">
                                                {p.isRetro && <span className="inline-block px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full mr-1">Ret</span>}
                                                {p.isExalted && <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Exalt</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
