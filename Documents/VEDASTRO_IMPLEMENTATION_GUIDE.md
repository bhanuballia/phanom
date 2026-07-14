# VedAstro Quick Implementation Guide

## 🚀 Quick Start (3 Options)

### Option 1: Use VedAstro's Public API (Easiest - Recommended)

#### Step 1: Test the API
```bash
# Test if API is working
curl "https://vedastroapi.azurewebsites.net/api/Calculate/PlanetName/Sun/Location/Singapore/Time/00:00/24/04/2024/+08:00"
```

#### Step 2: Create API Service in Your Frontend
```javascript
// frontend/src/services/vedastroAPI.js
import axios from 'axios';

const VEDASTRO_API = 'https://vedastroapi.azurewebsites.net/api';

export const vedastroAPI = {
  // Calculate birth chart
  async getKundali(birthData) {
    const { date, time, location, timezone } = birthData;
    const timeString = `${time}/${date}/${timezone}`;
    
    const response = await axios.get(
      `${VEDASTRO_API}/Calculate/AllPlanetData/Location/${location}/Time/${timeString}`
    );
    return response.data;
  },

  // Calculate compatibility
  async getMatchReport(male, female) {
    // Create persons first
    const maleId = await this.createPerson(male);
    const femaleId = await this.createPerson(female);
    
    const response = await axios.get(
      `${VEDASTRO_API}/Calculate/MatchReport/Male/${maleId}/Female/${femaleId}`
    );
    return response.data;
  },

  // Get zodiac sign
  async getZodiacSign(birthData) {
    const { date, time, location, timezone } = birthData;
    const timeString = `${time}/${date}/${timezone}`;
    
    const response = await axios.get(
      `${VEDASTRO_API}/Calculate/MoonSign/Location/${location}/Time/${timeString}`
    );
    return response.data;
  },

  // Helper to create person
  async createPerson(personData) {
    const response = await axios.post(
      `${VEDASTRO_API}/Person/Create`,
      personData
    );
    return response.data.personId;
  }
};
```

#### Step 3: Update Your Components
```javascript
// frontend/src/pages/Kundali.jsx
import { vedastroAPI } from '../services/vedastroAPI';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const birthData = {
      date: formData.date,
      time: formData.time,
      location: `${formData.city},${formData.country}`,
      timezone: formData.timezone
    };

    const kundaliData = await vedastroAPI.getKundali(birthData);
    setKundaliResult(kundaliData);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};
```

---

### Option 2: Self-Host VedAstro API (More Control)

#### Step 1: Clone and Build
```bash
cd "c:\Users\User\Desktop\Astrology - run\VedAstro-master"

# Build the API project
cd API
dotnet restore
dotnet build
```

#### Step 2: Run Locally
```bash
# Run the API on localhost:5000
dotnet run --project API

# Or publish for production
dotnet publish -c Release -o ./publish
```

#### Step 3: Create Docker Container (Optional)
```bash
# Build Docker image
docker build -t vedastro-api .

# Run container
docker run -p 5000:80 vedastro-api
```

#### Step 4: Deploy to Cloud
```bash
# Deploy to Azure
az webapp up --name your-vedastro-api --resource-group your-rg

# Or deploy to Render/Heroku/Railway
# Follow their .NET deployment guides
```

#### Step 5: Update API Base URL
```javascript
// frontend/src/services/vedastroAPI.js
const VEDASTRO_API = 'http://localhost:5000/api'; // or your deployed URL
```

---

### Option 3: Create Custom .NET API Wrapper (Most Flexible)

#### Step 1: Create New .NET API Project
```bash
cd "c:\Users\User\Desktop\Astrology - run"
mkdir VedAstroWrapper
cd VedAstroWrapper

dotnet new webapi -n VedAstroWrapper
cd VedAstroWrapper
```

#### Step 2: Add VedAstro Library Reference
```xml
<!-- VedAstroWrapper.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <!-- Reference VedAstro Library -->
    <ProjectReference Include="..\..\VedAstro-master\Library\Library.csproj" />
    
    <!-- Or use NuGet package -->
    <PackageReference Include="VedAstro.Library" Version="*" />
  </ItemGroup>
</Project>
```

#### Step 3: Create API Controllers
```csharp
// Controllers/KundaliController.cs
using Microsoft.AspNetCore.Mvc;
using VedAstro.Library;

namespace VedAstroWrapper.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class KundaliController : ControllerBase
    {
        [HttpPost("generate")]
        public IActionResult GenerateKundali([FromBody] KundaliRequest request)
        {
            try
            {
                // Parse birth time
                var birthTime = new Time(
                    $"{request.Time} {request.Date} {request.Timezone}",
                    new GeoLocation(request.Location, request.Longitude, request.Latitude)
                );

                // Create person
                var person = new Person(request.Name, birthTime);

                // Calculate all planet positions
                var planets = Calculate.AllPlanetLongitude(birthTime);
                
                // Calculate houses
                var houses = Calculate.AllHouseLongitudes(birthTime);
                
                // Calculate ascendant
                var ascendant = Calculate.LagnaSignName(birthTime);
                
                // Calculate moon sign
                var moonSign = Calculate.MoonSignName(birthTime);
                
                // Calculate birth nakshatra
                var nakshatra = Calculate.MoonConstellation(birthTime);

                // Return result
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        planets = planets.Select(p => new
                        {
                            name = p.GetPlanetName().ToString(),
                            longitude = p.GetPlanetLongitude().TotalDegrees,
                            sign = Calculate.PlanetRasiD1Sign(p.GetPlanetName(), birthTime).GetSignName().ToString()
                        }),
                        houses = houses.Select(h => new
                        {
                            number = h.GetHouseName().ToString(),
                            middleLongitude = h.GetMiddleLongitude().TotalDegrees,
                            sign = Calculate.HouseSignName(h.GetHouseName(), birthTime).ToString()
                        }),
                        ascendant = ascendant.ToString(),
                        moonSign = moonSign.ToString(),
                        nakshatra = nakshatra.ToString()
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }

    public class KundaliRequest
    {
        public string Name { get; set; }
        public string Date { get; set; }
        public string Time { get; set; }
        public string Timezone { get; set; }
        public string Location { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
```

```csharp
// Controllers/MatchingController.cs
using Microsoft.AspNetCore.Mvc;
using VedAstro.Library;

namespace VedAstroWrapper.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchingController : ControllerBase
    {
        [HttpPost("calculate")]
        public IActionResult CalculateMatch([FromBody] MatchRequest request)
        {
            try
            {
                // Create male person
                var maleTime = new Time(
                    $"{request.Male.Time} {request.Male.Date} {request.Male.Timezone}",
                    new GeoLocation("", request.Male.Longitude, request.Male.Latitude)
                );
                var male = new Person(request.Male.Name, maleTime);

                // Create female person
                var femaleTime = new Time(
                    $"{request.Female.Time} {request.Female.Date} {request.Female.Timezone}",
                    new GeoLocation("", request.Female.Longitude, request.Female.Latitude)
                );
                var female = new Person(request.Female.Name, femaleTime);

                // Calculate match report
                var matchReport = MatchReportFactory.GetNewMatchReport(male, female, "userId");

                // Return result
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        kutaScore = matchReport.KutaScore,
                        compatibility = matchReport.KutaScore >= 50 ? "Good" : 
                                       matchReport.KutaScore >= 30 ? "Average" : "Poor",
                        predictions = matchReport.PredictionList.Select(p => new
                        {
                            name = p.Name.ToString(),
                            description = p.Description,
                            nature = p.Nature.ToString(),
                            info = p.Info,
                            maleInfo = p.MaleInfo,
                            femaleInfo = p.FemaleInfo
                        })
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }

    public class MatchRequest
    {
        public PersonData Male { get; set; }
        public PersonData Female { get; set; }
    }

    public class PersonData
    {
        public string Name { get; set; }
        public string Date { get; set; }
        public string Time { get; set; }
        public string Timezone { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}
```

```csharp
// Controllers/NumerologyController.cs
using Microsoft.AspNetCore.Mvc;
using VedAstro.Library;

namespace VedAstroWrapper.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NumerologyController : ControllerBase
    {
        [HttpPost("calculate")]
        public IActionResult CalculateNumerology([FromBody] NumerologyRequest request)
        {
            try
            {
                // Parse birth time
                var birthTime = new Time(
                    $"00:00 {request.Date} +00:00",
                    GeoLocation.Empty
                );

                // Calculate numbers
                var birthNumber = Calculate.BirthNumber(birthTime);
                var destinyNumber = Calculate.DestinyNumber(birthTime);
                var nameNumber = Calculate.NameNumber(request.Name);
                var prediction = Calculate.NameNumberPrediction(request.Name);

                // Return result
                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        birthNumber = birthNumber,
                        destinyNumber = destinyNumber,
                        nameNumber = nameNumber,
                        prediction = new
                        {
                            planet = prediction.Planet.ToString(),
                            number = prediction.Number,
                            description = prediction.Prediction,
                            lifeAspects = prediction.LifeAspectScores
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }
    }

    public class NumerologyRequest
    {
        public string Name { get; set; }
        public string Date { get; set; }
    }
}
```

#### Step 4: Configure CORS
```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:3000") // Your React app URL
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure middleware
app.UseCors("AllowReactApp");
app.UseAuthorization();
app.MapControllers();

app.Run();
```

#### Step 5: Run Your API
```bash
dotnet run
# API will run on http://localhost:5000
```

#### Step 6: Update Frontend to Use Your API
```javascript
// frontend/src/services/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const kundaliAPI = {
  generate: async (data) => {
    const response = await axios.post(`${API_BASE}/kundali/generate`, data);
    return response.data;
  }
};

export const kundaliMatchingAPI = {
  calculate: async (data) => {
    const response = await axios.post(`${API_BASE}/matching/calculate`, data);
    return response.data;
  }
};

export const numerologyAPI = {
  calculate: async (data) => {
    const response = await axios.post(`${API_BASE}/numerology/calculate`, data);
    return response.data;
  }
};
```

---

## 📊 Comparison of Options

| Feature | Option 1 (Public API) | Option 2 (Self-Host) | Option 3 (Custom Wrapper) |
|---------|----------------------|---------------------|--------------------------|
| **Setup Time** | 5 minutes | 30 minutes | 2 hours |
| **Cost** | Free | $5-20/month | $5-20/month |
| **Control** | Low | High | Very High |
| **Customization** | None | Limited | Full |
| **Maintenance** | None | Low | Medium |
| **Performance** | Depends on VedAstro | Good | Excellent |
| **Reliability** | Depends on VedAstro | High | High |
| **Best For** | Quick testing | Production use | Custom features |

---

## 🎯 Recommended Approach

### Phase 1: Quick Start (Week 1)
✅ Use **Option 1** (Public API) to:
- Test VedAstro calculations
- Validate accuracy
- Build frontend UI
- Get user feedback

### Phase 2: Production (Week 2-3)
✅ Implement **Option 3** (Custom Wrapper) to:
- Have full control
- Customize responses
- Add caching
- Optimize performance
- Add your own business logic

### Phase 3: Scale (Month 2+)
✅ Enhance with:
- Database caching
- Rate limiting
- User authentication
- PDF generation
- Email delivery

---

## 🔧 Testing Your Integration

### Test Kundali Calculation:
```javascript
const testData = {
  name: "Test User",
  date: "15/10/2000",
  time: "23:40",
  timezone: "+05:30",
  location: "Bangalore",
  latitude: 12.9716,
  longitude: 77.5946
};

const result = await kundaliAPI.generate(testData);
console.log(result);
```

### Test Matching:
```javascript
const testMatch = {
  male: {
    name: "John",
    date: "15/10/2000",
    time: "23:40",
    timezone: "+05:30",
    latitude: 12.9716,
    longitude: 77.5946
  },
  female: {
    name: "Jane",
    date: "20/05/2001",
    time: "14:30",
    timezone: "+05:30",
    latitude: 12.9716,
    longitude: 77.5946
  }
};

const result = await kundaliMatchingAPI.calculate(testMatch);
console.log(result);
```

### Test Numerology:
```javascript
const testNumerology = {
  name: "John Doe",
  date: "15/10/2000"
};

const result = await numerologyAPI.calculate(testNumerology);
console.log(result);
```

---

## 📝 Next Steps

1. ✅ Choose your integration option
2. ⬜ Set up the API (5 min - 2 hours depending on option)
3. ⬜ Test with sample data
4. ⬜ Update your React components
5. ⬜ Test with real user data
6. ⬜ Deploy to production

---

## 🆘 Troubleshooting

### Common Issues:

**Issue 1: CORS Error**
```javascript
// Solution: Add CORS headers in your API
app.UseCors(options => options.AllowAnyOrigin().AllowAnyMethod());
```

**Issue 2: Swiss Ephemeris Files Missing**
```bash
# Download ephemeris files
# Place in: VedAstro-master/Library/Data/Ephemeris/
```

**Issue 3: Timezone Errors**
```javascript
// Ensure timezone format is correct: "+05:30" or "-08:00"
const timezone = "+05:30"; // IST
```

**Issue 4: Location Not Found**
```javascript
// Use coordinates instead of location name
const location = {
  latitude: 12.9716,
  longitude: 77.5946
};
```

---

## 📞 Support Resources

- **VedAstro Docs**: https://vedastro.org
- **API Reference**: https://vedastroapi.azurewebsites.net
- **GitHub**: https://github.com/VedAstro/VedAstro
- **Slack Community**: https://join.slack.com/t/vedastro/...

---

**Ready to start? Pick Option 1 for quick testing!** 🚀
