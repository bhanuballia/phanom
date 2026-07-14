import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { User, Calendar, Sparkles, Calculator, BookOpen } from 'lucide-react';

const Numerology = () => {
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: ''
  });
  
  const [numerologyReport, setNumerologyReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateNumerology = (name, dob) => {
    // Remove spaces and convert to uppercase for consistent calculation
    const cleanName = name.replace(/\s+/g, '').toUpperCase();
    
    // Calculate name number (Pythagorean system)
    let nameNumber = 0;
    for (let i = 0; i < cleanName.length; i++) {
      const charCode = cleanName.charCodeAt(i) - 64; // A=1, B=2, etc.
      if (charCode >= 1 && charCode <= 26) {
        nameNumber += charCode;
      }
    }
    
    // Reduce to single digit (1-9) or master numbers (11, 22)
    while (nameNumber > 9 && nameNumber !== 11 && nameNumber !== 22) {
      nameNumber = nameNumber.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    
    // Calculate destiny number from birth date
    const dobParts = dob.split('-');
    if (dobParts.length !== 3) return null;
    
    let destinyNumber = 0;
    for (let part of dobParts) {
      destinyNumber += parseInt(part) || 0;
    }
    
    // Reduce to single digit (1-9) or master numbers (11, 22)
    while (destinyNumber > 9 && destinyNumber !== 11 && destinyNumber !== 22) {
      destinyNumber = destinyNumber.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    
    return { nameNumber, destinyNumber };
  };

  const getNumerologyMeaning = (number) => {
    const meanings = {
      1: {
        title: "The Leader",
        traits: ["Independent", "Ambitious", "Innovative", "Confident"],
        description: "You are a natural leader with strong willpower and determination. You excel at initiating projects and standing out from the crowd.",
        career: "Management, entrepreneurship, politics, sports",
        compatibility: [1, 3, 5, 7]
      },
      2: {
        title: "The Diplomat",
        traits: ["Cooperative", "Sensitive", "Harmonious", "Intuitive"],
        description: "You are a peacemaker who values harmony and cooperation. You have excellent diplomatic skills and are naturally intuitive.",
        career: "Counseling, diplomacy, arts, partnerships",
        compatibility: [2, 4, 6, 8]
      },
      3: {
        title: "The Creative",
        traits: ["Expressive", "Optimistic", "Sociable", "Imaginative"],
        description: "You are naturally creative and expressive with a joyful outlook on life. Communication and self-expression come easily to you.",
        career: "Writing, acting, teaching, media, arts",
        compatibility: [1, 3, 5, 7]
      },
      4: {
        title: "The Builder",
        traits: ["Practical", "Organized", "Reliable", "Hardworking"],
        description: "You are grounded and practical with strong organizational skills. You value stability and work diligently to build solid foundations.",
        career: "Engineering, construction, accounting, project management",
        compatibility: [2, 4, 6, 8]
      },
      5: {
        title: "The Adventurer",
        traits: ["Adaptable", "Curious", "Freedom-loving", "Versatile"],
        description: "You thrive on change and new experiences. Your adaptability and curiosity make you excellent at navigating life's twists and turns.",
        career: "Travel, sales, journalism, marketing, technology",
        compatibility: [1, 3, 5, 7]
      },
      6: {
        title: "The Nurturer",
        traits: ["Responsible", "Compassionate", "Harmonious", "Protective"],
        description: "You are naturally caring and responsible with a strong sense of duty. You excel at creating harmony and nurturing others.",
        career: "Healthcare, teaching, counseling, social work",
        compatibility: [2, 4, 6, 8]
      },
      7: {
        title: "The Seeker",
        traits: ["Analytical", "Spiritual", "Observant", "Introspective"],
        description: "You are deeply analytical and have a strong desire for knowledge and understanding. You value solitude and introspection.",
        career: "Research, science, philosophy, spirituality, technology",
        compatibility: [1, 3, 5, 7]
      },
      8: {
        title: "The Powerhouse",
        traits: ["Ambitious", "Organized", "Practical", "Authoritative"],
        description: "You have strong business acumen and the ability to manifest abundance. You are naturally authoritative and goal-oriented.",
        career: "Business, finance, management, real estate",
        compatibility: [2, 4, 6, 8]
      },
      9: {
        title: "The Humanitarian",
        traits: ["Compassionate", "Idealistic", "Selfless", "Creative"],
        description: "You are driven by a desire to make the world a better place. You are naturally compassionate and have a global perspective.",
        career: "Humanitarian work, arts, healing, counseling",
        compatibility: [1, 3, 5, 7]
      },
      11: {
        title: "The Visionary",
        traits: ["Intuitive", "Inspiring", "Sensitive", "Idealistic"],
        description: "You are a master teacher with powerful intuition and spiritual insight. You have the potential to inspire and illuminate others.",
        career: "Spirituality, counseling, arts, teaching, healing",
        compatibility: [1, 3, 5, 7, 11, 22]
      },
      22: {
        title: "The Master Builder",
        traits: ["Visionary", "Practical", "Powerful", "Organized"],
        description: "You are a master builder who can turn grand visions into reality. You combine spiritual insight with practical skills.",
        career: "Architecture, large-scale projects, leadership, humanitarian work",
        compatibility: [2, 4, 6, 8, 11, 22]
      }
    };
    
    return meanings[number] || meanings[1]; // Default to 1 if not found
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate required fields
    if (!formData.name || !formData.dateOfBirth) {
      setError('Please fill in both your name and date of birth');
      setLoading(false);
      return;
    }
    
    try {
      const targetUrl = `http://localhost:5173/?numerology=true&name=${encodeURIComponent(formData.name)}&date=${encodeURIComponent(formData.dateOfBirth)}`;
      window.open(targetUrl, '_blank');
    } catch (err) {
      setError('Error redirecting to Numerology Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      dateOfBirth: ''
    });
    setNumerologyReport(null);
    setError('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/num1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
      </div>

      <Navigation />
      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 pt-20">
        {/* Header Section */}
        <section className="relative mb-10 p-8 rounded-[32px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_30px_80px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col lg:flex-row items-center gap-8">
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex-1 space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/5 border border-black/10 mb-3">
              <BookOpen className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-black/70">Pythagorean System</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black">
              Numerology <span className="text-yellow-500">Report</span>
            </h1>
            <p className="text-black/80 text-lg">
              Discover the mystical numbers that influence your life path and destiny through ancient numerological calculations.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-xs uppercase tracking-[0.3em] text-black">
              <span className="px-4 py-2 rounded-full bg-black/5">Name Number</span>
              <span className="px-4 py-2 rounded-full bg-black/5">Destiny Number</span>
              <span className="px-4 py-2 rounded-full bg-black/5">Life Path</span>
            </div>
          </div>
          <div className="relative z-10 flex-1 w-full grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">System</p>
              <p className="text-3xl font-bold text-black">1-9</p>
              <p className="text-black/70 text-sm">Core numbers + Master 11, 22</p>
            </div>
            <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Analysis</p>
              <p className="text-3xl font-bold text-black">2</p>
              <p className="text-black/70 text-sm">Name & Destiny numbers</p>
            </div>
            <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg col-span-2">
              <p className="text-xs uppercase tracking-[0.4em] text-black/60 mb-2">Insights</p>
              <p className="text-black">
                Get detailed personality traits, career guidance, compatibility numbers, and life purpose analysis.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-md relative overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Calculator className="h-6 w-6 mr-2 text-yellow-500" />
                  Your Information
                </h2>
              
              {!numerologyReport ? (
                <form onSubmit={handleSubmit} className="flex flex-col">
                  <div className="flex flex-col space-y-6 mb-8">
                    <div className="flex flex-col space-y-2">
                      <label className="block text-gray-700 font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <label className="block text-gray-700 font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 flex items-center justify-center disabled:opacity-70"
                    >
                      {loading ? (
                        <>
                          <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                          Calculating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Report
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-full border border-gray-300 hover:border-gray-400 transition-all duration-300 flex items-center justify-center"
                    >
                      <Calendar className="h-5 w-5 mr-2" />
                      Reset Form
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col space-y-6">
                  <div className="flex flex-col items-center justify-center text-center">
                    <h3 className="flex items-center justify-center text-2xl font-bold text-gray-800 mb-2">Your Numerology Report</h3>
                    <p className="flex items-center justify-center text-gray-600">Based on your name and birth date</p>
                  </div>
                  
                  {/* Name Number */}
                  <div className="bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    {/* Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
                    <div className="relative z-10">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Name Number: {numerologyReport.nameNumber}</h4>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">{numerologyReport.nameMeaning.title}</h5>
                    <p className="text-gray-600 mb-4">{numerologyReport.nameMeaning.description}</p>
                    
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-700 mb-2">Key Traits:</h6>
                      <div className="flex flex-wrap gap-2">
                        {numerologyReport.nameMeaning.traits.map((trait, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <h6 className="font-semibold text-gray-700 mb-2">Career Paths:</h6>
                        <p className="text-gray-600 text-sm">{numerologyReport.nameMeaning.career}</p>
                      </div>
                      <div className="flex flex-col">
                        <h6 className="font-semibold text-gray-700 mb-2">Compatibility Numbers:</h6>
                        <p className="text-gray-600 text-sm">{numerologyReport.nameMeaning.compatibility.join(', ')}</p>
                      </div>
                    </div>
                    </div>
                  </div>
                  
                  {/* Destiny Number */}
                  <div className="bg-gray-50/90 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    {/* Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
                    <div className="relative z-10">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">Destiny Number: {numerologyReport.destinyNumber}</h4>
                    <h5 className="text-lg font-semibold text-gray-800 mb-2">{numerologyReport.destinyMeaning.title}</h5>
                    <p className="text-gray-600 mb-4">{numerologyReport.destinyMeaning.description}</p>
                    
                    <div className="mb-4">
                      <h6 className="font-semibold text-gray-700 mb-2">Key Traits:</h6>
                      <div className="flex flex-wrap gap-2">
                        {numerologyReport.destinyMeaning.traits.map((trait, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {trait}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <h6 className="font-semibold text-gray-700 mb-2">Career Paths:</h6>
                        <p className="text-gray-600 text-sm">{numerologyReport.destinyMeaning.career}</p>
                      </div>
                      <div className="flex flex-col">
                        <h6 className="font-semibold text-gray-700 mb-2">Compatibility Numbers:</h6>
                        <p className="text-gray-600 text-sm">{numerologyReport.destinyMeaning.compatibility.join(', ')}</p>
                      </div>
                    </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-full border border-gray-300 hover:border-gray-400 transition-all duration-300"
                    >
                      Generate Another Report
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col space-y-6">
            {/* What is Numerology */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4">What is Numerology?</h3>
                <div className="flex flex-col space-y-4">
                  <p className="text-gray-600">
                    Numerology is the study of the mystical relationship between numbers and physical objects or living things. 
                    It's based on the belief that numbers have divine, spiritual, or mystical meanings.
                  </p>
                  <p className="text-gray-600">
                    In numerology, each number is associated with specific characteristics, energies, and influences that can 
                    provide insight into personality, life purpose, and destiny.
                  </p>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4">How Numerology Works</h3>
                <ul className="flex flex-col text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Your Name Number reveals your personality traits and characteristics
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Your Destiny Number shows your life path and purpose
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Each number has unique vibrations and meanings
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Master numbers (11, 22) have special significance
                  </li>
                </ul>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              {/* Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-orange-500/5 opacity-50 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Benefits of Numerology</h3>
                <ul className="flex flex-col text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Gain deeper self-understanding
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Discover your strengths and weaknesses
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Understand your life purpose
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    Improve relationships through compatibility
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Numerology;