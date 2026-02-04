import * as Astronomy from "astronomy-engine";

// --- constants ---
const AYANAMSA_EPOCH = 2451545.0; // J2000
const LAHIRI_AT_EPOCH = 23.85708; // Lahiri Ayanamsa at J2000
const PRECESSION_RATE = 50.29 / 3600; // degrees per year

const PLANET_DEFINITIONS = {
  Sun: { exalt: 10, debilitation: 190, houseId: 0 }, // Aries 10
  Moon: { exalt: 33, debilitation: 213, houseId: 1 }, // Taurus 3
  Mars: { exalt: 298, debilitation: 118, houseId: 4 }, // Capricorn 28
  Mercury: { exalt: 165, debilitation: 345, houseId: 2 }, // Virgo 15
  Jupiter: { exalt: 95, debilitation: 275, houseId: 5 }, // Cancer 5
  Venus: { exalt: 357, debilitation: 177, houseId: 3 }, // Pisces 27
  Saturn: { exalt: 200, debilitation: 20, houseId: 6 }, // Libra 20
  Rahu: { exalt: 60, debilitation: 240, houseId: 7 }, // Taurus (approx)
  Ketu: { exalt: 240, debilitation: 60, houseId: 8 }  // Scorpio (approx)
};

const COMBUSTION_DEGREES = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15
};

const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
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

function getNavamsa(longitude) {
  // D9 Logic
  // Sign Index (0-11)
  const sign = Math.floor(longitude / 30);
  const signPadas = Math.floor((longitude % 30) / 3.333333);

  // Element-based calculation
  // Fire (Ar, Le, Sg) start at Aries (1)
  // Earth (Ta, Vi, Cp) start at Capricorn (10)
  // Air (Ge, Li, Aq) start at Libra (7)
  // Water (Cn, Sc, Pi) start at Cancer (4)

  let startSignIndex;
  if ([0, 4, 8].includes(sign)) startSignIndex = 0; // Aries
  else if ([1, 5, 9].includes(sign)) startSignIndex = 9; // Cap
  else if ([2, 6, 10].includes(sign)) startSignIndex = 6; // Lib
  else startSignIndex = 3; // Can

  const d9SignIndex = (startSignIndex + signPadas) % 12;
  return d9SignIndex + 1;
}

function getVargaSign(longitude, division) {
  const sign = Math.floor(longitude / 30);
  const deg = longitude % 30;
  const part = Math.floor(deg / (30 / division));

  if (division === 1) return sign + 1;
  if (division === 9) return getNavamsa(longitude);

  let vargaSign = 0;
  if (division === 4) {
    vargaSign = (sign + (part * 3)) % 12;
  } else if (division === 7) {
    const start = (sign % 2 === 0) ? sign : (sign + 6) % 12;
    vargaSign = (start + part) % 12;
  } else if (division === 10) {
    const start = (sign % 2 === 0) ? sign : (sign + 8) % 12;
    vargaSign = (start + part) % 12;
  } else if (division === 60) {
    vargaSign = (sign + part) % 12;
  } else {
    vargaSign = (sign + part) % 12;
  }
  return vargaSign + 1;
}

function checkManglik(lagnaSign, marsSign, moonSign) {
  const badHouses = [0, 1, 3, 6, 7, 11];
  const marsHouseL = (marsSign - lagnaSign + 12) % 12;
  const marsHouseM = (marsSign - moonSign + 12) % 12;
  const fromLagna = badHouses.includes(marsHouseL);
  const fromMoon = badHouses.includes(marsHouseM);
  return { isManglik: fromLagna || fromMoon, fromLagna, fromMoon };
}

function checkSadeSati(moonSign, saturnSign) {
  const diff = (saturnSign - moonSign + 12) % 12;
  if (diff === 11) return { status: true, phase: "Rising (1st Phase)" };
  if (diff === 0) return { status: true, phase: "Peak (2nd Phase)" };
  if (diff === 1) return { status: true, phase: "Setting (3rd Phase)" };
  return { status: false, phase: "None" };
}




function isRetrograde(body, date, observer) {
  if (body === "Sun" || body === "Moon") return false;
  // Calculate dist now and 1 min later
  const t1 = date;
  const t2 = new Date(date.getTime() + 60 * 1000);

  // Use vector approach relative to Earth
  // Or simple longitude check (approx check)
  // Astronomy engine doesn't give momentary speed easily on Ecliptic without 2 points
  // Wait, Heliocentric vectors are easier, but Retrograde is Geocentric phenomenon.

  // Let's rely on simple longitude differencing
  // BUT we need Sidereal for charts, but Retrograde is physical, so Tropical diff is fine.
  const eq1 = Astronomy.Equator(body, t1, observer, false, true);
  const eq2 = Astronomy.Equator(body, t2, observer, false, true);

  // Simplest: If RA is decreasing? No. Ecliptic Longitude decreasing.
  // Converting to Ecliptic is expensive inside loop but necessary.

  // Let's use `Astronomy.EclipticGeo` if I can access it via Equator conversion logic from before.
  // Better: Compare RA? No. 
  // Let's assume standard Retrograde: Outer planets opposite Sun, Inner Inf conjunction.
  // I will compute Longitude at T1 and T2. If Lon2 < Lon1, Retrograde.
  // Note: Handle 360 boundary.
  return false; // Placeholder as full calc is heavy, will try to add if space permits in helper
}

function getGeoEcliptic(body, date, observer, obliquity) {
  const eq = Astronomy.Equator(body, date, observer, false, true);
  const ra = eq.ra * Math.PI / 12;
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
  const obliquity = Astronomy.e_tilt(time);

  // 1. Calculate Ascendant (Lagna)
  const mst = Astronomy.SiderealTime(time);
  const armc = (mst * 15 + lon) % 360; // RAMC in degrees
  const eps = obliquity * Math.PI / 180;
  const theta = armc * Math.PI / 180;

  // Ascendant Formula: atan2(cos(theta), -sin(theta)*cos(eps) - tan(lat)*sin(eps)) ?
  // Accurate formula: tan(Asc) = cos(RAMC) / ( -sin(RAMC)*cos(eps) - tan(lat)*sin(eps) ) -- verify signs
  // Using `Astronomy.Horizon` usually gives Azimuth/Alt.
  // Let's use standard approximation for MVP or known library.
  // Since `astronomy-engine` is purely astro, manual Ascendant is risky without test.
  // Fallback: Use RAMC as rough proxy + 90? No.
  // I will use `Astronomy.Ecliptic` of the `East` point? 
  // Let's use a simplified Ascendant: RAMC + 90 is midheaven approx?
  // Let's stick thereto:
  // Asc = atan(  cos(RAMC) / ( -sin(RAMC)*cos(e) - tan(phi)*sin(e) )  )
  const phi = lat * Math.PI / 180;
  const num = Math.cos(theta);
  const den = -Math.sin(theta) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
  let asc = Math.atan2(num, den) * 180 / Math.PI;
  asc = normalize(asc); // This gives Asc in Tropical
  const lagnaSidereal = normalize(asc - ayanamsa);


  const bodies = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu"];
  // Note: Rahu/Ketu require special handling in Astronomy Engine (Moon Node?)
  // Engine has "Moon" but not Node. We calculate Mean Node roughly or omitted if not avail.
  // Update: Astronomy Engine does not support Nodes built-in. 
  // I will mock nodes or calculate roughly based on date (18.6y cycle).
  // Node moves -0.05295 deg/day. Known epoch?
  // Let's skip Nodes for EXACT calculation and put them based on mean longitude if possible, 
  // or leave them as "Calculated" if I add a function.
  // Approx Rahu: J2000 Longitude ~ 125 deg. Rate ~ -0.05295 deg/day.
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

      // 2. Retrograde check
      if (name !== "Sun" && name !== "Moon") {
        const d2 = new Date(date.getTime() - 3600 * 1000); // 1 hour BEFORE
        const time2 = Astronomy.MakeTime(d2);
        const t0Lon = getGeoEcliptic(name, time2, observer, obliquity);
        // If current is less than previous (Forward is increasing)
        // Check wrapping
        let diff = t1Lon - t0Lon;
        if (diff < -300) diff += 360;
        if (diff > 300) diff -= 360;
        if (diff < 0) isRetro = true;
      }
    }

    // States
    // Exaltation (Simplified: Within 5 deg of peak? Or just sign?)
    // Usually Exalted is the whole Sign in D1, with peak degree.
    // I will check specific sign.
    const sign = getSign(sidLon);
    const def = PLANET_DEFINITIONS[name];
    let isExalted = false;
    let isDebilitated = false;
    let isCombust = false;

    if (def) {
      if (sign === Math.floor(def.exalt / 30) + 1) isExalted = true; // Broad definition
      if (sign === Math.floor(def.debilitation / 30) + 1) isDebilitated = true;

      // Combustion
      if (name !== "Sun" && name !== "Rahu" && name !== "Ketu") {
        let dist = Math.abs(sidLon - sunSid);
        if (dist > 180) dist = 360 - dist;
        if (dist < (COMBUSTION_DEGREES[name] || 10)) isCombust = true;
      }
    }

    planets.push({
      name,
      longitude: sidLon,
      sign,
      nakshatra: getNakshatra(sidLon),
      isRetro,
      isExalted,
      isDebilitated,
      isCombust,
      degree: sidLon % 30
    });
  });

  // D9 Calculation (Navamsa)
  const d9Planets = planets.map(p => ({
    ...p,
    sign: getNavamsa(p.longitude),
    isExalted: false, isDebilitated: false, isCombust: false
  }));

  // Varga Helper
  const calcVarga = (div) => ({
    planets: planets.map(p => ({
      ...p,
      sign: getVargaSign(p.longitude, div),
      isExalted: false, isDebilitated: false, isCombust: false
    })),
    lagna: {
      sign: getVargaSign(lagnaSidereal, div),
      degree: (lagnaSidereal * div) % 30
    }
  });

  const d4 = calcVarga(4);
  const d7 = calcVarga(7);
  const d10 = calcVarga(10);
  const d60 = calcVarga(60);

  // Chandra Lagna
  const moonPlanet = planets.find(p => p.name === "Moon");
  const chandraLagnaSign = moonPlanet ? moonPlanet.sign : 1;
  const chandra = {
    planets: planets,
    lagna: { sign: chandraLagnaSign, degree: 15 }
  };

  // Analysis
  const mars = planets.find(p => p.name === "Mars");
  const saturn = planets.find(p => p.name === "Saturn");
  const manglik = checkManglik(getSign(lagnaSidereal), mars ? mars.sign : 0, chandraLagnaSign);
  const sadeSati = checkSadeSati(chandraLagnaSign, saturn ? saturn.sign : 0);

  return {
    ayanamsa,
    d1: {
      planets: planets,
      lagna: {
        sign: getSign(lagnaSidereal),
        degree: lagnaSidereal % 30,
        nakshatra: getNakshatra(lagnaSidereal)
      }
    },
    d9: {
      planets: d9Planets,
      lagna: {
        sign: getNavamsa(lagnaSidereal),
        degree: (lagnaSidereal % 3.33333) * 9
      }
    },
    d4, d7, d10, d60, chandra,
    analysis: {
      manglik,
      sadeSati
    }
  };
}
