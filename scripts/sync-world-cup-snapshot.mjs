import fs from "node:fs/promises";
import path from "node:path";

const SNAPSHOT_URL = "https://https-www-fifa.com/us/en/choose-matches";
const FALLBACK_HTML_PATH = "/private/tmp/choose-matches.html";

const repoRoot = process.cwd();
const dataDir = path.join(repoRoot, "data");

const TEAM_META = {
  Mexico: {
    id: "MEX",
    name: "Mexico",
    shortName: "Mexico",
    code: "MEX",
    confederation: "CONCACAF",
    fifaRank: 15,
    eloRating: 1681.03,
    form: ["W", "D", "W", "W", "L"],
    goalDifferential: 4,
    goalsFor: 9,
    goalsAgainst: 5,
    flagEmoji: "🇲🇽",
    starCount: 0,
    colors: { primary: "#006847", secondary: "#FFFFFF", accent: "#CE1126" },
  },
  "South Africa": {
    id: "RSA",
    name: "South Africa",
    shortName: "South Africa",
    code: "RSA",
    confederation: "CAF",
    fifaRank: 55,
    eloRating: 1452,
    form: ["W", "D", "W", "L", "D"],
    goalDifferential: 2,
    goalsFor: 6,
    goalsAgainst: 4,
    flagEmoji: "🇿🇦",
    starCount: 0,
    colors: { primary: "#007749", secondary: "#FFB612", accent: "#DE3831" },
  },
  "Korea Republic": {
    id: "KOR",
    name: "Korea Republic",
    shortName: "Korea Republic",
    code: "KOR",
    confederation: "AFC",
    fifaRank: 25,
    eloRating: 1588.66,
    form: ["W", "W", "D", "L", "W"],
    goalDifferential: 5,
    goalsFor: 10,
    goalsAgainst: 5,
    flagEmoji: "🇰🇷",
    starCount: 0,
    colors: { primary: "#FFFFFF", secondary: "#CD2E3A", accent: "#0047A0" },
  },
  Czechia: {
    id: "CZE",
    name: "Czechia",
    shortName: "Czechia",
    code: "CZE",
    confederation: "UEFA",
    fifaRank: 41,
    eloRating: 1501.38,
    form: ["W", "D", "L", "W", "D"],
    goalDifferential: 1,
    goalsFor: 7,
    goalsAgainst: 6,
    flagEmoji: "🇨🇿",
    starCount: 0,
    colors: { primary: "#11457E", secondary: "#FFFFFF", accent: "#D7141A" },
  },
  Canada: {
    id: "CAN",
    name: "Canada",
    shortName: "Canada",
    code: "CAN",
    confederation: "CONCACAF",
    fifaRank: 30,
    eloRating: 1556.48,
    form: ["W", "D", "W", "L", "W"],
    goalDifferential: 3,
    goalsFor: 8,
    goalsAgainst: 5,
    flagEmoji: "🇨🇦",
    starCount: 0,
    colors: { primary: "#D80621", secondary: "#FFFFFF", accent: "#1A1A1A" },
  },
  Qatar: {
    id: "QAT",
    name: "Qatar",
    shortName: "Qatar",
    code: "QAT",
    confederation: "AFC",
    fifaRank: 60,
    eloRating: 1438,
    form: ["D", "L", "W", "D", "L"],
    goalDifferential: -1,
    goalsFor: 5,
    goalsAgainst: 6,
    flagEmoji: "🇶🇦",
    starCount: 0,
    colors: { primary: "#8A1538", secondary: "#FFFFFF", accent: "#3A0B1A" },
  },
  Switzerland: {
    id: "SUI",
    name: "Switzerland",
    shortName: "Switzerland",
    code: "SUI",
    confederation: "UEFA",
    fifaRank: 19,
    eloRating: 1649.4,
    form: ["D", "W", "D", "L", "W"],
    goalDifferential: 2,
    goalsFor: 7,
    goalsAgainst: 5,
    flagEmoji: "🇨🇭",
    starCount: 0,
    colors: { primary: "#D52B1E", secondary: "#FFFFFF", accent: "#8A1C12" },
  },
  "Bosnia and Herzegovina": {
    id: "BIH",
    name: "Bosnia and Herzegovina",
    shortName: "Bosnia and Herzegovina",
    code: "BIH",
    confederation: "UEFA",
    fifaRank: 53,
    eloRating: 1448,
    form: ["W", "D", "L", "W", "L"],
    goalDifferential: 0,
    goalsFor: 6,
    goalsAgainst: 6,
    flagEmoji: "🇧🇦",
    starCount: 0,
    colors: { primary: "#002F6C", secondary: "#FDB913", accent: "#FFFFFF" },
  },
  Brazil: {
    id: "BRA",
    name: "Brazil",
    shortName: "Brazil",
    code: "BRA",
    confederation: "CONMEBOL",
    fifaRank: 6,
    eloRating: 1761.16,
    form: ["W", "W", "W", "D", "W"],
    goalDifferential: 8,
    goalsFor: 12,
    goalsAgainst: 4,
    flagEmoji: "🇧🇷",
    starCount: 5,
    colors: { primary: "#009C3B", secondary: "#FFDF00", accent: "#002776" },
  },
  Morocco: {
    id: "MAR",
    name: "Morocco",
    shortName: "Morocco",
    code: "MAR",
    confederation: "CAF",
    fifaRank: 8,
    eloRating: 1755.87,
    form: ["W", "W", "D", "W", "L"],
    goalDifferential: 6,
    goalsFor: 10,
    goalsAgainst: 4,
    flagEmoji: "🇲🇦",
    starCount: 0,
    colors: { primary: "#C1272D", secondary: "#FFFFFF", accent: "#006233" },
  },
  Scotland: {
    id: "SCO",
    name: "Scotland",
    shortName: "Scotland",
    code: "SCO",
    confederation: "UEFA",
    fifaRank: 43,
    eloRating: 1498.35,
    form: ["D", "L", "W", "W", "D"],
    goalDifferential: 1,
    goalsFor: 7,
    goalsAgainst: 6,
    flagEmoji: "🏴",
    starCount: 0,
    colors: { primary: "#005EB8", secondary: "#FFFFFF", accent: "#0C2340" },
  },
  Haiti: {
    id: "HTI",
    name: "Haiti",
    shortName: "Haiti",
    code: "HTI",
    confederation: "CONCACAF",
    fifaRank: 74,
    eloRating: 1388,
    form: ["W", "D", "L", "W", "L"],
    goalDifferential: -1,
    goalsFor: 6,
    goalsAgainst: 7,
    flagEmoji: "🇭🇹",
    starCount: 0,
    colors: { primary: "#00209F", secondary: "#FFFFFF", accent: "#D21034" },
  },
  "United States": {
    id: "USA",
    name: "United States",
    shortName: "United States",
    code: "USA",
    confederation: "CONCACAF",
    fifaRank: 16,
    eloRating: 1673.13,
    form: ["W", "D", "W", "L", "W"],
    goalDifferential: 4,
    goalsFor: 8,
    goalsAgainst: 4,
    flagEmoji: "🇺🇸",
    starCount: 0,
    colors: { primary: "#1F5AA6", secondary: "#FFFFFF", accent: "#D81E34" },
  },
  Paraguay: {
    id: "PAR",
    name: "Paraguay",
    shortName: "Paraguay",
    code: "PAR",
    confederation: "CONMEBOL",
    fifaRank: 40,
    eloRating: 1503.5,
    form: ["W", "D", "W", "L", "D"],
    goalDifferential: 1,
    goalsFor: 6,
    goalsAgainst: 5,
    flagEmoji: "🇵🇾",
    starCount: 0,
    colors: { primary: "#D52B1E", secondary: "#FFFFFF", accent: "#0038A8" },
  },
  "Türkiye": {
    id: "TUR",
    name: "Türkiye",
    shortName: "Türkiye",
    code: "TUR",
    confederation: "UEFA",
    fifaRank: 22,
    eloRating: 1599.04,
    form: ["W", "W", "D", "L", "D"],
    goalDifferential: 4,
    goalsFor: 9,
    goalsAgainst: 5,
    flagEmoji: "🇹🇷",
    starCount: 0,
    colors: { primary: "#E30A17", secondary: "#FFFFFF", accent: "#5A0A0F" },
  },
  Australia: {
    id: "AUS",
    name: "Australia",
    shortName: "Australia",
    code: "AUS",
    confederation: "AFC",
    fifaRank: 27,
    eloRating: 1580.67,
    form: ["W", "D", "W", "D", "L"],
    goalDifferential: 3,
    goalsFor: 7,
    goalsAgainst: 4,
    flagEmoji: "🇦🇺",
    starCount: 0,
    colors: { primary: "#012169", secondary: "#FFFFFF", accent: "#E4002B" },
  },
  Germany: {
    id: "GER",
    name: "Germany",
    shortName: "Germany",
    code: "GER",
    confederation: "UEFA",
    fifaRank: 10,
    eloRating: 1730.37,
    form: ["W", "W", "D", "W", "L"],
    goalDifferential: 5,
    goalsFor: 10,
    goalsAgainst: 5,
    flagEmoji: "🇩🇪",
    starCount: 4,
    colors: { primary: "#111111", secondary: "#FFFFFF", accent: "#DD0000" },
  },
  Ecuador: {
    id: "ECU",
    name: "Ecuador",
    shortName: "Ecuador",
    code: "ECU",
    confederation: "CONMEBOL",
    fifaRank: 23,
    eloRating: 1594.78,
    form: ["W", "D", "W", "D", "L"],
    goalDifferential: 3,
    goalsFor: 8,
    goalsAgainst: 5,
    flagEmoji: "🇪🇨",
    starCount: 0,
    colors: { primary: "#FFDD00", secondary: "#034EA2", accent: "#ED1C24" },
  },
  "Côte d'Ivoire": {
    id: "CIV",
    name: "Côte d'Ivoire",
    shortName: "Côte d'Ivoire",
    code: "CIV",
    confederation: "CAF",
    fifaRank: 34,
    eloRating: 1532.98,
    form: ["W", "W", "D", "L", "W"],
    goalDifferential: 4,
    goalsFor: 9,
    goalsAgainst: 5,
    flagEmoji: "🇨🇮",
    starCount: 0,
    colors: { primary: "#F77F00", secondary: "#FFFFFF", accent: "#009E60" },
  },
  "Curaçao": {
    id: "CUW",
    name: "Curaçao",
    shortName: "Curaçao",
    code: "CUW",
    confederation: "CONCACAF",
    fifaRank: 78,
    eloRating: 1375,
    form: ["D", "W", "L", "D", "L"],
    goalDifferential: -2,
    goalsFor: 5,
    goalsAgainst: 7,
    flagEmoji: "🇨🇼",
    starCount: 0,
    colors: { primary: "#002B7F", secondary: "#FFFFFF", accent: "#F9E547" },
  },
  Netherlands: {
    id: "NED",
    name: "Netherlands",
    shortName: "Netherlands",
    code: "NED",
    confederation: "UEFA",
    fifaRank: 7,
    eloRating: 1757.87,
    form: ["W", "W", "D", "W", "D"],
    goalDifferential: 6,
    goalsFor: 11,
    goalsAgainst: 5,
    flagEmoji: "🇳🇱",
    starCount: 0,
    colors: { primary: "#F36C21", secondary: "#FFFFFF", accent: "#21468B" },
  },
  Japan: {
    id: "JPN",
    name: "Japan",
    shortName: "Japan",
    code: "JPN",
    confederation: "AFC",
    fifaRank: 18,
    eloRating: 1660.43,
    form: ["W", "W", "W", "D", "L"],
    goalDifferential: 7,
    goalsFor: 11,
    goalsAgainst: 4,
    flagEmoji: "🇯🇵",
    starCount: 0,
    colors: { primary: "#FFFFFF", secondary: "#BC002D", accent: "#1F2B5B" },
  },
  Tunisia: {
    id: "TUN",
    name: "Tunisia",
    shortName: "Tunisia",
    code: "TUN",
    confederation: "CAF",
    fifaRank: 44,
    eloRating: 1483.05,
    form: ["D", "W", "L", "W", "D"],
    goalDifferential: 1,
    goalsFor: 6,
    goalsAgainst: 5,
    flagEmoji: "🇹🇳",
    starCount: 0,
    colors: { primary: "#E70013", secondary: "#FFFFFF", accent: "#A7000F" },
  },
  Sweden: {
    id: "SWE",
    name: "Sweden",
    shortName: "Sweden",
    code: "SWE",
    confederation: "UEFA",
    fifaRank: 38,
    eloRating: 1514.77,
    form: ["W", "D", "W", "L", "D"],
    goalDifferential: 2,
    goalsFor: 7,
    goalsAgainst: 5,
    flagEmoji: "🇸🇪",
    starCount: 0,
    colors: { primary: "#006AA7", secondary: "#FECC00", accent: "#1B1F3B" },
  },
  Belgium: {
    id: "BEL",
    name: "Belgium",
    shortName: "Belgium",
    code: "BEL",
    confederation: "UEFA",
    fifaRank: 9,
    eloRating: 1734.71,
    form: ["W", "D", "W", "W", "L"],
    goalDifferential: 5,
    goalsFor: 10,
    goalsAgainst: 5,
    flagEmoji: "🇧🇪",
    starCount: 0,
    colors: { primary: "#000000", secondary: "#FFD90C", accent: "#EF3340" },
  },
  Egypt: {
    id: "EGY",
    name: "Egypt",
    shortName: "Egypt",
    code: "EGY",
    confederation: "CAF",
    fifaRank: 29,
    eloRating: 1563.24,
    form: ["W", "D", "W", "L", "W"],
    goalDifferential: 3,
    goalsFor: 8,
    goalsAgainst: 5,
    flagEmoji: "🇪🇬",
    starCount: 0,
    colors: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#000000" },
  },
  "IR Iran": {
    id: "IRN",
    name: "IR Iran",
    shortName: "IR Iran",
    code: "IRN",
    confederation: "AFC",
    fifaRank: 21,
    eloRating: 1615.3,
    form: ["W", "W", "D", "L", "W"],
    goalDifferential: 4,
    goalsFor: 8,
    goalsAgainst: 4,
    flagEmoji: "🇮🇷",
    starCount: 0,
    colors: { primary: "#239F40", secondary: "#FFFFFF", accent: "#DA0000" },
  },
  "New Zealand": {
    id: "NZL",
    name: "New Zealand",
    shortName: "New Zealand",
    code: "NZL",
    confederation: "OFC",
    fifaRank: 101,
    eloRating: 1281.6,
    form: ["W", "W", "W", "D", "W"],
    goalDifferential: 8,
    goalsFor: 12,
    goalsAgainst: 4,
    flagEmoji: "🇳🇿",
    starCount: 0,
    colors: { primary: "#00247D", secondary: "#FFFFFF", accent: "#CC142B" },
  },
  Spain: {
    id: "ESP",
    name: "Spain",
    shortName: "Spain",
    code: "ESP",
    confederation: "UEFA",
    fifaRank: 2,
    eloRating: 1876.4,
    form: ["W", "W", "W", "D", "W"],
    goalDifferential: 8,
    goalsFor: 12,
    goalsAgainst: 4,
    flagEmoji: "🇪🇸",
    starCount: 1,
    colors: { primary: "#AA151B", secondary: "#F1BF00", accent: "#0039A6" },
  },
  Uruguay: {
    id: "URU",
    name: "Uruguay",
    shortName: "Uruguay",
    code: "URU",
    confederation: "CONMEBOL",
    fifaRank: 17,
    eloRating: 1673.07,
    form: ["W", "D", "W", "W", "L"],
    goalDifferential: 5,
    goalsFor: 9,
    goalsAgainst: 4,
    flagEmoji: "🇺🇾",
    starCount: 2,
    colors: { primary: "#6CC3FF", secondary: "#FFFFFF", accent: "#001F5B" },
  },
  "Saudi Arabia": {
    id: "KSA",
    name: "Saudi Arabia",
    shortName: "Saudi Arabia",
    code: "KSA",
    confederation: "AFC",
    fifaRank: 62,
    eloRating: 1422,
    form: ["D", "W", "L", "D", "W"],
    goalDifferential: 1,
    goalsFor: 6,
    goalsAgainst: 5,
    flagEmoji: "🇸🇦",
    starCount: 0,
    colors: { primary: "#006C35", secondary: "#FFFFFF", accent: "#154734" },
  },
  "Cabo Verde": {
    id: "CPV",
    name: "Cabo Verde",
    shortName: "Cabo Verde",
    code: "CPV",
    confederation: "CAF",
    fifaRank: 58,
    eloRating: 1440,
    form: ["W", "D", "W", "L", "D"],
    goalDifferential: 2,
    goalsFor: 7,
    goalsAgainst: 5,
    flagEmoji: "🇨🇻",
    starCount: 0,
    colors: { primary: "#003893", secondary: "#FFFFFF", accent: "#CF2027" },
  },
  France: {
    id: "FRA",
    name: "France",
    shortName: "France",
    code: "FRA",
    confederation: "UEFA",
    fifaRank: 1,
    eloRating: 1877.32,
    form: ["W", "W", "D", "W", "W"],
    goalDifferential: 9,
    goalsFor: 13,
    goalsAgainst: 4,
    flagEmoji: "🇫🇷",
    starCount: 2,
    colors: { primary: "#002654", secondary: "#FFFFFF", accent: "#ED2939" },
  },
  Senegal: {
    id: "SEN",
    name: "Senegal",
    shortName: "Senegal",
    code: "SEN",
    confederation: "CAF",
    fifaRank: 14,
    eloRating: 1688.99,
    form: ["W", "W", "D", "L", "W"],
    goalDifferential: 5,
    goalsFor: 9,
    goalsAgainst: 4,
    flagEmoji: "🇸🇳",
    starCount: 0,
    colors: { primary: "#00853F", secondary: "#FDEF42", accent: "#E31B23" },
  },
  Norway: {
    id: "NOR",
    name: "Norway",
    shortName: "Norway",
    code: "NOR",
    confederation: "UEFA",
    fifaRank: 31,
    eloRating: 1550.94,
    form: ["W", "D", "W", "D", "L"],
    goalDifferential: 2,
    goalsFor: 7,
    goalsAgainst: 5,
    flagEmoji: "🇳🇴",
    starCount: 0,
    colors: { primary: "#BA0C2F", secondary: "#FFFFFF", accent: "#00205B" },
  },
  Iraq: {
    id: "IRQ",
    name: "Iraq",
    shortName: "Iraq",
    code: "IRQ",
    confederation: "AFC",
    fifaRank: 64,
    eloRating: 1412,
    form: ["W", "D", "L", "W", "D"],
    goalDifferential: 1,
    goalsFor: 6,
    goalsAgainst: 5,
    flagEmoji: "🇮🇶",
    starCount: 0,
    colors: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#000000" },
  },
  Argentina: {
    id: "ARG",
    name: "Argentina",
    shortName: "Argentina",
    code: "ARG",
    confederation: "CONMEBOL",
    fifaRank: 3,
    eloRating: 1874.81,
    form: ["W", "W", "W", "W", "D"],
    goalDifferential: 9,
    goalsFor: 14,
    goalsAgainst: 5,
    flagEmoji: "🇦🇷",
    starCount: 3,
    colors: { primary: "#74ACDF", secondary: "#FFFFFF", accent: "#F6B40E" },
  },
  Austria: {
    id: "AUT",
    name: "Austria",
    shortName: "Austria",
    code: "AUT",
    confederation: "UEFA",
    fifaRank: 24,
    eloRating: 1593.45,
    form: ["W", "D", "W", "L", "W"],
    goalDifferential: 3,
    goalsFor: 8,
    goalsAgainst: 5,
    flagEmoji: "🇦🇹",
    starCount: 0,
    colors: { primary: "#ED2939", secondary: "#FFFFFF", accent: "#B51F31" },
  },
  Algeria: {
    id: "ALG",
    name: "Algeria",
    shortName: "Algeria",
    code: "ALG",
    confederation: "CAF",
    fifaRank: 28,
    eloRating: 1564.26,
    form: ["W", "W", "D", "L", "W"],
    goalDifferential: 4,
    goalsFor: 8,
    goalsAgainst: 4,
    flagEmoji: "🇩🇿",
    starCount: 0,
    colors: { primary: "#006233", secondary: "#FFFFFF", accent: "#D21034" },
  },
  Jordan: {
    id: "JOR",
    name: "Jordan",
    shortName: "Jordan",
    code: "JOR",
    confederation: "AFC",
    fifaRank: 66,
    eloRating: 1406,
    form: ["W", "D", "D", "W", "L"],
    goalDifferential: 1,
    goalsFor: 6,
    goalsAgainst: 5,
    flagEmoji: "🇯🇴",
    starCount: 0,
    colors: { primary: "#000000", secondary: "#FFFFFF", accent: "#CE1126" },
  },
  Portugal: {
    id: "POR",
    name: "Portugal",
    shortName: "Portugal",
    code: "POR",
    confederation: "UEFA",
    fifaRank: 5,
    eloRating: 1763.83,
    form: ["W", "W", "D", "W", "W"],
    goalDifferential: 7,
    goalsFor: 12,
    goalsAgainst: 5,
    flagEmoji: "🇵🇹",
    starCount: 0,
    colors: { primary: "#006600", secondary: "#FF0000", accent: "#FFCC00" },
  },
  Colombia: {
    id: "COL",
    name: "Colombia",
    shortName: "Colombia",
    code: "COL",
    confederation: "CONMEBOL",
    fifaRank: 13,
    eloRating: 1693.09,
    form: ["W", "D", "W", "W", "L"],
    goalDifferential: 5,
    goalsFor: 10,
    goalsAgainst: 5,
    flagEmoji: "🇨🇴",
    starCount: 0,
    colors: { primary: "#FCD116", secondary: "#003893", accent: "#CE1126" },
  },
  Uzbekistan: {
    id: "UZB",
    name: "Uzbekistan",
    shortName: "Uzbekistan",
    code: "UZB",
    confederation: "AFC",
    fifaRank: 50,
    eloRating: 1465.34,
    form: ["W", "D", "W", "D", "W"],
    goalDifferential: 3,
    goalsFor: 7,
    goalsAgainst: 4,
    flagEmoji: "🇺🇿",
    starCount: 0,
    colors: { primary: "#0099B5", secondary: "#FFFFFF", accent: "#1EB53A" },
  },
  "Congo DR": {
    id: "COD",
    name: "Congo DR",
    shortName: "Congo DR",
    code: "COD",
    confederation: "CAF",
    fifaRank: 46,
    eloRating: 1478.35,
    form: ["W", "D", "L", "W", "W"],
    goalDifferential: 2,
    goalsFor: 7,
    goalsAgainst: 5,
    flagEmoji: "🇨🇩",
    starCount: 0,
    colors: { primary: "#00A3E0", secondary: "#FFFFFF", accent: "#EF3340" },
  },
  England: {
    id: "ENG",
    name: "England",
    shortName: "England",
    code: "ENG",
    confederation: "UEFA",
    fifaRank: 4,
    eloRating: 1825.97,
    form: ["W", "W", "D", "W", "L"],
    goalDifferential: 7,
    goalsFor: 12,
    goalsAgainst: 5,
    flagEmoji: "🏴",
    starCount: 1,
    colors: { primary: "#FFFFFF", secondary: "#CE1126", accent: "#00247D" },
  },
  Croatia: {
    id: "CRO",
    name: "Croatia",
    shortName: "Croatia",
    code: "CRO",
    confederation: "UEFA",
    fifaRank: 11,
    eloRating: 1717.07,
    form: ["W", "D", "W", "W", "L"],
    goalDifferential: 5,
    goalsFor: 9,
    goalsAgainst: 4,
    flagEmoji: "🇭🇷",
    starCount: 0,
    colors: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#171796" },
  },
  Panama: {
    id: "PAN",
    name: "Panama",
    shortName: "Panama",
    code: "PAN",
    confederation: "CONCACAF",
    fifaRank: 33,
    eloRating: 1540.64,
    form: ["W", "D", "W", "L", "D"],
    goalDifferential: 2,
    goalsFor: 6,
    goalsAgainst: 4,
    flagEmoji: "🇵🇦",
    starCount: 0,
    colors: { primary: "#005293", secondary: "#FFFFFF", accent: "#D21034" },
  },
  Ghana: {
    id: "GHA",
    name: "Ghana",
    shortName: "Ghana",
    code: "GHA",
    confederation: "CAF",
    fifaRank: 68,
    eloRating: 1400,
    form: ["D", "W", "L", "W", "L"],
    goalDifferential: 0,
    goalsFor: 6,
    goalsAgainst: 6,
    flagEmoji: "🇬🇭",
    starCount: 0,
    colors: { primary: "#CE1126", secondary: "#FCD116", accent: "#006B3F" },
  },
};

const TEAM_NAME_ALIASES = {
  USA: "United States",
};

const KNOCKOUT_TEMPLATE = [
  { id: "M73", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "2A", awaySlot: "2B", city: "Inglewood, United States", venue: "Los Angeles Stadium", kickoff: "2026-06-28T12:00:00-07:00" },
  { id: "M74", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1E", awaySlot: "3ABCDF", city: "Foxborough, United States", venue: "Boston Stadium", kickoff: "2026-06-29T16:30:00-04:00" },
  { id: "M75", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1F", awaySlot: "2C", city: "Guadalupe, Mexico", venue: "Monterrey Stadium", kickoff: "2026-06-29T19:00:00-06:00" },
  { id: "M76", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1C", awaySlot: "2F", city: "Houston, United States", venue: "Houston Stadium", kickoff: "2026-06-29T12:00:00-05:00" },
  { id: "M77", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1I", awaySlot: "3CDFGH", city: "East Rutherford, United States", venue: "New York New Jersey Stadium", kickoff: "2026-06-30T17:00:00-04:00" },
  { id: "M78", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "2E", awaySlot: "2I", city: "Arlington, United States", venue: "Dallas Stadium", kickoff: "2026-06-30T12:00:00-05:00" },
  { id: "M79", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1A", awaySlot: "3CEFHI", city: "Ciudad de México, Mexico", venue: "Mexico City Stadium", kickoff: "2026-06-30T19:00:00-06:00" },
  { id: "M80", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1L", awaySlot: "3EHIJK", city: "Atlanta, United States", venue: "Atlanta Stadium", kickoff: "2026-07-01T12:00:00-04:00" },
  { id: "M81", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1D", awaySlot: "3BEFIJ", city: "Santa Clara, United States", venue: "San Francisco Bay Area Stadium", kickoff: "2026-07-01T17:00:00-07:00" },
  { id: "M82", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1G", awaySlot: "3AEHIJ", city: "Seattle, United States", venue: "Seattle Stadium", kickoff: "2026-07-01T13:00:00-07:00" },
  { id: "M83", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "2K", awaySlot: "2L", city: "Toronto, Canada", venue: "Toronto Stadium", kickoff: "2026-07-02T19:00:00-04:00" },
  { id: "M84", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1H", awaySlot: "2J", city: "Inglewood, United States", venue: "Los Angeles Stadium", kickoff: "2026-07-02T12:00:00-07:00" },
  { id: "M85", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1B", awaySlot: "3EFGIJ", city: "Vancouver, Canada", venue: "BC Place Vancouver", kickoff: "2026-07-02T20:00:00-07:00" },
  { id: "M86", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1J", awaySlot: "2H", city: "Miami Gardens, United States", venue: "Miami Stadium", kickoff: "2026-07-03T18:00:00-04:00" },
  { id: "M87", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "1K", awaySlot: "3DEIJL", city: "Kansas City, United States", venue: "Kansas City Stadium", kickoff: "2026-07-03T20:30:00-05:00" },
  { id: "M88", stage: "ROUND_OF_32", roundLabel: "Round of 32", homeSlot: "2D", awaySlot: "2G", city: "Arlington, United States", venue: "Dallas Stadium", kickoff: "2026-07-03T13:00:00-05:00" },
  { id: "M89", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W74", awaySlot: "W77", city: "Philadelphia, United States", venue: "Philadelphia Stadium", kickoff: "2026-07-04T17:00:00-04:00" },
  { id: "M90", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W73", awaySlot: "W75", city: "Houston, United States", venue: "Houston Stadium", kickoff: "2026-07-04T12:00:00-05:00" },
  { id: "M91", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W76", awaySlot: "W78", city: "East Rutherford, United States", venue: "New York New Jersey Stadium", kickoff: "2026-07-05T16:00:00-04:00" },
  { id: "M92", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W79", awaySlot: "W80", city: "Ciudad de México, Mexico", venue: "Mexico City Stadium", kickoff: "2026-07-05T18:00:00-06:00" },
  { id: "M93", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W83", awaySlot: "W84", city: "Arlington, United States", venue: "Dallas Stadium", kickoff: "2026-07-06T14:00:00-05:00" },
  { id: "M94", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W81", awaySlot: "W82", city: "Seattle, United States", venue: "Seattle Stadium", kickoff: "2026-07-06T17:00:00-07:00" },
  { id: "M95", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W86", awaySlot: "W88", city: "Atlanta, United States", venue: "Atlanta Stadium", kickoff: "2026-07-07T12:00:00-04:00" },
  { id: "M96", stage: "ROUND_OF_16", roundLabel: "Round of 16", homeSlot: "W85", awaySlot: "W87", city: "Vancouver, Canada", venue: "BC Place Vancouver", kickoff: "2026-07-07T13:00:00-07:00" },
  { id: "M97", stage: "QUARTERFINAL", roundLabel: "Quarterfinal", homeSlot: "W89", awaySlot: "W90", city: "Foxborough, United States", venue: "Boston Stadium", kickoff: "2026-07-09T16:00:00-04:00" },
  { id: "M98", stage: "QUARTERFINAL", roundLabel: "Quarterfinal", homeSlot: "W93", awaySlot: "W94", city: "Inglewood, United States", venue: "Los Angeles Stadium", kickoff: "2026-07-10T12:00:00-07:00" },
  { id: "M99", stage: "QUARTERFINAL", roundLabel: "Quarterfinal", homeSlot: "W91", awaySlot: "W92", city: "Miami Gardens, United States", venue: "Miami Stadium", kickoff: "2026-07-11T17:00:00-04:00" },
  { id: "M100", stage: "QUARTERFINAL", roundLabel: "Quarterfinal", homeSlot: "W95", awaySlot: "W96", city: "Kansas City, United States", venue: "Kansas City Stadium", kickoff: "2026-07-11T20:00:00-05:00" },
  { id: "M101", stage: "SEMIFINAL", roundLabel: "Semifinal", homeSlot: "W97", awaySlot: "W98", city: "Arlington, United States", venue: "Dallas Stadium", kickoff: "2026-07-14T14:00:00-05:00" },
  { id: "M102", stage: "SEMIFINAL", roundLabel: "Semifinal", homeSlot: "W99", awaySlot: "W100", city: "Atlanta, United States", venue: "Atlanta Stadium", kickoff: "2026-07-15T15:00:00-04:00" },
  { id: "M103", stage: "THIRD_PLACE", roundLabel: "Third Place", homeSlot: "L101", awaySlot: "L102", city: "Miami Gardens, United States", venue: "Miami Stadium", kickoff: "2026-07-18T17:00:00-04:00" },
  { id: "M104", stage: "FINAL", roundLabel: "Final", homeSlot: "W101", awaySlot: "W102", city: "East Rutherford, United States", venue: "New York New Jersey Stadium", kickoff: "2026-07-19T15:00:00-04:00" },
];

const STADIUM_TIMEZONE_OFFSETS = {
  "Guadalajara Stadium": "-06:00",
  "Mexico City Stadium": "-06:00",
  "Monterrey Stadium": "-06:00",
  "Toronto Stadium": "-04:00",
  "BC Place Vancouver": "-07:00",
  "Los Angeles Stadium": "-07:00",
  "San Francisco Bay Area Stadium": "-07:00",
  "Seattle Stadium": "-07:00",
  "Boston Stadium": "-04:00",
  "New York New Jersey Stadium": "-04:00",
  "Philadelphia Stadium": "-04:00",
  "Miami Stadium": "-04:00",
  "Atlanta Stadium": "-04:00",
  "Dallas Stadium": "-05:00",
  "Houston Stadium": "-05:00",
  "Kansas City Stadium": "-05:00",
};

const MONTH_INDEX = {
  June: 6,
  July: 7,
};

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&eacute;/g, "é")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ocirc;/g, "ô")
    .replace(/&uuml;/g, "ü");
}

function textBetween(block, pattern) {
  const match = block.match(pattern);
  return match ? decodeHtml(match[1].trim()) : "";
}

function getStage(matchNumber) {
  if (matchNumber <= 72) return "GROUP";
  if (matchNumber <= 88) return "ROUND_OF_32";
  if (matchNumber <= 96) return "ROUND_OF_16";
  if (matchNumber <= 100) return "QUARTERFINAL";
  if (matchNumber <= 102) return "SEMIFINAL";
  if (matchNumber === 103) return "THIRD_PLACE";
  return "FINAL";
}

function getRoundLabel(stage, group) {
  if (stage === "GROUP" && group) return "Group Stage";
  if (stage === "ROUND_OF_32") return "Round of 32";
  if (stage === "ROUND_OF_16") return "Round of 16";
  if (stage === "QUARTERFINAL") return "Quarterfinal";
  if (stage === "SEMIFINAL") return "Semifinal";
  if (stage === "THIRD_PLACE") return "Third Place";
  return "Final";
}

function createKickoffIso(dateLabel, timeLabel, venue) {
  const [monthName, dayText] = dateLabel.split(" ");
  const month = MONTH_INDEX[monthName];
  const day = dayText.padStart(2, "0");
  const timeMatch = timeLabel.match(/(\d{1,2}(?::\d{2})?)\s*(AM|PM)/i);

  if (!timeMatch) {
    throw new Error(`Unable to parse kickoff label "${timeLabel}" for ${venue}`);
  }

  const [, timePart, meridiemRaw] = timeMatch;
  const meridiem = meridiemRaw.toUpperCase();
  const [rawHour, rawMinute = "00"] = timePart.split(":");
  let hour = Number(rawHour);
  const minute = rawMinute.padStart(2, "0");

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  const offset = STADIUM_TIMEZONE_OFFSETS[venue] ?? "-05:00";
  return `2026-${String(month).padStart(2, "0")}-${day}T${String(hour).padStart(2, "0")}:${minute}:00${offset}`;
}

function buildGroupStandings(teams) {
  return teams
    .map((team) => ({
      teamId: team.id,
      group: team.group,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      qualificationStatus: "alive",
    }))
    .sort((left, right) => left.group.localeCompare(right.group) || left.name?.localeCompare?.(right.name ?? "") || left.teamId.localeCompare(right.teamId));
}

function buildSeedPredictions(teams) {
  const strengths = teams.map((team) => team.eloRating * 0.72 + (2150 - team.fifaRank * 8) * 0.2 + (team.goalDifferential * 6 + team.eloRating) * 0.08);
  const min = Math.min(...strengths);
  const max = Math.max(...strengths);

  return teams
    .map((team) => {
      const blended = team.eloRating * 0.72 + (2150 - team.fifaRank * 8) * 0.2 + (team.goalDifferential * 6 + team.eloRating) * 0.08;
      const normalized = (blended - min) / Math.max(max - min, 1);
      const powerRating = Math.round(60 + normalized * 38);
      const advancePct = Number((34 + normalized * 55).toFixed(1));
      const quarterfinalPct = Number((advancePct * (0.34 + normalized * 0.22)).toFixed(1));
      const semifinalPct = Number((quarterfinalPct * (0.42 + normalized * 0.16)).toFixed(1));
      const finalPct = Number((semifinalPct * (0.44 + normalized * 0.12)).toFixed(1));
      const tournamentWinPct = Number((finalPct * (0.38 + normalized * 0.12)).toFixed(1));

      return {
        teamId: team.id,
        advancePct,
        quarterfinalPct,
        semifinalPct,
        finalPct,
        tournamentWinPct,
        upsetLikelihood: Number((64 - normalized * 34).toFixed(1)),
        pathDifficulty: Math.round(58 + (1 - normalized) * 24),
        powerRating,
        mostLikelyFinalOpponentId: teams.find((candidate) => candidate.id !== team.id && candidate.group.charCodeAt(0) % 2 !== team.group.charCodeAt(0) % 2)?.id ?? teams[0]?.id ?? team.id,
      };
    })
    .sort((left, right) => right.powerRating - left.powerRating);
}

function parseMatchesFromHtml(html) {
  const matchBlocks = [...html.matchAll(/<div class="match ">([\s\S]*?)<div class="match__action">/g)].map((entry) => entry[1]);
  const parsed = [];

  for (const block of matchBlocks) {
    const matchNumberLabel = textBetween(block, /match__match-number-box[^>]*>([^<]+)</);
    const matchNumber = Number(matchNumberLabel.replace("M", ""));
    const groupLabel = textBetween(block, /match__group__label">([^<]+)</);
    const teamLabels = [...block.matchAll(/<div class="match__team">[\s\S]*?<label class="body-300 font-bold"[^>]*>([^<]+)<\/label>/g)].map((entry) =>
      decodeHtml(entry[1].trim()),
    );
    const dateLabel = textBetween(block, /<div class="match__date"><label[^>]*>([^<]+)</);
    const timeLabel = textBetween(block, /<div class="match__date"><label[^>]*>[^<]+<\/label><label[^>]*>([^<]+)</);
    const cityLabel = textBetween(block, /<div class="match__venue"><label[^>]*>([^<]+)</);
    const venueLabel = textBetween(block, /<div class="match__venue"><label[^>]*>[^<]+<\/label><label[^>]*>([^<]+)</);
    const stage = getStage(matchNumber);

    parsed.push({
      matchNumber,
      matchId: `M${matchNumber}`,
      groupLabel,
      stage,
      teams: teamLabels,
      dateLabel,
      timeLabel,
      cityLabel,
      venueLabel,
    });
  }

  return parsed;
}

async function loadSnapshotHtml() {
  try {
    const response = await fetch(SNAPSHOT_URL, {
      headers: {
        "User-Agent": "CupCast Snapshot Builder",
      },
    });

    if (response.ok) {
      return await response.text();
    }
  } catch {}

  return fs.readFile(FALLBACK_HTML_PATH, "utf8");
}

function normalizeSnapshotGroupCode(groupLabel) {
  if (!groupLabel) return null;
  const trimmed = groupLabel.trim();
  const normalized = trimmed.replace(/^group\s+/i, "");

  return /^[A-L]$/i.test(normalized) ? normalized.toUpperCase() : null;
}

function pickMostLikelyGroup(votes = new Map()) {
  return [...votes.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] ?? null;
}

function buildTeams(matches) {
  const groups = new Map();
  const groupVotes = new Map();

  for (const match of matches.filter((entry) => entry.stage === "GROUP")) {
    const group = normalizeSnapshotGroupCode(match.groupLabel);
    for (const teamName of match.teams) {
      const meta = TEAM_META[TEAM_NAME_ALIASES[teamName] ?? teamName];
      if (!meta) {
        throw new Error(`Missing team metadata for ${teamName}`);
      }

      if (group) {
        const votes = groupVotes.get(meta.id) ?? new Map();
        votes.set(group, (votes.get(group) ?? 0) + 1);
        groupVotes.set(meta.id, votes);
      }

      if (!groups.has(meta.id)) {
        groups.set(meta.id, { ...meta, group: group ?? "A" });
      }
    }
  }

  return [...groups.values()]
    .map((team) => ({
      ...team,
      group: pickMostLikelyGroup(groupVotes.get(team.id)) ?? team.group,
    }))
    .sort((left, right) => left.group.localeCompare(right.group) || left.name.localeCompare(right.name));
}

function buildGroupMatches(matches, teams) {
  const groupMatches = matches.filter((entry) => entry.stage === "GROUP");
  const teamMap = new Map(teams.map((team) => [team.id, team]));
  const groupStageWithOpeningMatch = [
    {
      matchNumber: 1,
      matchId: "M1",
      groupLabel: "Group A",
      stage: "GROUP",
      teams: ["Mexico", "South Africa"],
      dateLabel: "June 11",
      timeLabel: "6:00 PM",
      cityLabel: "Mexico City, Mexico",
      venueLabel: "Mexico City Stadium",
    },
    ...groupMatches,
  ]
    .filter((entry, index, source) => source.findIndex((candidate) => candidate.matchId === entry.matchId) === index)
    .sort((left, right) => left.matchNumber - right.matchNumber);

  return groupStageWithOpeningMatch.map((match) => {
    const [homeTeamName, awayTeamName] = match.teams;
    const homeTeam = TEAM_META[TEAM_NAME_ALIASES[homeTeamName] ?? homeTeamName];
    const awayTeam = TEAM_META[TEAM_NAME_ALIASES[awayTeamName] ?? awayTeamName];

    if (!homeTeam || !awayTeam) {
      throw new Error(`Unable to map teams for ${match.matchId}`);
    }

    const inferredGroup = teamMap.get(homeTeam.id)?.group && teamMap.get(homeTeam.id)?.group === teamMap.get(awayTeam.id)?.group ? teamMap.get(homeTeam.id)?.group : null;
    const importedGroup = normalizeSnapshotGroupCode(match.groupLabel);
    const resolvedGroup = inferredGroup ?? importedGroup ?? "A";
    const resolvedGroupLabel = `Group ${resolvedGroup}`;

    return {
      id: match.matchId,
      slug: `${slugify(homeTeam.name)}-vs-${slugify(awayTeam.name)}`,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      venue: match.venueLabel,
      city: match.cityLabel,
      kickoff: createKickoffIso(match.dateLabel, match.timeLabel, match.venueLabel),
      stage: "GROUP",
      status: "UPCOMING",
      group: resolvedGroup,
      roundLabel: getRoundLabel("GROUP", resolvedGroupLabel),
      score: { home: 0, away: 0 },
      homeStats: { possession: 0, shots: 0, shotsOnTarget: 0, xg: 0, bigChances: 0, passes: 0 },
      awayStats: { possession: 0, shots: 0, shotsOnTarget: 0, xg: 0, bigChances: 0, passes: 0 },
      winProbability: { home: 0, draw: 0, away: 0 },
      momentum: [
        { minute: 0, home: 0.5, away: 0.5 },
        { minute: 15, home: 0.5, away: 0.5 },
        { minute: 30, home: 0.5, away: 0.5 },
        { minute: 45, home: 0.5, away: 0.5 },
        { minute: 60, home: 0.5, away: 0.5 },
        { minute: 75, home: 0.5, away: 0.5 },
        { minute: 90, home: 0.5, away: 0.5 },
      ],
      timelineEventIds: [],
      featured: ["M1", "M3", "M4", "M7", "M14", "M18", "M33", "M49"].includes(match.matchId),
    };
  });
}

async function main() {
  const html = await loadSnapshotHtml();
  const parsedMatches = parseMatchesFromHtml(html);
  const teams = buildTeams(parsedMatches);
  const matches = buildGroupMatches(parsedMatches, teams);
  const groups = buildGroupStandings(teams);
  const predictions = buildSeedPredictions(teams);

  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(path.join(dataDir, "teams.json"), `${JSON.stringify(teams, null, 2)}\n`);
  await fs.writeFile(path.join(dataDir, "matches.json"), `${JSON.stringify(matches, null, 2)}\n`);
  await fs.writeFile(path.join(dataDir, "groups.json"), `${JSON.stringify(groups, null, 2)}\n`);
  await fs.writeFile(path.join(dataDir, "events.json"), "[]\n");
  await fs.writeFile(path.join(dataDir, "predictions.json"), `${JSON.stringify(predictions, null, 2)}\n`);
  await fs.writeFile(path.join(dataDir, "knockout.json"), `${JSON.stringify(KNOCKOUT_TEMPLATE, null, 2)}\n`);

  console.log(`Wrote snapshot for ${teams.length} teams, ${matches.length} group matches, and ${KNOCKOUT_TEMPLATE.length} knockout fixtures.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
