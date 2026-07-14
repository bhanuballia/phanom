import React from 'react';
import Navigation from '../components/Navigation';
import { Star, Heart, Users, Shield, Clock, Award } from 'lucide-react';

const AboutUs = () => {
  const values = [
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Sacred Wisdom",
      description: "We honor the ancient traditions of Vedic astrology while embracing modern accessibility."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Expert Guidance",
      description: "Our certified astrologers bring decades of experience in traditional Hindu astrology."
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Confidential & Secure",
      description: "Your personal information and consultations are completely private and protected."
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Available 24/7",
      description: "Connect with astrologers anytime, anywhere for guidance when you need it most."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Clients" },
    { number: "50+", label: "Expert Astrologers" },
    { number: "15+", label: "Years Experience" },
    { number: "98%", label: "Satisfaction Rate" }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Full Page Background Image - Fixed */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          backgroundImage: 'url(/images/om3.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-400/60 via-slate-400/55 to-slate-900/65" />
        {/* Additional overlay for mystical effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/15 via-purple-900/15 to-amber-900/15" />
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Gayatri Mantra Display */}
          <div className="mb-12">
            <div className="glass-card rounded-2xl p-8 mb-8 border border-astro-gold/30 mystical-glow bg-white">
              <p className="text-astro-gold font-hindi text-2xl mb-4 leading-relaxed">
                ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं<br/>
                भर्गो देवस्य धीमहि धियो योनः प्रचोदयात्
              </p>
              <p className="text-gray-700 text-sm italic">
                "We meditate on the glory of the Creator who has created the Universe,<br/>
                who is worthy of Worship, who is the embodiment of Knowledge and Light,<br/>
                who is the remover of all Sin and Ignorance. May He enlighten our Intellect."
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-astro-gold to-divine-orange mx-auto rounded-full mt-4"></div>
            </div>
          </div>
          
          <div className="mb-8">
            <p className="text-astro-gold font-hindi text-xl mb-2">सत्यं शिवं सुन्दरम्</p>
            <p className="text-gray-300 text-sm">Truth, Goodness, Beauty</p>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-cinzel font-bold text-red-700 mb-6">
            About <span className="text-black-300">Our Sacred Journey</span>
          </h1>
          
          <p className="text-xl text-black-200 mb-8 leading-relaxed">
            Founded on the timeless principles of Vedic astrology, we bridge ancient wisdom 
            with modern technology to bring you authentic astrological guidance.
          </p>
          
          <div className="w-24 h-1 bg-gradient-to-r from-astro-gold to-divine-orange mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl font-cinzel font-bold text-white mb-6">
                Our <span className="text-black-300">Divine Mission</span>
              </h2>
              <div className="space-y-6 text-gray-200 leading-relaxed">
                <p>
                  For over a decade, we have dedicated ourselves to preserving and sharing 
                  the profound wisdom of Hindu astrology. Our platform was born from a vision 
                  to make authentic Vedic consultations accessible to seekers worldwide.
                </p>
                <p>
                  We believe that every soul deserves guidance on their spiritual journey. 
                  Through the ancient science of Jyotish Shastra, we help individuals understand 
                  their cosmic purpose and navigate life's challenges with divine insight.
                </p>
                <p>
                  Our commitment extends beyond mere predictions. We focus on empowering 
                  individuals with knowledge, helping them align with their highest potential 
                  and find peace in their life's journey.
                </p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="glass-card rounded-2xl p-8 border border-astro-gold/20 mystical-glow relative overflow-hidden bg-white">
                {/* Subtle Gayatri Mantra background */}
                <div className="absolute inset-0 opacity-5">
                  <p className="text-gray-400 font-hindi text-xs leading-loose p-4 transform rotate-45">
                    ॐ गायत्री मंत्र ॐ
                  </p>
                </div>
                
                <div className="text-center mb-6 relative z-10">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 mystical-glow">
                    <span className="text-3xl">🕉</span>
                  </div>
                  <h3 className="text-2xl font-cinzel font-bold divine-text mb-2">Our Founder's Vision</h3>
                </div>
                <blockquote className="text-gray-700 italic text-center leading-relaxed relative z-10">
                  "To illuminate the path of dharma through the sacred science of astrology, 
                  helping every soul discover their divine purpose and live in harmony with 
                  the cosmic order, guided by the eternal wisdom of the Gayatri Mantra."
                </blockquote>
                <p className="text-astro-gold font-hindi text-center mt-4 relative z-10">
                  - आध्यात्मिक मार्गदर्शन (Spiritual Guidance)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-cinzel font-bold text-white mb-4">
              Our Sacred <span className="text-astro-gold">Values</span>
            </h2>
            <p className="text-xl text-gray-200">The principles that guide our spiritual service</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-6 text-center hover:shadow-mystical transition-all duration-300 transform hover:scale-105 border border-astro-purple/20 bg-white flex flex-col h-full"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 mystical-glow">
                  <div className="text-gray-800">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-astro-gold mb-3">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed flex-1">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-cinzel font-bold text-white mb-4">
              Our <span className="text-astro-gold">Sacred Impact</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="glass-card rounded-xl p-6 text-center border border-astro-gold/20 bg-white hover:shadow-mystical transition-all duration-300">
                <div className="text-4xl lg:text-5xl font-bold text-amber-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-700 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-12 border border-astro-gold/20 mystical-glow relative overflow-hidden bg-white">
            {/* Sacred geometry pattern */}
            <div className="absolute inset-0 opacity-3">
              <div className="w-full h-full bg-gradient-to-br from-astro-gold/5 to-astro-purple/5 transform rotate-12"></div>
            </div>
            
            <div className="relative z-10">
              <div className="mb-6">
                <p className="text-astro-gold font-hindi text-lg mb-2">ॐ तमसो मा ज्योतिर्गमय ॐ</p>
                <p className="text-gray-600 text-sm italic">"Lead us from darkness to light"</p>
              </div>
              
              <h2 className="text-3xl font-cinzel font-bold text-gray-800 mb-4">
                Begin Your <span className="text-astro-gold">Spiritual Journey</span>
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Connect with our expert astrologers and discover the cosmic wisdom that awaits you,<br/>
                guided by ancient Vedic principles and the sacred Gayatri Mantra.
              </p>
              <a
                href="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl hover:shadow-mystical transition-all duration-300 transform hover:scale-105 mystical-glow"
              >
                <Award className="h-5 w-5 mr-2" />
                Start Your Consultation
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;