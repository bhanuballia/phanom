# VedAstro-master Extraction Guide

## 📋 Overview
This document outlines the key files and components from VedAstro-master needed for your Kundali, Kundali Matching, Zodiac Sign, and Numerology pages.

---

## 🎯 Required Files by Feature

### 1. **Kundali Page** (Birth Chart/Horoscope)

#### Core Calculation Files:
```
VedAstro-master/Library/Logic/Calculate/
├── Core.cs                    # Core astrological calculations (3,739 lines)
│   ├── Planet positions
│   ├── House calculations
│   ├── Zodiac sign calculations
│   ├── Constellation (Nakshatra) calculations
│   ├── Lunar day (Tithi) calculations
│   └── Ascendant (Lagna) calculations
│
├── Vargas.cs                  # Divisional charts (D1-D60) (243,227 lines)
│   ├── Rasi Chart (D1)
│   ├── Navamsa (D9)
│   ├── Drekkana (D3)
│   └── Other divisional charts
│
└── Ashtakavarga.cs            # Ashtakavarga strength calculations (21,982 lines)
```

#### Data Models:
```
VedAstro-master/Library/Data/
├── Person.cs                  # Person data structure
├── Time.cs                    # Time handling
├── GeoLocation.cs             # Location data
├── House.cs                   # House data structure
├── PlanetName.cs              # Planet enumerations
├── ZodiacSign.cs              # Zodiac sign data
├── Constellation.cs           # Nakshatra data
└── Enum/
    ├── HouseName.cs
    ├── ZodiacName.cs
    └── ConstellationName.cs
```

#### Key Methods for Kundali:
- `Calculate.AllPlanetLongitude(Time)` - Get all planet positions
- `Calculate.AllHouseLongitudes(Time)` - Get all house cusps
- `Calculate.PlanetRasiD1Sign(PlanetName, Time)` - Planet's zodiac sign
- `Calculate.LagnaSignName(Time)` - Ascendant sign
- `Calculate.MoonSignName(Time)` - Moon sign (Rasi)
- `Calculate.MoonConstellation(Time)` - Birth Nakshatra
- `Calculate.PlanetConstellation(PlanetName, Time)` - Planet's Nakshatra

---

### 2. **Kundali Matching Page** (Compatibility Analysis)

#### Core Matching Files:
```
VedAstro-master/Library/Logic/Factory/
└── MatchReportFactory.cs      # Complete matching system (2,112 lines)
    ├── GetNewMatchReport()    # Main matching function
    ├── GrahaMaitram()         # Planetary friendship (5 points)
    ├── Rajju()                # Rajju Kuta
    ├── NadiKuta()             # Nadi compatibility (8 points)
    ├── VasyaKuta()            # Vasya compatibility (2 points)
    ├── DinaKuta()             # Dina compatibility (3 points)
    ├── GunaKuta()             # Gana compatibility (6 points)
    ├── Mahendra()             # Mahendra Kuta
    ├── StreeDeergha()         # Stree Deergha
    ├── RasiKuta()             # Rasi compatibility (7 points)
    ├── VedhaKuta()            # Vedha obstruction
    ├── Varna()                # Varna compatibility (1 point)
    ├── YoniKuta()             # Yoni compatibility (4 points)
    ├── LagnaAndHouse7Good()   # 7th house analysis
    ├── KujaDosa()             # Mangal Dosha check
    ├── BadConstellations()    # Inauspicious Nakshatras
    └── SexEnergy()            # Sexual compatibility
```

#### Data Models:
```
VedAstro-master/Library/Data/
├── MatchReport.cs             # Match report structure
├── MatchPrediction.cs         # Individual prediction
└── PersonKutaScore.cs         # Kuta scoring
```

#### Key Calculations:
- **Total Kuta Points**: 36 (out of 36)
  - Nadi Kuta: 8 points
  - Rasi Kuta: 7 points
  - Guna Kuta: 6 points
  - Graha Maitram: 5 points
  - Yoni Kuta: 4 points
  - Dina Kuta: 3 points
  - Vasya Kuta: 2 points
  - Varna: 1 point

---

### 3. **Zodiac Sign Page** (Sun & Moon Signs)

#### Required Files:
```
VedAstro-master/Library/Logic/Calculate/
└── Core.cs
    ├── SunSign(Time)          # Sun's zodiac sign
    ├── MoonSignName(Time)     # Moon's zodiac sign
    ├── LagnaSignName(Time)    # Ascendant sign
    └── PlanetRasiD1Sign(PlanetName, Time)
```

#### Data Files:
```
VedAstro-master/Library/Data/
├── ZodiacSign.cs              # Zodiac sign properties
├── PlanetSign.cs              # Planet in sign data
└── Enum/ZodiacName.cs         # Zodiac enumerations
```

#### Zodiac Sign Properties:
- Element (Fire, Earth, Air, Water)
- Quality (Cardinal, Fixed, Mutable)
- Ruling Planet
- Characteristics
- Compatibility

---

### 4. **Numerology Page** (Name & Birth Number)

#### Core Numerology File:
```
VedAstro-master/Library/Logic/Calculate/
└── Numerology.cs              # Complete numerology system (367 lines)
    ├── BirthNumber(Time)      # Birth date number (1-9)
    ├── DestinyNumber(Time)    # Life path number
    ├── NameNumber(string)     # Name numerology (Chaldean system)
    └── NameNumberPrediction(string)  # Detailed predictions
```

#### Data Model:
```
VedAstro-master/Library/Data/
└── NumerologyPrediction.cs    # Prediction structure
```

#### Numerology System Details:

**Chaldean Alphabet Values:**
```
a=1, b=2, c=3, d=4, e=5, f=8, g=3, h=5, i=1, j=1, k=2, l=3, m=4, 
n=5, o=7, p=8, q=1, r=2, s=3, t=4, u=6, v=6, w=6, x=5, y=1, z=7
```

**Special Initial Values:**
```
I,J,Y=10, K=20, L,S=30, M=40, N=50, O=70, P=80, Q=100, R=200, T=400
```

**Predictions Available:**
- 108 different name number predictions (10-108)
- Mapped to 9 planets (Sun, Moon, Jupiter, Rahu, Mercury, Venus, Ketu, Saturn, Mars)
- Life aspect scores: Finance, Romance, Education, Health

---

## 🔧 Essential Supporting Files

### Swiss Ephemeris (Astronomical Calculations):
```
VedAstro-master/Library/
└── SwissEphNet/               # Swiss Ephemeris .NET wrapper
    └── (Required for accurate planet positions)
```

### Helper Classes:
```
VedAstro-master/Library/Logic/
├── Tools.cs                   # Utility functions (167,364 lines)
├── Format.cs                  # Formatting helpers
├── Algorithms.cs              # Mathematical algorithms
└── Calculate/LocationManager.cs  # Geo-location handling (88,350 lines)
```

### Data Files:
```
VedAstro-master/Library/XMLData/
├── EventDataList.xml          # Event definitions
└── HoroscopeDataList.xml      # Horoscope data
```

---

## 📊 Integration Strategy

### Option 1: **API Integration** (Recommended)
Use VedAstro's existing API endpoints:

```javascript
// Example API calls
const baseURL = 'https://vedastroapi.azurewebsites.net/api';

// Get planet data
GET ${baseURL}/Calculate/AllPlanetData/Time/{time}/Location/{location}

// Get match report
GET ${baseURL}/Calculate/MatchReport/Male/{maleId}/Female/{femaleId}

// Get numerology
GET ${baseURL}/Calculate/NameNumber/Name/{name}
```

### Option 2: **Direct Code Integration**
1. Extract the C# calculation files
2. Create a .NET API wrapper
3. Call from your Node.js backend via HTTP
4. Return JSON to React frontend

### Option 3: **Port to JavaScript**
1. Translate core calculation logic to JavaScript
2. Use Swiss Ephemeris JavaScript library
3. Implement directly in Node.js backend

---

## 🎨 Frontend Integration (Your Existing Pages)

### Kundali.jsx Integration:
```javascript
// Your current page needs:
- Planet positions (from Core.cs)
- House cusps (from Core.cs)
- Divisional charts (from Vargas.cs)
- Dasha periods (from VimshottariDasa.cs)
```

### KundaliMatching.jsx Integration:
```javascript
// Your current page needs:
- All 16 Kuta calculations (from MatchReportFactory.cs)
- Kuta score (0-36)
- Compatibility percentage
- Detailed predictions
```

### ZodiacSigns.jsx Integration:
```javascript
// Your current page needs:
- Sun sign calculation (from Core.cs)
- Moon sign calculation (from Core.cs)
- Sign characteristics
- Compatibility data
```

### Numerology.jsx Integration:
```javascript
// Your current page needs:
- Birth number (from Numerology.cs)
- Destiny number (from Numerology.cs)
- Name number (from Numerology.cs)
- Detailed predictions (from Numerology.cs)
```

---

## 📦 Recommended Extraction Steps

### Step 1: Create API Wrapper
```bash
# Create a new .NET API project
cd VedAstro-master/API
dotnet build

# Deploy to Azure/Heroku/Render
# Or run locally on port 5000
```

### Step 2: Create API Endpoints
```csharp
// Example endpoints to create:
POST /api/kundali/generate
POST /api/matching/calculate
POST /api/zodiac/calculate
POST /api/numerology/calculate
```

### Step 3: Connect to Your Frontend
```javascript
// In your React app
import axios from 'axios';

const vedastroAPI = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Use in your components
const kundaliData = await vedastroAPI.post('/kundali/generate', birthData);
```

---

## 🔑 Key Dependencies

### Required NuGet Packages:
```xml
<PackageReference Include="SwissEphNet" Version="*" />
<PackageReference Include="Newtonsoft.Json" Version="*" />
```

### Required Data Files:
- Swiss Ephemeris data files (sepl_*.se1)
- Timezone database
- Location database

---

## ⚠️ Important Notes

1. **Ayanamsa**: VedAstro uses Lahiri Ayanamsa by default
2. **Time Zone**: Proper timezone handling is critical
3. **Geo Location**: Accurate latitude/longitude required
4. **Calculation Precision**: Swiss Ephemeris provides high accuracy
5. **Caching**: Implement caching for repeated calculations

---

## 📚 Reference Documentation

- **VedAstro GitHub**: https://github.com/VedAstro/VedAstro
- **VedAstro Website**: https://vedastro.org
- **API Documentation**: https://vedastroapi.azurewebsites.net
- **Swiss Ephemeris**: https://www.astro.com/swisseph/

---

## 🎯 Next Steps

1. ✅ Review this extraction guide
2. ⬜ Decide on integration strategy (API vs Direct)
3. ⬜ Set up VedAstro API locally or use hosted version
4. ⬜ Create API endpoints for your 4 pages
5. ⬜ Update your React components to use VedAstro calculations
6. ⬜ Test accuracy against known birth charts
7. ⬜ Deploy to production

---

## 💡 Quick Start Example

### For Kundali Calculation:
```csharp
// C# Code (VedAstro)
var birthTime = new Time("23:40 15/10/2000 +05:30", GeoLocation.Bangalore);
var person = new Person("John Doe", birthTime);

// Get planet positions
var allPlanets = Calculate.AllPlanetLongitude(birthTime);

// Get houses
var allHouses = Calculate.AllHouseLongitudes(birthTime);

// Get moon sign
var moonSign = Calculate.MoonSignName(birthTime);
```

### For Matching:
```csharp
// C# Code (VedAstro)
var male = new Person("John", maleTime);
var female = new Person("Jane", femaleTime);

var matchReport = MatchReportFactory.GetNewMatchReport(male, female, "userId");
Console.WriteLine($"Kuta Score: {matchReport.KutaScore}/36");
```

### For Numerology:
```csharp
// C# Code (VedAstro)
var birthNumber = Calculate.BirthNumber(birthTime);
var destinyNumber = Calculate.DestinyNumber(birthTime);
var nameNumber = Calculate.NameNumber("John Doe");
var prediction = Calculate.NameNumberPrediction("John Doe");
```

---

## 📞 Support

For questions about VedAstro integration:
- **Slack**: https://join.slack.com/t/vedastro/shared_invite/...
- **GitHub Issues**: https://github.com/VedAstro/VedAstro/issues
- **Email**: Contact through vedastro.org

---

**Created**: 2025-12-12  
**Last Updated**: 2025-12-12  
**Version**: 1.0
