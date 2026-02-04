const { calculateChartData } = require("./src/utils/astrology");
const Astronomy = require("astronomy-engine");

// Mock window/local storage if needed (not needed for utils)

try {
    const date = new Date("2026-02-05T10:00:00");
    const location = { lat: 28.6139, lon: 77.2090 }; // Delhi

    console.log("Calculating chart...");
    const data = calculateChartData(date, location);

    function check(obj, path = "") {
        if (typeof obj === "number" && isNaN(obj)) {
            console.error(`Found NaN at ${path}`);
        }
        if (obj === undefined) {
            console.error(`Found undefined at ${path}`);
        }
        if (typeof obj === "object" && obj !== null) {
            Object.keys(obj).forEach(key => check(obj[key], `${path}.${key}`));
        }
    }

    check(data, "data");

    console.log("D1 Lagna Sign:", data.d1.lagna.sign);
    console.log("D1 Planet 0 Sign:", data.d1.planets[0].sign);
    console.log("D9 Lagna Sign:", data.d9.lagna.sign);
    console.log("Analyze completed.");

} catch (e) {
    console.error("Calculation crashed:", e);
}
