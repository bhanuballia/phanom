import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, Compass, Wind, Droplet, Flame, Mountain, Phone, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import Navigation from '../components/Navigation';

const VastuShastra = () => {
    const directions = [
        { name: 'North', color: 'from-blue-500 to-cyan-500', icon: '↑' },
        { name: 'Northeast', color: 'from-purple-500 to-pink-500', icon: '↗' },
        { name: 'East', color: 'from-yellow-500 to-orange-500', icon: '→' },
        { name: 'Southeast', color: 'from-red-500 to-orange-500', icon: '↘' },
        { name: 'South', color: 'from-red-500 to-pink-500', icon: '↓' },
        { name: 'Southwest', color: 'from-purple-500 to-indigo-500', icon: '↙' },
        { name: 'West', color: 'from-indigo-500 to-blue-500', icon: '←' },
        { name: 'Northwest', color: 'from-teal-500 to-cyan-500', icon: '↖' }
    ];

    const elements = [
        { name: 'Earth', icon: Mountain, color: 'from-yellow-600 to-amber-700', description: 'Stability and grounding' },
        { name: 'Water', icon: Droplet, color: 'from-blue-500 to-cyan-600', description: 'Flow and prosperity' },
        { name: 'Air', icon: Wind, color: 'from-sky-400 to-blue-500', description: 'Movement and freshness' },
        { name: 'Fire', icon: Flame, color: 'from-orange-500 to-red-600', description: 'Energy and transformation' },
        { name: 'Space', icon: Compass, color: 'from-purple-500 to-indigo-600', description: 'Openness and potential' }
    ];

    const roomTips = [
        {
            room: 'Main Entrance',
            direction: 'North, East, or Northeast',
            tips: [
                'Door should open inward',
                'Keep area clean and clutter-free',
                'Place Swastik or Ganesha symbol',
                'Avoid dustbins or obstacles directly outside'
            ],
            hindi: 'मुख्य द्वार पूर्व या उत्तर दिशा में होना सबसे शुभ माना जाता है'
        },
        {
            room: 'Kitchen',
            direction: 'Southeast (Agneya)',
            tips: [
                'Stove and sink should not be adjacent',
                'Store grains in south or west',
                'Use light colors like yellow, orange, or red',
                'Keep rice/wheat container for prosperity'
            ],
            hindi: 'रसोईघर हमेशा दक्षिण-पूर्व दिशा में होना चाहिए'
        },
        {
            room: 'Bedroom',
            direction: 'Southwest',
            tips: [
                'Sleep with head towards south or east',
                'Avoid mirrors facing the bed',
                'Minimize electronics',
                'Keep room clutter-free'
            ],
            hindi: 'शयनकक्ष दक्षिण-पश्चिम दिशा में बनाना चाहिए'
        },
        {
            room: 'Pooja Room',
            direction: 'Northeast (Ishan)',
            tips: [
                'Idols should face east or west',
                'Not in bedroom or under stairs',
                'Keep clean and sacred',
                'Light lamp daily'
            ],
            hindi: 'पूजा घर हमेशा घर के उत्तर-पूर्व में ही होना चाहिए'
        },
        {
            room: 'Bathroom/Toilet',
            direction: 'Northwest',
            tips: [
                'Keep door always closed',
                'Water drainage towards north or east',
                'Not in northeast or center',
                'Maintain cleanliness'
            ],
            hindi: 'बाथरूम का दरवाज़ा हमेशा बंद रखना चाहिए'
        }
    ];

    const generalTips = [
        {
            title: 'Water Elements',
            icon: Droplet,
            tips: [
                'Place aquarium or fountain in northeast',
                'Ensure drainage flows north or east',
                'Keep water features clean',
                'Attracts wealth and prosperity'
            ],
            hindi: 'उत्तर-पूर्व कोने में पानी का फव्वारा रखना शुभ है'
        },
        {
            title: 'Plants & Greenery',
            icon: Mountain,
            tips: [
                'Tulsi plant in north, northeast, or east',
                'Avoid thorny plants indoors (except roses)',
                'Remove dead or dried plants immediately',
                'Fresh flowers bring positive energy'
            ],
            hindi: 'तुलसी का पौधा सकारात्मक ऊर्जा का स्रोत है'
        },
        {
            title: 'Staircase',
            icon: HomeIcon,
            tips: [
                'Build in south, southwest, or west',
                'Never in center or northeast',
                'No pooja room under stairs',
                'Can use space below for storage only'
            ],
            hindi: 'सीढ़ियाँ दक्षिण-पश्चिम दिशा में होनी चाहिए'
        },
        {
            title: 'Colors & Lighting',
            icon: Flame,
            tips: [
                'Use light colors for walls',
                'Ensure adequate lighting in all corners',
                'Light entrance and corners in evening',
                'Dark colors bring sadness'
            ],
            hindi: 'हल्के रंगों का उपयोग करें'
        },
        {
            title: 'Home Energy',
            icon: Wind,
            tips: [
                'Maintain cleanliness everywhere',
                'Remove broken items immediately',
                'Use sea salt in mopping water',
                'Keep Brahmasthan (center) empty'
            ],
            hindi: 'घर में हमेशा साफ़-सफाई बनाए रखें'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navigation />

            <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 mb-6">
                            <Compass className="h-12 w-12 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500">
                            Vastu Shastra
                        </h1>
                        <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                            वास्तु शास्त्र - Ancient Indian Architectural Science
                        </p>
                    </div>

                    {/* Banner */}
                    <div className="mb-12">
                        <div className="relative bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 border border-orange-400/30 rounded-2xl px-6 py-4 backdrop-blur-xl shadow-lg shadow-orange-400/20 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-amber-500/5 to-yellow-500/5 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                                <p className="text-center md:text-left text-lg md:text-xl font-semibold text-white">
                                    For more detailed Vastu Tips, Talk to Our Vastu Specialist
                                </p>
                                <Link
                                    to="/astrologers"
                                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105 whitespace-nowrap"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    Consult Now
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Introduction */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl mb-12">
                        <h2 className="text-3xl font-bold mb-6 text-amber-400">What is Vastu Shastra?</h2>
                        <div className="space-y-4 text-slate-200 text-lg leading-relaxed">
                            <p>
                                Vastu Shastra is an ancient Indian architectural science that integrates traditional principles of design, layout, measurements, and spatial geometry to create living and working spaces that are in harmony with nature and universal energies.
                            </p>
                            <p>
                                The term itself comes from Sanskrit: <span className="text-amber-400 font-semibold">"Vastu"</span> means dwelling, and <span className="text-amber-400 font-semibold">"Shastra"</span> means science or doctrine.
                            </p>
                            <p className="text-xl font-semibold text-amber-300">
                                The core aim of Vastu is to balance the five elements of nature—Earth, Water, Air, Fire, and Space (known as "Paanchbhootas")—and align buildings with cardinal directions to enhance health, wealth, prosperity, and happiness for the occupants.
                            </p>
                        </div>
                    </div>

                    {/* Interactive Vastu Analyzer Banner */}
                    <div className="mb-12">
                        <div className="relative bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
                                    Interactive Tool
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
                                    Astro-Vastu Directional Calibrator
                                </h3>
                                <p className="text-slate-300 text-lg italic leading-relaxed">
                                    "Analyze room placements, directional element mapping, and planetary lord charts."
                                </p>
                            </div>
                            <a
                                href="https://pinak-1.onrender.com/?vastu=true"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-full hover:from-indigo-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
                            >
                                <Compass className="h-5 w-5 mr-2" />
                                Start Vastu Analysis
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </a>
                        </div>
                    </div>

                    {/* Five Elements */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center text-amber-400">
                            Five Elements (Paanchbhootas)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            {elements.map((element) => {
                                const IconComponent = element.icon;
                                return (
                                    <div
                                        key={element.name}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all"
                                    >
                                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${element.color} flex items-center justify-center`}>
                                            <IconComponent className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{element.name}</h3>
                                        <p className="text-sm text-slate-400">{element.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Key Principles */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-xl mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-amber-400">Key Principles</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Compass className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Directional Alignment</h3>
                                        <p className="text-slate-300">
                                            Vastu places great importance on the orientation of a building and its rooms in relation to the cardinal directions (North, East, South, West) and sub-directions (Northeast, Southeast, Southwest, Northwest).
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Wind className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Energy Flow</h3>
                                        <p className="text-slate-300">
                                            Vastu aims to maximize the flow of positive energy (prana) and minimize negative energy by optimizing natural light, ventilation, and space arrangement. The center of the house, known as the "Brahmasthan," should ideally be kept empty.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <Mountain className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Five Elements Balance</h3>
                                        <p className="text-slate-300">
                                            The principles are based on ensuring a balance of the five natural elements within the structure. For example, the kitchen (fire element) is often recommended for the southeast direction, and water features for the northeast.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <HomeIcon className="h-6 w-6 text-amber-400 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Design & Materials</h3>
                                        <p className="text-slate-300">
                                            The science includes guidelines on ground preparation, use of materials (preferring wood over metal in certain areas), and the placement of everyday items like mirrors and heavy furniture.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Directional Compass */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center text-amber-400">
                            Cardinal Directions
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {directions.map((dir) => (
                                <div
                                    key={dir.name}
                                    className={`bg-gradient-to-r ${dir.color} rounded-2xl p-6 text-center text-white font-semibold shadow-lg`}
                                >
                                    <div className="text-4xl mb-2">{dir.icon}</div>
                                    <div className="text-lg">{dir.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Room-wise Vastu Tips */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center text-amber-400">
                            Room-wise Vastu Tips
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {roomTips.map((room) => (
                                <div
                                    key={room.room}
                                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-2xl font-semibold text-amber-300">{room.room}</h3>
                                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-semibold">
                                            {room.direction}
                                        </span>
                                    </div>
                                    <p className="text-orange-300 text-sm mb-4 italic">{room.hindi}</p>
                                    <ul className="space-y-2">
                                        {room.tips.map((tip, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-slate-300">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* General Vastu Tips */}
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-center text-amber-400">
                            Additional Vastu Tips
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {generalTips.map((tip) => {
                                const IconComponent = tip.icon;
                                return (
                                    <div
                                        key={tip.title}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                                                <IconComponent className="h-6 w-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold">{tip.title}</h3>
                                        </div>
                                        <p className="text-orange-300 text-sm mb-4 italic">{tip.hindi}</p>
                                        <ul className="space-y-2">
                                            {tip.tips.map((item, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm text-slate-300">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/30 rounded-2xl p-8 mb-12">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="h-8 w-8 text-red-400 flex-shrink-0" />
                            <div>
                                <h3 className="text-2xl font-bold text-red-400 mb-4">Important Vastu Don'ts</h3>
                                <ul className="space-y-3 text-slate-200">
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        <span>Never sleep with head towards north direction</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        <span>Avoid keeping broken clocks, mirrors, or electronics</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        <span>Don't place toilet/bathroom in northeast or center</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        <span>Never build staircase in center (Brahmasthan)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        <span>Avoid keeping dead or dried plants in the house</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-red-400">✗</span>
                                        <span>Don't keep dustbins or shoes near main entrance</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-400/30 rounded-3xl p-12 text-center">
                        <h2 className="text-4xl font-bold mb-4">
                            Need Personalized Vastu Consultation?
                        </h2>
                        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                            Our expert Vastu consultants can analyze your home or office and provide customized solutions to enhance positive energy and prosperity.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/astrologers"
                                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-full hover:from-orange-600 hover:to-amber-600 transition-all transform hover:scale-105"
                            >
                                <Phone className="h-5 w-5 mr-2" />
                                Talk to Vastu Expert
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                            <Link
                                to="/booking"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all"
                            >
                                Book Consultation
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VastuShastra;
