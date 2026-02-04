import * as Astronomy from "astronomy-engine";

// --- constants ---
const AYANAMSA_EPOCH = 2451545.0; // J2000
const LAHIRI_AT_EPOCH = 23.85708; // Lahiri Ayanamsa at J2000
const PRECESSION_RATE = 50.29 / 3600; // degrees per year

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

// --- helpers ---

function normalize(deg) {
  let d = deg % 360;
  if (d < 0) d += 360;
  return d;
}

function calculateAyanamsa(jd) {
  const daysSince2000 = jd - AYANAMSA_EPOCH;
  const years = daysSince2000 / 365.25;
  return LAHIRI_AT_EPOCH + (years * PRECESSION_RATE);
}

export function formatDMS(degrees) {
  const d = Math.floor(degrees);
  const m = Math.floor((degrees - d) * 60);
  return `${d}° ${m}'`;
}

function getSign(longitude) {
  return Math.floor(normalize(longitude) / 30) + 1; // 1-12
}

function getNakshatra(longitude) {
  const idx = Math.floor(normalize(longitude) / (360 / 27));
  return NAKSHATRAS[idx];
}

function getNari(nakshatra) {
  const idx = NAKSHATRAS.indexOf(nakshatra);
  if (idx === -1) return "Unknown";
  const rem = idx % 6;
  if (rem === 0 || rem === 5) return "Aadi (Vata)";
  if (rem === 1 || rem === 4) return "Madhya (Pitta)";
  return "Antya (Kapha)";
}

function getNavamsa(longitude) {
  // D9 Logic
  const sign = Math.floor(longitude / 30);
  const signPadas = Math.floor((longitude % 30) / 3.333333);

  let startSignIndex;
  // Fire (Ar, Le, Sg) -> Aries
  if ([0, 4, 8].includes(sign)) startSignIndex = 0;
  // Earth (Ta, Vi, Cp) -> Capricorn
  else if ([1, 5, 9].includes(sign)) startSignIndex = 9;
  // Air (Ge, Li, Aq) -> Libra
  else if ([2, 6, 10].includes(sign)) startSignIndex = 6;
  // Water (Cn, Sc, Pi) -> Cancer
  else startSignIndex = 3;

  const d9SignIndex = (startSignIndex + signPadas) % 12;
  return d9SignIndex + 1;
}

function getVargaSign(longitude, division) {
  const sign = Math.floor(longitude / 30);
  const deg = longitude % 30;
  const part = Math.floor(deg / (30 / division)); // 0 to division-1

  let vargaSign = 0;

  if (division === 1) return sign + 1;
  if (division === 9) return getNavamsa(longitude);

  // D4 (Chaturthamsha)
  if (division === 4) {
    vargaSign = (sign + (part * 3)) % 12;
  }
  // D6 (Shashthamsha) - Parashara
  else if (division === 6) {
    // Odd: Aries (0), Even: Libra (6)
    const start = (sign % 2 === 0) ? 0 : 6;
    vargaSign = (start + part) % 12;
  }
  // D7 (Saptamsha)
  else if (division === 7) {
    // Odd: Sign, Even: Sign + 6
    const start = (sign % 2 === 0) ? sign : (sign + 6) % 12;
    vargaSign = (start + part) % 12;
  }
  // D10 (Dasamsa)
  else if (division === 10) {
    // Odd: Sign, Even: Sign + 8
    const start = (sign % 2 === 0) ? sign : (sign + 8) % 12;
    vargaSign = (start + part) % 12;
  }
  // D60 (Shashtiamsha)
  else if (division === 60) {
    vargaSign = (sign + part) % 12;
  }
  else {
    vargaSign = (sign + part) % 12; // Fallback
  }

  return vargaSign + 1;
}

function checkManglik(lagnaSign, marsSign, moonSign) {
  // Manglik Houses: 1, 2, 4, 7, 8, 12 (Indices: 0, 1, 3, 6, 7, 11)
  const badHouses = [0, 1, 3, 6, 7, 11];
  const marsHouseL = (marsSign - lagnaSign + 12) % 12;
  const marsHouseM = (marsSign - moonSign + 12) % 12;
  const fromLagna = badHouses.includes(marsHouseL);
  const fromMoon = badHouses.includes(marsHouseM);
  return { isManglik: fromLagna || fromMoon, fromLagna, fromMoon };
}

function checkSadeSati(moonSign, saturnSign) {
  // Sade Sati: Saturn in 12, 1, 2 from Moon
  const diff = (saturnSign - moonSign + 12) % 12;
  if (diff === 11) return { status: true, phase: "Rising (1st Phase)" };
  if (diff === 0) return { status: true, phase: "Peak (2nd Phase)" };
  if (diff === 1) return { status: true, phase: "Setting (3rd Phase)" };
  return { status: false, phase: "None" };
}

function getGeoEcliptic(body, time, observer, obliquity) {
  const eq = Astronomy.Equator(body, time, observer, false, true);
  const ra = eq.ra * Math.PI / 12; // hours to radians
  const dec = eq.dec * Math.PI / 180;
  const eps = obliquity * Math.PI / 180;
  const sinLon = Math.sin(ra) * Math.cos(eps) + Math.tan(dec) * Math.sin(eps);
  const cosLon = Math.cos(ra);
  let lon = Math.atan2(sinLon, cosLon);
  if (lon < 0) lon += 2 * Math.PI;
  return lon * 180 / Math.PI;
}

// --- Main Calculation ---

export function calculateChartData(date, location) {
  const { lat, lon } = location;
  const observer = new Astronomy.Observer(lat, lon, 0);
  const time = Astronomy.MakeTime(date);
  const jd = time.ut;
  const ayanamsa = calculateAyanamsa(jd);
  const obliquity = Astronomy.e_tilt(time).tobl;

  // 1. Calculate Ascendant (Lagna)
  const mst = Astronomy.SiderealTime(time);
  const armc = (mst * 15 + lon) % 360;
  const eps = obliquity * Math.PI / 180;
  const theta = armc * Math.PI / 180;
  const phi = lat * Math.PI / 180;

  // Simple ascendant calc: atan2(cos(RAMC), -sin(RAMC)*cos(eps) - tan(lat)*sin(eps))
  const num = Math.cos(theta);
  const den = -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
  let asc = Math.atan2(num, den) * 180 / Math.PI;
  asc = normalize(asc); // Tropical Ascendant
  const lagnaSidereal = normalize(asc - ayanamsa);

  // 2. Calculate Planets
  const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
  // Rahu/Ketu approx mean node
  const daysSince2000 = jd - 2451545.0;
  const rahuMeanTrop = normalize(125.04452 - 0.0529538083 * daysSince2000);
  const rahuSid = normalize(rahuMeanTrop - ayanamsa);
  const ketuSid = normalize(rahuSid + 180);

  const planets = [];

  // Sun Position for Combustion
  const sunTrop = getGeoEcliptic("Sun", time, observer, obliquity);
  const sunSid = normalize(sunTrop - ayanamsa);

  bodies.forEach(name => {
    let sidLon = 0;
    let isRetro = false;

    if (name === "Rahu") sidLon = rahuSid;
    else if (name === "Ketu") sidLon = ketuSid;
    else {
      // 1. Get Tropical Longitude
      const t1Lon = getGeoEcliptic(name, time, observer, obliquity);
      sidLon = normalize(t1Lon - ayanamsa);

      // 2. Retrograde check (Compare with 1 hour ago)
      if (name !== "Sun" && name !== "Moon") {
        const d2 = new Date(date.getTime() - 3600 * 1000);
        const time2 = Astronomy.MakeTime(d2);
        const t0Lon = getGeoEcliptic(name, time2, observer, obliquity);

        // If current (t1) < previous (t0), it's Retrograde.
        // Account for wrapping 359 -> 0 (Forward), 0 -> 359 (Retro)
        let diff = t1Lon - t0Lon;
        // Wrap diff
        if (diff < -300) diff += 360;
        if (diff > 300) diff -= 360;

        if (diff < 0) isRetro = true;
      }
    }

    // States
    // Exaltation/Debilitation (Simplified orb check)
    // Combustion check (vs Sun)
    let isCombust = false;
    if (name !== "Sun" && name !== "Rahu" && name !== "Ketu") {
      let dist = Math.abs(normalize(sidLon - sunSid));
      if (dist > 180) dist = 360 - dist;
      // Simple orb map
      const orb = { Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15 }[name] || 0;
      if (dist < orb) isCombust = true;
    }

    // Hardcoded exaltation points check? Keep simple for now.

    planets.push({
      name,
      longitude: sidLon,
      sign: getSign(sidLon),
      degree: sidLon % 30,
      nakshatra: getNakshatra(sidLon),
      isRetro,
      isCombust,
      isExalted: false // Implement exact points later if needed
    });
  });

  // 3. Varga Charts
  const calcVarga = (div) => ({
    planets: planets.map(p => ({
      ...p,
      sign: getVargaSign(p.longitude, div),
      isExalted: false, isDebilitated: false, isCombust: false
    })),
    lagna: {
      sign: getVargaSign(lagnaSidereal, div),
      degree: (lagnaSidereal % (30 / div)) * div
    }
  });

  const d9Planets = planets.map(p => ({
    ...p,
    sign: getNavamsa(p.longitude),
    isExalted: false, isDebilitated: false, isCombust: false
  }));

  const d4 = calcVarga(4);
  const d6 = calcVarga(6);
  const d7 = calcVarga(7);
  const d10 = calcVarga(10);
  const d60 = calcVarga(60);

  // Chandra Lagna
  const moonPlanet = planets.find(p => p.name === "Moon");
  const chandraLagnaSign = moonPlanet ? moonPlanet.sign : 1;
  const chandra = {
    planets: planets,
    lagna: { sign: chandraLagnaSign, degree: 15 } // Degree matches moon?
  };

  // Analysis
  const mars = planets.find(p => p.name === "Mars");
  const saturn = planets.find(p => p.name === "Saturn");
  const manglik = checkManglik(getSign(lagnaSidereal), mars ? mars.sign : 0, chandraLagnaSign);
  const sadeSati = checkSadeSati(chandraLagnaSign, saturn ? saturn.sign : 0);

  const lagnaNakshatra = getNakshatra(lagnaSidereal);
  const moonNakshatra = moonPlanet ? getNakshatra(moonPlanet.longitude) : "Unknown";

  return {
    ayanamsa,
    d1: {
      planets: planets,
      lagna: {
        sign: getSign(lagnaSidereal),
        degree: lagnaSidereal % 30,
        nakshatra: lagnaNakshatra,
        nari: getNari(lagnaNakshatra)
      }
    },
    d9: {
      planets: d9Planets,
      lagna: {
        sign: getNavamsa(lagnaSidereal),
        degree: (lagnaSidereal % 3.33333) * 9
      }
    },
    d4, d6, d7, d10, d60, chandra,
    analysis: {
      manglik,
      sadeSati,
      nakshatra: {
        lagna: lagnaNakshatra,
        moon: moonNakshatra,
        nari: getNari(moonNakshatra)
      }
    }
  };
}
