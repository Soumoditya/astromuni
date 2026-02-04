"use client";

import { motion } from "framer-motion";
import React, { useMemo } from "react";

const HOUSES_POLY = [
    "50,50 25,25 50,0 75,25",    // H1 (Top Diamond)
    "50,0 25,25 0,0",            // H2 (Top Left Top)
    "0,0 25,25 0,50",            // H3 (Top Left Side)
    "50,50 25,25 0,50 25,75",    // H4 (Left Diamond)
    "0,50 25,75 0,100",          // H5 (Bottom Left Side)
    "0,100 25,75 50,100",        // H6 (Bottom Left Bottom)
    "50,50 25,75 50,100 75,75",  // H7 (Bottom Diamond)
    "50,100 75,75 100,100",      // H8 (Bottom Right Bottom)
    "100,100 75,75 100,50",      // H9 (Bottom Right Side)
    "50,50 75,75 100,50 75,25",  // H10 (Right Diamond)
    "100,50 75,25 100,0",        // H11 (Top Right Side) // Corrected: 100,0 is corner
    "100,0 75,25 50,0"           // H12 (Top Right Top)
];

const SIGN_NAMES = [
    "Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"
];

// Planet Symbols
const PLANET_SYMBOLS = {
    Sun: "Su", Moon: "Mo", Mercury: "Me", Venus: "Ve", Mars: "Ma",
    Jupiter: "Ju", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
    Uranus: "Ur", Neptune: "Ne", Pluto: "Pl"
};

export default function DiamondChart({ title, planets = [], lagnaSign = 1 }) {
    // Map planets to houses
    const housePlanets = useMemo(() => {
        const map = Array(12).fill(null).map(() => []);
        planets.forEach(p => {
            // 1-based sign index
            const signIndex = p.sign;
            // House index (0-11) relative to Lagna
            // If Lagna 1, Sign 1 is H1 (Index 0).
            // If Lagna 2, Sign 2 is H1 (Index 0).
            // Sign 1 is H12 (Index 11).
            const houseIdx = (signIndex - lagnaSign + 12) % 12;
            map[houseIdx].push(p);
        });
        return map;
    }, [planets, lagnaSign]);

    // House Signs (The number shown in the house)
    // H1 shows Lagna Sign. H2 shows Lagna+1.
    const houseSigns = Array(12).fill(0).map((_, i) => ((lagnaSign + i - 1) % 12) + 1);

    // Animation variants
    const draw = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: (i) => ({
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: i * 0.05, type: "spring", duration: 1.5, bounce: 0 },
                opacity: { delay: i * 0.05, duration: 0.01 }
            }
        })
    };

    const centerPoints = [
        { x: 50, y: 25 }, // H1
        { x: 25, y: 8 },  // H2
        { x: 6, y: 25 },  // H3
        { x: 25, y: 50 }, // H4
        { x: 6, y: 75 },  // H5
        { x: 25, y: 92 }, // H6
        { x: 50, y: 75 }, // H7
        { x: 75, y: 92 }, // H8
        { x: 94, y: 75 }, // H9
        { x: 75, y: 50 }, // H10
        { x: 94, y: 25 }, // H11
        { x: 75, y: 8 }   // H12
    ];

    return (
        <div className="flex flex-col items-center bg-white/50 backdrop-blur-md p-4 rounded-xl shadow-lg border border-amber-200 w-full max-w-md mx-auto relative overflow-hidden">
            <h3 className="text-xl font-serif text-amber-900 mb-2">{title}</h3>
            <motion.svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-xl"
                initial="hidden"
                animate="visible"
            >
                {/* Background & Lines */}
                {HOUSES_POLY.map((d, i) => (
                    <motion.polygon
                        key={i}
                        points={d}
                        fill="transparent"
                        stroke="#D4AF37"
                        strokeWidth="0.5"
                        variants={draw}
                        custom={i}
                        whileHover={{ fill: "rgba(212, 175, 55, 0.1)", cursor: "pointer" }}
                    />
                ))}

                {/* Outer Border */}
                <motion.rect
                    x="0.5" y="0.5" width="99" height="99"
                    fill="none" stroke="#D4AF37" strokeWidth="1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 2 } }}
                />

                {/* Content */}
                {houseSigns.map((sign, i) => {
                    const cp = centerPoints[i];
                    const hasPlanets = housePlanets[i].length > 0;

                    return (
                        <g key={i}>
                            {/* Sign Number */}
                            <text
                                x={cp.x}
                                y={cp.y - (hasPlanets ? 5 : 0)}
                                fontSize="4" // Slightly smaller
                                fill="#8D6E63" // Brownish
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                className="font-bold opacity-60"
                            >
                                {sign}
                            </text>

                            {/* Planets */}
                            {housePlanets[i].map((p, idx) => (
                                <text
                                    key={idx}
                                    x={cp.x}
                                    y={cp.y + (idx * 5) + (hasPlanets ? 0 : 0)} // Stack vertically
                                    fontSize="4.5"
                                    fontWeight="bold"
                                    fill={p.state === "Retro" ? "#B71C1C" : "#1A237E"}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {PLANET_SYMBOLS[p.name]}
                                    {p.isRetro ? "*" : ""}
                                    {p.isExalted ? "↑" : ""}
                                    {p.isCombust ? "Λ" : ""}
                                    <title>{p.name}: {p.degree?.toFixed(2)}°</title>
                                </text>
                            ))}
                        </g>
                    );
                })}
            </motion.svg>
        </div>
    );
}
