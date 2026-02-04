const Astronomy = require("astronomy-engine");

const date = new Date("2026-02-05T10:00:00");
const location = { lat: 28.6139, lon: 77.2090 };

console.log("--- DIANOSTICS ---");

try {
    const time = Astronomy.MakeTime(date);
    console.log("Time:", time);
    console.log("Time UT:", time ? time.ut : "N/A");

    const observer = new Astronomy.Observer(location.lat, location.lon, 0);
    console.log("Observer:", observer);

    const tilt = Astronomy.e_tilt(time);
    console.log("Tilt (Obliquity):", tilt);
    console.log("Tilt Type:", typeof tilt);

    const sunEq = Astronomy.Equator("Sun", time, observer, false, true);
    console.log("Sun Equator:", sunEq);
    if (sunEq) {
        console.log("RA:", sunEq.ra);
        console.log("Dec:", sunEq.dec);
    }

    const sidTime = Astronomy.SiderealTime(time);
    console.log("Sidereal Time:", sidTime);

} catch (e) {
    console.error("Diagnostic Error:", e);
}
