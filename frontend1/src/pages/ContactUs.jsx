import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, Calendar } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    consultationType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        consultationType: 'general'
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      details: "+91 9898989898",
      description: "Available 24/7 for urgent consultations"
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Support",
      details: "support@astroconsult.com",
      description: "We respond within 2-4 hours"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Main Office",
      details: "Ballia, Uttar Pradesh, India",
      description: "Sacred spiritual center"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Consultation Hours",
      details: "24/7 Available",
      description: "Connect with astrologers anytime"
    }
  ];

  const consultationTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'vedic', label: 'Vedic Astrology' },
    { value: 'relationship', label: 'Relationship Guidance' },
    { value: 'career', label: 'Career & Finance' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'spiritual', label: 'Spiritual Growth' },
    { value: 'technical', label: 'Technical Support' }
  ];

  const faqs = [
    {
      question: "How do I book my first consultation?",
      answer: "Simply register on our platform, browse our expert astrologers, and book a session that fits your schedule."
    },
    {
      question: "What types of astrology services do you offer?",
      answer: "We offer Vedic astrology, birth chart readings, relationship compatibility, career guidance, and spiritual counseling."
    },
    {
      question: "Are the consultations conducted in multiple languages?",
      answer: "Yes, our astrologers speak Hindi, English, Sanskrit, and several regional Indian languages."
    },
    {
      question: "How secure are my personal details?",
      answer: "We use advanced encryption and follow strict privacy policies to protect all your personal information."
    },
    {
      question: "Can I reschedule my appointment?",
      answer: "Yes, you can reschedule up to 2 hours before your appointment through your dashboard."
    }
  ];

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden"
      style={{ backgroundImage: "url('/images/our1.jpeg')" }}
    >
      <div className="relative z-10">
        <Navigation />

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 p-10 rounded-[36px] border border-black/10 bg-white/85 shadow-[0_25px_70px_rgba(0,0,0,0.15)] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/40 to-transparent pointer-events-none"></div>
            <div className="relative z-10 flex-1 space-y-6 text-center lg:text-left">
              <div>
                <p className="text-astro-gold font-hindi text-xl mb-2">संपर्क करें</p>
                <p className="text-slate-900 text-sm uppercase tracking-[0.2em]">Connect with us</p>
              </div>
              <h1 className="text-5xl md:text-6xl font-cinzel font-bold text-black leading-tight">
                Contact <span className="divine-text">Our Sacred Team</span>
              </h1>
              <p className="text-xl text-slate-900 leading-relaxed">
                Have questions about your spiritual journey? Need guidance on our services?
                Our dedicated support team is here to help you connect with the cosmos.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm uppercase tracking-[0.3em] text-slate-900">
                <span className="px-4 py-2 bg-black/5 rounded-full">24/7 Support</span>
                <span className="px-4 py-2 bg-black/5 rounded-full">Expert Guidance</span>
                <span className="px-4 py-2 bg-black/5 rounded-full">Trusted Advisors</span>
              </div>
            </div>
            <div className="relative z-10 flex-1 w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-black/5 shadow-lg">
                  <p className="text-sm text-slate-900 uppercase tracking-[0.4em] mb-2">Hotline</p>
                  <p className="text-2xl font-semibold text-black mb-4">+91 9898989898</p>
                  <p className="text-slate-900">
                    Reach us anytime for immediate astrological assistance.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-black/5 shadow-lg">
                  <p className="text-sm text-slate-900 uppercase tracking-[0.4em] mb-2">Email</p>
                  <p className="text-2xl font-semibold text-black mb-4">support@astroconsult.com</p>
                  <p className="text-slate-900">
                    Expect a response within 2–4 hours from our sacred desk.
                  </p>
                </div>
                <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-black/5 shadow-lg md:col-span-2">
                  <p className="text-sm text-slate-900 uppercase tracking-[0.4em] mb-2">Office & Availability</p>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-black font-semibold">Ballia, Uttar Pradesh, India</p>
                      <p className="text-slate-900 text-sm">Spiritual HQ</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-black">
                      <span className="px-4 py-2 bg-black/5 rounded-full">24/7 Support</span>
                      <span className="px-4 py-2 bg-black/5 rounded-full">Live Chat</span>
                      <span className="px-4 py-2 bg-black/5 rounded-full">Call & Video</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {contactInfo.map((info, index) => (
                <div
                  key={index}
                  className="glass-card rounded-xl p-6 text-center border border-black/10 bg-white/80 backdrop-blur-md shadow-[0_20px_55px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.2)] transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center text-astro-dark mx-auto mb-4 shadow-inner">
                    {info.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-astro-gold mb-2">{info.title}</h3>
                  <p className="text-black font-medium mb-2">{info.details}</p>
                  <p className="text-slate-900 text-sm">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form and FAQ */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div className="glass-card rounded-2xl p-8 border border-black/10 bg-white/90 backdrop-blur-lg shadow-[0_30px_80px_rgba(0,0,0,0.2)]">
                <h2 className="text-3xl font-cinzel font-bold text-black mb-6">
                  Send us a <span className="divine-text">Message</span>
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6 text-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg text-black placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-astro-gold/60 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg text-black placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-astro-gold/60 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg text-black placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-astro-gold/60 focus:border-transparent"
                        placeholder="Enter your phone"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-2">
                        Consultation Type
                      </label>
                      <select
                        name="consultationType"
                        value={formData.consultationType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-astro-gold/60 focus:border-transparent"
                      >
                        {consultationTypes.map((type) => (
                          <option key={type.value} value={type.value} className="text-slate-900">
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg text-black placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-astro-gold/60 focus:border-transparent"
                      placeholder="What can we help you with?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-black/10 rounded-lg text-black placeholder-slate-900 focus:outline-none focus:ring-2 focus:ring-astro-gold/60 focus:border-transparent resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-astro-gold to-divine-orange text-astro-dark rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-astro-dark/30 border-t-astro-dark rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-3xl font-cinzel font-bold text-black mb-8">
                  Frequently Asked <span className="divine-text">Questions</span>
                </h2>

                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <div key={index} className="glass-card rounded-xl p-6 border border-black/10 bg-white/85 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                      <h3 className="text-lg font-semibold text-astro-gold mb-3 flex items-start">
                        <MessageCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                        {faq.question}
                      </h3>
                      <p className="text-slate-900 leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 glass-card rounded-xl border border-black/10 bg-white/90 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                  <h3 className="text-lg font-semibold text-astro-gold mb-3">
                    Need Immediate Help?
                  </h3>
                  <p className="text-slate-900 mb-4">
                    For urgent consultations or technical support, you can reach us directly:
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:+15551234567"
                      className="flex items-center text-astro-gold hover:text-astro-gold-light transition-colors duration-200"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      +91-9898989898
                    </a>
                    <a
                      href="mailto:support@astroconsult.com"
                      className="flex items-center text-astro-gold hover:text-astro-gold-light transition-colors duration-200"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      support@astroconsult.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="glass-card rounded-2xl p-12 border border-black/10 bg-white/90 backdrop-blur-md shadow-[0_35px_90px_rgba(0,0,0,0.2)]">
              <h2 className="text-3xl font-cinzel font-bold text-black mb-4">
                Ready to Begin Your <span className="divine-text">Spiritual Journey</span>?
              </h2>
              <p className="text-xl text-slate-900 mb-8">
                Don't wait for the perfect moment. The stars are aligned for your transformation today.
              </p>
              <a
                href="/book-appointment"
                className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-xl border border-black/10 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Calendar className="h-5 w-5 mr-2 text-black" />
                Book Your First Consultation
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;