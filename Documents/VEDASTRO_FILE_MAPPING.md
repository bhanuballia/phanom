# VedAstro File Mapping & Dependencies

## 📁 Complete File Structure

### 🎯 KUNDALI PAGE FILES

#### Primary Calculation Files:
```
Source: VedAstro-master/Library/Logic/Calculate/

Core.cs (154 KB, 3,739 lines)
├── Dependencies:
│   ├── SwissEphNet (NuGet package)
│   ├── Time.cs
│   ├── GeoLocation.cs
│   ├── PlanetName.cs
│   ├── House.cs
│   └── ZodiacSign.cs
│
├── Key Methods:
│   ├── AllPlanetLongitude(Time) → List<PlanetLongitude>
│   ├── AllHouseLongitudes(Time) → List<House>
│   ├── PlanetRasiD1Sign(PlanetName, Time) → ZodiacSign
│   ├── LagnaSignName(Time) → ZodiacName
│   ├── MoonSignName(Time) → ZodiacName
│   ├── MoonConstellation(Time) → Constellation
│   ├── PlanetConstellation(PlanetName, Time) → Constellation
│   ├── LunarDay(Time) → LunarDay
│   ├── NithyaYoga(Time) → NithyaYoga
│   ├── Karana(Time) → Karana
│   ├── SunSign(Time) → ZodiacSign
│   ├── PlanetsInHouse(HouseName, Time) → List<PlanetName>
│   ├── HousesOwnedByPlanet(PlanetName, Time) → List<HouseName>
│   ├── LordOfConstellation(ConstellationName) → PlanetName
│   ├── IsDayBirth(Time) → bool
│   ├── IsNightBirth(Time) → bool
│   └── Tarabala(Time, Person) → Tarabala
│
└── Used For:
    ├── Birth chart generation
    ├── Planet positions
    ├── House cusps
    ├── Ascendant calculation
    └── Panchang data

Vargas.cs (243 KB, 243,227 lines)
├── Dependencies:
│   ├── Core.cs
│   ├── Time.cs
│   └── PlanetName.cs
│
├── Key Methods:
│   ├── PlanetRasiD1(PlanetName, Time) → Angle
│   ├── PlanetNavamsaD9(PlanetName, Time) → ZodiacSign
│   ├── PlanetDrekkanaD3(PlanetName, Time) → ZodiacSign
│   ├── PlanetHoraD2(PlanetName, Time) → ZodiacSign
│   ├── PlanetChaturtamsaD4(PlanetName, Time) → ZodiacSign
│   ├── PlanetSaptamsaD7(PlanetName, Time) → ZodiacSign
│   ├── PlanetDasamasaD10(PlanetName, Time) → ZodiacSign
│   ├── PlanetDwadasamsaD12(PlanetName, Time) → ZodiacSign
│   └── ... (up to D60)
│
└── Used For:
    ├── Divisional charts (D1-D60)
    ├── Navamsa chart (D9)
    ├── Strength analysis
    └── Detailed predictions

Ashtakavarga.cs (22 KB, 21,982 lines)
├── Dependencies:
│   ├── Core.cs
│   ├── Time.cs
│   └── PlanetName.cs
│
├── Key Methods:
│   ├── BhinnashtakavargaBindu(PlanetName, ZodiacName, Time) → int
│   ├── SarvashtakavargaBindu(ZodiacName, Time) → int
│   └── PlanetAshtakavargaScore(PlanetName, Time) → int
│
└── Used For:
    ├── Ashtakavarga points
    ├── Planet strength
    └── Transit predictions

VimshottariDasa.cs (90 KB, 90,053 lines)
├── Dependencies:
│   ├── Core.cs
│   ├── Time.cs
│   └── Person.cs
│
├── Key Methods:
│   ├── CurrentDasa(Time, Person) → Dasa
│   ├── CurrentBhukti(Time, Person) → Dasa
│   ├── CurrentAntaram(Time, Person) → Dasa
│   └── AllDasaInLifeChart(Person) → List<Dasa>
│
└── Used For:
    ├── Dasha periods
    ├── Bhukti periods
    ├── Life predictions
    └── Timeline events
```

#### Data Model Files:
```
Source: VedAstro-master/Library/Data/

Person.cs (15 KB)
├── Properties:
│   ├── Name: string
│   ├── BirthTime: Time
│   ├── Gender: Gender
│   ├── Notes: string
│   └── Id: string
│
└── Methods:
    ├── GetHashCode()
    └── Equals()

Time.cs (24 KB)
├── Properties:
│   ├── StdTime: DateTimeOffset
│   ├── GeoLocation: GeoLocation
│   ├── StdDate: int
│   ├── StdMonth: int
│   ├── StdYear: int
│   └── StdHour: int
│
└── Methods:
    ├── AddHours(double)
    ├── SubtractHours(double)
    ├── AddDays(int)
    └── Subtract(Time)

GeoLocation.cs (13 KB)
├── Properties:
│   ├── Name: string
│   ├── Longitude: double
│   ├── Latitude: double
│   └── TimeZone: string
│
└── Static Locations:
    ├── Bangalore
    ├── Mumbai
    ├── Delhi
    └── ... (many more)

House.cs (4 KB)
├── Properties:
│   ├── HouseName: HouseName
│   ├── BeginLongitude: Angle
│   ├── MiddleLongitude: Angle
│   └── EndLongitude: Angle
│
└── Methods:
    ├── GetHouseName()
    └── IsLongitudeInHouseRange(Angle)

PlanetName.cs (13 KB)
├── Enum Values:
│   ├── Sun, Moon, Mars, Mercury
│   ├── Jupiter, Venus, Saturn
│   ├── Rahu, Ketu
│   └── Empty
│
└── Extension Methods:
    ├── GetPlanetNumber()
    ├── GetName()
    └── IsBenefic()

Constellation.cs (4 KB)
├── Properties:
│   ├── ConstellationName
│   ├── Quarter (1-4)
│   └── Degrees
│
└── Methods:
    ├── GetConstellationName()
    ├── GetConstellationNumber()
    └── GetLunarDayGroup()

Angle.cs (9 KB)
├── Properties:
│   ├── TotalDegrees: double
│   ├── TotalMinutes: double
│   ├── TotalSeconds: double
│   └── DegreeMinuteSecond: string
│
└── Methods:
    ├── Normalize360()
    ├── Add(Angle)
    └── Subtract(Angle)
```

---

### 🎯 KUNDALI MATCHING PAGE FILES

#### Primary Matching File:
```
Source: VedAstro-master/Library/Logic/Factory/

MatchReportFactory.cs (90 KB, 2,112 lines)
├── Dependencies:
│   ├── Core.cs
│   ├── Person.cs
│   ├── Time.cs
│   ├── MatchReport.cs
│   └── MatchPrediction.cs
│
├── Main Method:
│   └── GetNewMatchReport(Person male, Person female, string userId)
│       ├── Returns: MatchReport
│       ├── Kuta Score: 0-36
│       └── Compatibility: List<MatchPrediction>
│
├── Kuta Calculators (16 total):
│   ├── 1. Varna(male, female) → MatchPrediction [1 point]
│   │   └── Spiritual compatibility
│   │
│   ├── 2. VasyaKuta(male, female) → MatchPrediction [2 points]
│   │   └── Mutual attraction
│   │
│   ├── 3. DinaKuta(male, female) → MatchPrediction [3 points]
│   │   └── Daily harmony
│   │
│   ├── 4. YoniKuta(male, female) → MatchPrediction [4 points]
│   │   └── Sexual compatibility
│   │
│   ├── 5. GrahaMaitram(male, female) → MatchPrediction [5 points]
│   │   └── Planetary friendship
│   │
│   ├── 6. GunaKuta(male, female) → MatchPrediction [6 points]
│   │   └── Temperament compatibility
│   │
│   ├── 7. RasiKuta(male, female) → MatchPrediction [7 points]
│   │   └── Sign compatibility
│   │
│   ├── 8. NadiKuta(male, female) → MatchPrediction [8 points]
│   │   └── Health/progeny compatibility
│   │
│   ├── 9. Rajju(male, female) → MatchPrediction [No points]
│   │   └── Longevity check
│   │
│   ├── 10. Mahendra(male, female) → MatchPrediction [No points]
│   │   └── Well-being check
│   │
│   ├── 11. StreeDeergha(male, female) → MatchPrediction [No points]
│   │   └── Prosperity check
│   │
│   ├── 12. VedhaKuta(male, female) → MatchPrediction [No points]
│   │   └── Obstruction check
│   │
│   ├── 13. LagnaAndHouse7Good(male, female) → MatchPrediction
│   │   └── 7th house analysis
│   │
│   ├── 14. KujaDosa(male, female) → MatchPrediction
│   │   └── Mangal Dosha check
│   │
│   ├── 15. BadConstellations(male, female) → MatchPrediction
│   │   └── Inauspicious Nakshatra check
│   │
│   └── 16. SexEnergy(male, female) → MatchPrediction
│       └── Sexual energy compatibility
│
├── Exception Handlers:
│   ├── streeDeerghaException()
│   ├── rajjuException()
│   └── nadiKutaException()
│
└── Helper Methods:
    ├── CalculateTotalPoints(MatchReport) → double
    └── CalculateEmbeddings(MatchReport) → double[]
```

#### Data Model Files:
```
Source: VedAstro-master/Library/Data/

MatchReport.cs (7 KB)
├── Properties:
│   ├── Id: string
│   ├── Male: Person
│   ├── Female: Person
│   ├── KutaScore: double (0-100%)
│   ├── Summary: string
│   ├── PredictionList: List<MatchPrediction>
│   ├── Embeddings: double[]
│   └── UserIds: string[]
│
└── Methods:
    └── GetCompatibilityLevel()

MatchPrediction.cs (3 KB)
├── Properties:
│   ├── Name: MatchPredictionName
│   ├── Description: string
│   ├── Nature: EventNature (Good/Bad/Neutral)
│   ├── Info: string
│   ├── MaleInfo: string
│   └── FemaleInfo: string
│
└── Static:
    └── Empty: MatchPrediction

PersonKutaScore.cs (2 KB)
└── Properties:
    ├── PersonId: string
    └── KutaScores: Dictionary<string, double>
```

---

### 🎯 ZODIAC SIGN PAGE FILES

#### Required Files:
```
Source: VedAstro-master/Library/Logic/Calculate/

Core.cs (already listed above)
├── SunSign(Time) → ZodiacSign
├── MoonSignName(Time) → ZodiacName
├── LagnaSignName(Time) → ZodiacName
└── PlanetRasiD1Sign(PlanetName, Time) → ZodiacSign

Source: VedAstro-master/Library/Data/

ZodiacSign.cs (Not in provided files, but referenced)
├── Properties:
│   ├── SignName: ZodiacName
│   ├── DegreesIn: Angle
│   └── Element: Element
│
└── Methods:
    ├── GetSignName()
    ├── GetDegreesInSign()
    └── GetSignLord()

PlanetSign.cs (3 KB)
├── Properties:
│   ├── Planet: PlanetName
│   ├── Sign: ZodiacSign
│   └── Relationship: PlanetToSignRelationship
│
└── Methods:
    └── GetRelationship()

Enum/ZodiacName.cs
└── Values:
    ├── Aries (1)
    ├── Taurus (2)
    ├── Gemini (3)
    ├── Cancer (4)
    ├── Leo (5)
    ├── Virgo (6)
    ├── Libra (7)
    ├── Scorpio (8)
    ├── Sagittarius (9)
    ├── Capricorn (10)
    ├── Aquarius (11)
    └── Pisces (12)
```

---

### 🎯 NUMEROLOGY PAGE FILES

#### Primary Numerology File:
```
Source: VedAstro-master/Library/Logic/Calculate/

Numerology.cs (77 KB, 367 lines)
├── Dependencies:
│   ├── Time.cs
│   ├── NumerologyPrediction.cs
│   └── System.Text.RegularExpressions
│
├── Main Methods:
│   ├── BirthNumber(Time birthTime) → int (1-9)
│   │   ├── Input: Birth date (1-31)
│   │   ├── Process: Sum digits until single digit
│   │   └── Output: Birth number
│   │
│   ├── DestinyNumber(Time birthTime) → int (1-9)
│   │   ├── Input: Full birth date (DD/MM/YYYY)
│   │   ├── Process: Sum all digits until single digit
│   │   └── Output: Destiny number
│   │
│   ├── NameNumber(string inputText) → int
│   │   ├── Input: Full name or house number
│   │   ├── Process: Chaldean numerology system
│   │   ├── Handles:
│   │   │   ├── Pure numbers (house numbers)
│   │   │   ├── Mixed alphanumeric (32A, MH370)
│   │   │   └── Full names with initials
│   │   └── Output: Name number (can be 3+ digits)
│   │
│   └── NameNumberPrediction(string fullName) → NumerologyPrediction
│       ├── Input: Full name
│       ├── Process: Calculate name number, match prediction
│       ├── Database: 108 predictions (10-108)
│       └── Output: Detailed prediction with life aspects
│
├── Chaldean Alphabet Scoring:
│   ├── Regular Letters:
│   │   ├── a,i,j,q,y = 1
│   │   ├── b,k,r = 2
│   │   ├── c,g,l,s = 3
│   │   ├── d,m,t = 4
│   │   ├── e,h,n,x = 5
│   │   ├── u,v,w = 6
│   │   ├── o,z = 7
│   │   └── f,p = 8
│   │
│   └── Initial Letters (when alone):
│       ├── i,j,y = 10
│       ├── k = 20
│       ├── l,s = 30
│       ├── m = 40
│       ├── n = 50
│       ├── o = 70
│       ├── p = 80
│       ├── q = 100
│       ├── r = 200
│       └── t = 400
│
└── Prediction Database (108 entries):
    ├── Organized by Planet:
    │   ├── Sun (1): 10,19,28,37,46,55,64,73,82,91,100
    │   ├── Moon (2): 11,20,29,38,47,56,65,74,83,92,101
    │   ├── Jupiter (3): 3,12,21,30,39,48,57,66,75,84,93,102
    │   ├── Rahu (4): 4,13,22,31,40,49,58,67,76,85,94,103
    │   ├── Mercury (5): 5,14,23,32,41,50,59,68,77,86,95,104
    │   ├── Venus (6): 6,15,24,33,42,51,60,69,78,87,96,105
    │   ├── Ketu (7): 7,16,25,34,43,52,61,70,79,88,97,106
    │   ├── Saturn (8): 8,17,26,35,44,53,62,71,80,89,98,107
    │   └── Mars (9): 9,18,27,36,45,54,63,72,81,90,99,108
    │
    └── Each Prediction Contains:
        ├── Planet: PlanetName
        ├── Number: int
        ├── Description: string (detailed prediction)
        └── LifeAspects: Dictionary<LifeAspect, int>
            ├── Finance: 0-100
            ├── Romance: 0-100
            ├── Education: 0-100
            └── Health: 0-100
```

#### Data Model Files:
```
Source: VedAstro-master/Library/Data/

NumerologyPrediction.cs (1 KB)
├── Constructor:
│   └── NumerologyPrediction(PlanetName, int, string, Dictionary<LifeAspect, int>)
│
└── Properties:
    ├── Planet: PlanetName
    ├── Number: int
    ├── Prediction: string
    └── LifeAspectScores: Dictionary<LifeAspect, int>
```

---

## 🔗 Shared Dependencies

### Core Infrastructure Files:
```
VedAstro-master/Library/Logic/

Tools.cs (167 KB)
├── Utility functions
├── String formatting
├── Date/time helpers
├── Calculation helpers
└── Validation methods

Format.cs (1 KB)
├── FormatName(string)
└── Text formatting utilities

Algorithms.cs (11 KB)
├── Mathematical algorithms
├── Astronomical calculations
└── Conversion utilities

CacheManager.cs (14 KB)
├── GetCache(CacheKey, Func)
└── Performance optimization

LogManager.cs (8 KB)
└── Logging utilities
```

### Location Services:
```
VedAstro-master/Library/Logic/Calculate/

LocationManager.cs (88 KB)
├── GetCoordinates(string location)
├── GetTimezone(double lat, double lon)
├── GeoLocationDatabase
└── Timezone conversions
```

---

## 📦 External Dependencies

### NuGet Packages Required:
```xml
<PackageReference Include="SwissEphNet" Version="3.0.0" />
<PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
<PackageReference Include="System.Text.Json" Version="7.0.0" />
```

### Swiss Ephemeris Data Files:
```
Required ephemeris files (*.se1):
├── sepl_18.se1    # Planets 1800-2399
├── semo_18.se1    # Moon 1800-2399
├── seas_18.se1    # Asteroids 1800-2399
└── ... (additional century files)

Location: VedAstro-master/Library/Data/Ephemeris/
```

---

## 🎯 File Size Summary

### By Feature:

**Kundali Page:**
- Core.cs: 154 KB
- Vargas.cs: 243 KB
- Ashtakavarga.cs: 22 KB
- VimshottariDasa.cs: 90 KB
- **Total: ~509 KB**

**Kundali Matching:**
- MatchReportFactory.cs: 90 KB
- MatchReport.cs: 7 KB
- MatchPrediction.cs: 3 KB
- **Total: ~100 KB**

**Zodiac Signs:**
- Core.cs: (shared)
- ZodiacSign.cs: ~5 KB
- PlanetSign.cs: 3 KB
- **Total: ~8 KB (+ shared)**

**Numerology:**
- Numerology.cs: 77 KB
- NumerologyPrediction.cs: 1 KB
- **Total: ~78 KB**

**Shared Infrastructure:**
- Tools.cs: 167 KB
- LocationManager.cs: 88 KB
- Other utilities: ~50 KB
- **Total: ~305 KB**

**Grand Total: ~1 MB of C# code**

---

## 🔄 Data Flow Diagram

```
User Input (React Frontend)
    ↓
API Request (Node.js Backend)
    ↓
VedAstro API (.NET Core)
    ↓
┌─────────────────────────────────┐
│  Calculate.cs Methods           │
│  ├── Core.cs                    │
│  ├── Vargas.cs                  │
│  ├── Numerology.cs              │
│  └── MatchReportFactory.cs      │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│  Swiss Ephemeris                │
│  ├── Planet positions           │
│  ├── House calculations         │
│  └── Astronomical data          │
└─────────────────────────────────┘
    ↓
JSON Response
    ↓
React Frontend Display
```

---

## ✅ Extraction Checklist

### For Kundali:
- [ ] Core.cs
- [ ] Vargas.cs
- [ ] Ashtakavarga.cs
- [ ] VimshottariDasa.cs
- [ ] Person.cs
- [ ] Time.cs
- [ ] GeoLocation.cs
- [ ] House.cs
- [ ] PlanetName.cs
- [ ] Constellation.cs
- [ ] Angle.cs
- [ ] Tools.cs
- [ ] LocationManager.cs
- [ ] SwissEphNet package
- [ ] Ephemeris data files

### For Kundali Matching:
- [ ] MatchReportFactory.cs
- [ ] MatchReport.cs
- [ ] MatchPrediction.cs
- [ ] PersonKutaScore.cs
- [ ] All Kundali dependencies (above)

### For Zodiac Signs:
- [ ] Core.cs (SunSign, MoonSignName methods)
- [ ] ZodiacSign.cs
- [ ] PlanetSign.cs
- [ ] Enum/ZodiacName.cs
- [ ] Basic dependencies

### For Numerology:
- [ ] Numerology.cs
- [ ] NumerologyPrediction.cs
- [ ] Time.cs
- [ ] Basic utilities

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-12  
**Total Files Mapped**: 40+
