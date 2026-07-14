import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, appointmentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, FileText, DollarSign, Star, MapPin, Cake, Sparkles } from 'lucide-react';

const TOPICS_AND_QUESTIONS = {
  "Love & Romance - Love Life": [
    "Will I fall in love?",
    "When will I find true love?",
    "Is love marriage indicated in my horoscope?",
    "Will I have a successful love relationship?",
    "How many serious relationships are indicated?",
    "What kind of partner will I attract?",
    "Why am I unlucky in love?",
    "Why do my relationships fail?",
    "Is true love destined for me?",
    "Is my soulmate already in my life?"
  ],
  "Love & Romance - Current Relationship": [
    "Does my partner truly love me?",
    "Is this relationship genuine?",
    "Is my relationship stable?",
    "Will our relationship become stronger?",
    "Is my partner loyal?",
    "Is there a future in this relationship?",
    "Will we stay together?",
    "Are we emotionally compatible?",
    "Are we spiritually connected?",
    "What is the karmic purpose of this relationship?"
  ],
  "Love & Romance - Marriage from Love": [
    "Will my love relationship turn into marriage?",
    "Will my family accept our relationship?",
    "Will my partner's family accept me?",
    "Is there any obstacle to our marriage?",
    "Will we have a happy married life?",
    "What is the best time to marry my partner?",
    "Will our love survive family opposition?",
    "Is inter-caste marriage indicated?",
    "Is inter-religion marriage indicated?",
    "Will we marry against our parents' wishes?"
  ],
  "Love & Romance - Love Timing": [
    "When will I meet my soulmate?",
    "When will my love life improve?",
    "Which Dasha favors love?",
    "Which transit activates romance?",
    "When will I enter a relationship?",
    "What is the best year for love?",
    "What is the best age for marriage?",
    "When will I receive a marriage proposal?",
    "Is this year favorable for love?"
  ],
  "Love & Romance - Compatibility": [
    "Are we compatible?",
    "Is our relationship karmic?",
    "Is this person my soulmate?",
    "Are we destined to be together?",
    "Are we emotionally compatible?",
    "Are we mentally compatible?",
    "Are we physically compatible?",
    "Are we spiritually compatible?",
    "Is our relationship long-lasting?",
    "Will we remain together forever?"
  ],
  "Love & Romance - Breakup & Separation": [
    "Will my breakup heal?",
    "Can my ex return?",
    "Will we reconcile?",
    "Should I move on?",
    "Why did this relationship end?",
    "Is separation permanent?",
    "Will we reunite?",
    "Is another relationship coming soon?",
    "What lessons should I learn from this breakup?"
  ],
  "Love & Romance - Ex-Partner": [
    "Will my ex contact me again?",
    "Does my ex still think about me?",
    "Does my ex still love me?",
    "Will my ex marry someone else?",
    "Should I wait for my ex?",
    "Is reconciliation possible?",
    "Will we meet again?",
    "Is there unfinished karma with my ex?"
  ],
  "Love & Romance - Long-Distance Relationships": [
    "Will our long-distance relationship succeed?",
    "Can distance separate us?",
    "Will we eventually live together?",
    "Is relocation indicated after marriage?",
    "Will my partner move abroad?",
    "Will we settle in another country?"
  ],
  "Love & Romance - Hidden Relationships": [
    "Is there a secret relationship in my horoscope?",
    "Is my partner hiding something?",
    "Is there another person involved?",
    "Can I trust my partner?",
    "Is there deception in my relationship?",
    "Will I discover the truth?",
    "Is infidelity indicated?",
    "Is emotional cheating possible?"
  ],
  "Love & Romance - Love Triangle": [
    "Am I in a love triangle?",
    "Will my partner choose me?",
    "Is there another person influencing my relationship?",
    "Who is better for me?",
    "Should I continue this relationship?",
    "Which relationship has better long-term potential?"
  ],
  "Love & Romance - Romantic Personality": [
    "How do I express love?",
    "What attracts people to me?",
    "Why do people fall in love with me?",
    "What type of partner suits me?",
    "What is my love language?",
    "What emotional needs do I have?",
    "What are my relationship strengths?",
    "What are my relationship weaknesses?"
  ],
  "Love & Romance - Physical & Intimacy": [
    "Is physical compatibility good?",
    "Will we have a passionate relationship?",
    "Is our intimacy balanced?",
    "Will our attraction remain strong?",
    "Is Venus strong in my chart?",
    "Is Mars causing relationship conflicts?"
  ],
  "Love & Romance - Karmic Relationships": [
    "Is this relationship from a past life?",
    "Do we share karmic debts?",
    "Why are we repeatedly meeting?",
    "Are we twin souls?",
    "Are we soulmates?",
    "What karmic lesson are we learning together?",
    "Is this relationship spiritually significant?"
  ],
  "Love & Romance - Love Obstacles": [
    "What is delaying my love life?",
    "Is Manglik Dosha affecting my relationship?",
    "Is Saturn delaying love?",
    "Is Rahu causing confusion?",
    "Is Ketu causing detachment?",
    "Which planet is creating relationship problems?",
    "Which remedy will improve my love life?"
  ],
  "Love & Romance - Future Love": [
    "Will I find love after divorce?",
    "Will I marry again?",
    "Will I fall in love twice?",
    "Will my second marriage be happier?",
    "Is a new relationship approaching?",
    "Will I find true happiness in love?"
  ],
  "Love & Romance - AI Deep Analysis": [
    "What does my horoscope reveal about my love life?",
    "What is the biggest challenge in my relationships?",
    "What kind of soulmate is destined for me?",
    "How can I improve my relationships?",
    "What lessons should I learn before marriage?",
    "Which years are most favorable for romance?",
    "Which Dasha will transform my love life?",
    "What remedies can strengthen my relationship?",
    "What is the probability that my current relationship will lead to marriage?",
    "What does my Navamsha reveal about my future spouse?"
  ],
  "Marriage & Relationship": [
    "When will I get married?",
    "At what age will I get married?",
    "Is marriage promised in my horoscope?",
    "Will my marriage be early or delayed?",
    "What is causing the delay in my marriage?",
    "Will I have a love marriage or an arranged marriage?",
    "Will I marry someone from a different caste or religion?",
    "Will I marry someone from another country?",
    "How many marriages are indicated?",
    "Is there a possibility of remarriage?",
    "What will my spouse look like?",
    "What will be my spouse's nature?",
    "Will my spouse be caring?",
    "Will my spouse be wealthy?",
    "Will my spouse be spiritual?",
    "Will my spouse support my career?",
    "What profession will my spouse have?",
    "Will my spouse be older or younger than me?",
    "Where is my spouse likely to come from?",
    "Will my marriage be happy?",
    "Will there be misunderstandings?",
    "Will we live together happily?",
    "Will we settle abroad after marriage?",
    "Will my married life improve financially?",
    "Will my in-laws support me?",
    "Is divorce indicated?",
    "Is separation possible?",
    "How long will my marriage last?",
    "Which Dasha is favorable for marriage?",
    "Are we compatible?",
    "What is our compatibility score?",
    "Is Manglik matching favorable?",
    "How strong is our emotional compatibility?",
    "Are we spiritually compatible?",
    "Is our physical compatibility good?",
    "Will we have children?",
    "What remedies can improve our relationship?"
  ],
  "Career & Job": [
    "Which career suits me best?",
    "What profession is indicated?",
    "Should I work in government or private sector?",
    "Am I suitable for business?",
    "Should I become self-employed?",
    "Which industry is best for me?",
    "Can I become an entrepreneur?",
    "Should I pursue freelancing?",
    "When will I get a job?",
    "Will I change my job?",
    "Is promotion indicated?",
    "Will I get my desired job?",
    "Will I receive salary growth?",
    "Should I resign?",
    "Will I get a government job?",
    "Will I work abroad?",
    "Is foreign settlement possible?",
    "When will my career improve?",
    "Which Dasha favors career?",
    "Which transit supports promotion?",
    "Why am I facing career obstacles?",
    "What is my highest career potential?",
    "Will I become famous?",
    "Can I become a CEO?",
    "Will I be successful in IT?",
    "Is public service suitable for me?"
  ],
  "Business": [
    "Should I start a business?",
    "Which business is suitable?",
    "Is partnership good?",
    "Who should be my business partner?",
    "When should I start my business?",
    "Will my business expand?",
    "Is this year good for investment?",
    "Will I receive funding?",
    "Is export business favorable?",
    "Will I own multiple businesses?"
  ],
  "Wealth & Finance": [
    "Will I become wealthy?",
    "When will I earn good money?",
    "Which Dasha gives wealth?",
    "Will I inherit property?",
    "Can I invest in the stock market?",
    "Is real estate favorable?",
    "Should I invest in gold?",
    "Will I receive sudden wealth?",
    "Is lottery luck indicated?",
    "Will I become financially independent?"
  ],
  "Health": [
    "How is my overall health?",
    "Which diseases should I be careful about?",
    "Is surgery indicated?",
    "Will I recover soon?",
    "Is chronic illness shown?",
    "What is my immunity like?",
    "Which Dasha affects health?",
    "Are accidents indicated?",
    "How can I improve my health?",
    "Which remedies help my health?"
  ],
  "Children": [
    "Will I have children?",
    "When will I have my first child?",
    "Will I have a son or daughter?",
    "Are childbirth delays indicated?",
    "Will fertility treatment be needed?",
    "Will my children be successful?",
    "How many children are indicated?",
    "What is my relationship with my children?"
  ],
  "Education": [
    "Which course is suitable?",
    "Should I study abroad?",
    "Will I complete higher education?",
    "Can I clear competitive exams?",
    "Will I get admission to my preferred college?",
    "Which field matches my horoscope?",
    "Will I receive scholarships?"
  ],
  "Foreign Travel & Settlement": [
    "Will I travel abroad?",
    "Will I settle overseas?",
    "Which country suits me?",
    "When will I receive a visa?",
    "Is immigration indicated?",
    "Will foreign business succeed?",
    "Will I return to my homeland?"
  ],
  "Property & Real Estate": [
    "When will I buy a house?",
    "Should I buy land?",
    "Is this property beneficial?",
    "Will I inherit family property?",
    "Is property litigation indicated?",
    "Which direction is lucky for my home?",
    "Should I renovate my house?"
  ],
  "Litigation & Enemies": [
    "Will I win my court case?",
    "Is litigation favorable?",
    "Do I have hidden enemies?",
    "Who is causing obstacles?",
    "Will legal issues end soon?",
    "Is police involvement indicated?",
    "How can I overcome my enemies?"
  ],
  "Spirituality": [
    "What is my spiritual path?",
    "Am I inclined toward meditation?",
    "Which deity should I worship?",
    "Which mantra is suitable?",
    "What is my karmic purpose?",
    "Is Moksha indicated?",
    "Which pilgrimage is favorable?"
  ],
  "Parents & Family": [
    "How is my relationship with my father?",
    "How is my relationship with my mother?",
    "Will family disputes end?",
    "Will I inherit ancestral wealth?",
    "Is family harmony indicated?",
    "Should I live separately?"
  ],
  "Daily Life": [
    "Is today favorable?",
    "What should I avoid today?",
    "Which color is lucky today?",
    "Which direction is lucky today?",
    "Which Hora is favorable?",
    "Which Choghadiya is best?",
    "Which Muhurta is suitable today?"
  ],
  "Muhurta": [
    "Which day is best for marriage?",
    "When should I start my business?",
    "Which Muhurta is best for housewarming?",
    "Which date is auspicious for surgery?",
    "When should I buy a vehicle?",
    "Which date is best for signing contracts?"
  ],
  "Dasha & Transit": [
    "Which Mahadasha am I running?",
    "What will this Mahadasha bring?",
    "How will Saturn transit affect me?",
    "Is Sade Sati active?",
    "How will Jupiter transit help me?",
    "Which transit activates marriage?",
    "Which transit activates career?"
  ],
  "Remedies": [
    "Which gemstone should I wear?",
    "Which Rudraksha is suitable?",
    "Which mantra should I chant?",
    "Which fast (Vrat) is beneficial?",
    "Which donation will help me?",
    "Which Yantra should I keep?",
    "Which deity should I worship?"
  ],
  "Horary (Prashna)": [
    "Will my lost item be found?",
    "Will this relationship succeed?",
    "Will I get the job I interviewed for?",
    "Should I invest now?",
    "Will my visa be approved?",
    "Will I receive the payment?",
    "Is this business deal favorable?",
    "Will this court case end in my favor?"
  ],
  "AI Personalized Questions": [
    "What is the most important event coming in my life?",
    "Which area of my life needs attention?",
    "What are my biggest strengths?",
    "What are my biggest weaknesses?",
    "What opportunities are approaching?",
    "What challenges should I prepare for?",
    "What is my life purpose?",
    "Which year will be most successful?",
    "Which remedies will give the fastest results?"
  ]
};

const BookAppointment = () => {
  const [astrologers, setAstrologers] = useState([]);
  const [selectedAstrologer, setSelectedAstrologer] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [consultationType, setConsultationType] = useState('birth_chart');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [astrologerCategory, setAstrologerCategory] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [checkingFirstTime, setCheckingFirstTime] = useState(true);

  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);



  const { user } = useAuth();
  const navigate = useNavigate();

  // Astrologer categories
  const astrologerCategories = [
    {
      value: 'vedic',
      label: 'Vedic Astrologer',
      description: 'Kundali making & reading, Kundali matching, Marriage, Study, Business, Job, Financial',
      specializations: ['Vedic Astrology', 'vedic', 'birth_chart', 'relationship', 'career', 'health']
    },
    {
      value: 'tarot',
      label: 'Tarot Card Reading',
      description: 'Tarot card insights and guidance',
      specializations: ['Tarot', 'tarot']
    },
    {
      value: 'horoscope',
      label: 'Horoscope Reading',
      description: 'Daily, weekly, and monthly horoscope predictions',
      specializations: ['Horoscope', 'horoscope']
    },
    {
      value: 'numerology',
      label: 'Numerology',
      description: 'Number-based predictions and life path analysis',
      specializations: ['Numerology', 'numerology']
    },
    {
      value: 'palmistry',
      label: 'Palmistry',
      description: 'Palm reading and hand analysis',
      specializations: ['Palmistry', 'palmistry']
    },
    {
      value: 'lalkitab',
      label: 'Lal Kitab',
      description: 'Lal Kitab remedies and predictions',
      specializations: ['Lal Kitab', 'lalkitab', 'lal kitab']
    },
    {
      value: 'vastu',
      label: 'Vastu Shastra',
      description: 'Vastu consultation for home and office',
      specializations: ['Vastu', 'Vastu Shastra', 'vastu']
    }
  ];

  // Consultation types with prices
  const consultationTypes = {
    birth_chart: { label: 'Birth Chart Reading', price: 150 },
    relationship: { label: 'Relationship Compatibility', price: 120 },
    career: { label: 'Career Guidance', price: 100 },
    health: { label: 'Health & Wellness', price: 130 },
    general: { label: 'General Consultation', price: 80 },
    vastu_consultation: { label: 'Vastu Consultation', price: 200 },
    marriage_consultation: { label: 'Marriage Consultation', price: 180 },
    finance_consultation: { label: 'Finance Consultation', price: 150 },
    business_consultation: { label: 'Business Consultation', price: 170 },
    study_consultation: { label: 'Study Consultation', price: 120 },
    horoscope_weekly: { label: 'Horoscope Weekly Consultation', price: 100 },
    horoscope_monthly: { label: 'Horoscope Monthly Consultation', price: 150 },
    horoscope_yearly: { label: 'Horoscope Yearly Consultation', price: 250 },
    lalkitab_consultation: { label: 'Lalkitab Consultation', price: 180 },
    numerology_consultation: { label: 'Numerology Consultation', price: 140 },
    palmistry: { label: 'Palmistry', price: 130 },
    special_pooja: { label: 'Special Pooja Vidhi for Hindu Festival', price: 200 },
    negative_energy: { label: 'नकारात्मक शक्ति का प्रभाव (Negative Energy Removal)', price: 220 },
  };

  // Duration options
  const durationOptions = [
    { value: 10, label: '10 minutes (First Free Consultation)' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
  ];

  // Filter astrologers based on selected category
  const filteredAstrologers = useMemo(() => {
    if (!astrologerCategory) return [];

    const selectedCategory = astrologerCategories.find(cat => cat.value === astrologerCategory);
    if (!selectedCategory) return [];

    return astrologers.filter(astrologer => {
      if (!astrologer.specialization || !Array.isArray(astrologer.specialization)) {
        return false;
      }

      // Check if astrologer has any of the specializations for this category
      return astrologer.specialization.some(spec =>
        selectedCategory.specializations.some(catSpec =>
          spec.toLowerCase().includes(catSpec.toLowerCase()) ||
          catSpec.toLowerCase().includes(spec.toLowerCase())
        )
      );
    });
  }, [astrologers, astrologerCategory]);

  // Reset selected astrologer when category changes
  useEffect(() => {
    setSelectedAstrologer('');
  }, [astrologerCategory]);

  // Check if this is a first-time booking
  useEffect(() => {
    const checkFirstTimeBooking = async () => {
      if (user && user.email) {
        try {
          const response = await appointmentsAPI.checkFirstTime(user.email, user.phone);
          setIsFirstTime(response.data.isFirstTime);
        } catch (error) {
          console.error('Error checking first-time status:', error);
          setIsFirstTime(false);
        } finally {
          setCheckingFirstTime(false);
        }
      } else {
        setCheckingFirstTime(false);
      }
    };
    checkFirstTimeBooking();
  }, [user]);

  // Handle first-time booking duration restriction
  useEffect(() => {
    if (isFirstTime) {
      setDuration(10);
    }
  }, [isFirstTime]);

  // Fetch astrologers on component mount
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const response = await authAPI.getAstrologers();
        setAstrologers(response.data.astrologers);
      } catch (error) {
        setError('Failed to load astrologers');
      }
    };
    fetchAstrologers();
  }, []);

  // Fetch available slots when astrologer, date, or duration are selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (selectedAstrologer && appointmentDate) {
        try {
          const response = await appointmentsAPI.getAvailability(selectedAstrologer, appointmentDate, duration);
          setAvailableSlots(response.data.availableSlots);
        } catch (error) {
          setError('Failed to load available time slots');
        }
      }
    };
    fetchAvailability();
  }, [selectedAstrologer, appointmentDate, duration]);

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Calculate total price
  const calculatePrice = () => {
    if (isFirstTime) return 0; // First consultation is FREE!
    const basePrice = consultationTypes[consultationType].price;
    const durationMultiplier = duration / 60;
    return Math.round(basePrice * durationMultiplier);
  };

  const getQuestionLimit = (dur) => {
    if (dur === 10) return 5;
    if (dur === 15) return 10;
    if (dur === 30) return 15;
    return 20; // >30 minutes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const limit = getQuestionLimit(duration);
    if (selectedQuestions.length > limit) {
      setError(`You can select a maximum of ${limit} questions for a ${duration} minutes session. Please remove ${selectedQuestions.length - limit} question(s) before submitting.`);
      setLoading(false);
      return;
    }

    try {
      const appointmentData = {
        astrologerId: selectedAstrologer,
        appointmentDate,
        appointmentTime: selectedTime,
        duration,
        consultationType,
        notes,
        price: calculatePrice(),
        // New user information fields
        clientName: name,
        clientAge: age,
        clientDateOfBirth: dateOfBirth,
        clientPlaceOfBirth: placeOfBirth,
        clientState: state,
        clientCountry: country,
        astrologerCategory: astrologerCategory,
        selectedTopic,
        selectedQuestion,
        selectedQuestions,
      };



      await appointmentsAPI.create(appointmentData);
      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden flex items-center justify-center px-4"
        style={{ backgroundImage: "url('/images/dash1.png')" }}
      >
        <div className="relative z-10 max-w-md w-full p-8 bg-white/90 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.25)] border border-black/10 text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Star className="h-8 w-8 text-astro-dark" />
          </div>
          <h2 className="text-2xl font-cinzel font-bold text-black mb-2">
            Appointment Booked!
          </h2>
          <p className="text-black mb-2">Your sacred consultation has been successfully scheduled.</p>
          <p className="text-astro-gold font-hindi text-sm mb-4">
            धन्यवाद (Thank you)
          </p>
          <p className="text-sm text-black/70">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed overflow-hidden py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: "url('/images/dash1.png')" }}
    >
      <div className="relative z-10 max-w-4xl mx-auto space-y-10">
        <section className="relative p-10 rounded-[36px] border border-black/10 bg-white/85 backdrop-blur-lg shadow-[0_25px_80px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col md:flex-row items-center gap-10">
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
            <p className="text-astro-gold font-hindi text-sm tracking-[0.3em] uppercase">
              आपका भाग्य जानें
            </p>
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-black leading-tight">
              Book a Sacred <span className="text-astro-gold">Consultation</span>
            </h1>
            <p className="text-black">
              Schedule your divine astrology session with our most trusted gurus and receive guided remedies crafted for you.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs uppercase tracking-[0.3em] text-black">
              <span className="px-4 py-2 rounded-full bg-black/5">Instant Slots</span>
              <span className="px-4 py-2 rounded-full bg-black/5">Trusted Advisors</span>
              <span className="px-4 py-2 rounded-full bg-black/5">Secure Booking</span>
            </div>
          </div>
          <div className="relative z-10 flex-1 w-full grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-black/70 mb-2">Average Rating</p>
              <p className="text-4xl font-bold text-black">4.9<span className="text-2xl">/5</span></p>
              <p className="text-black/70 text-sm">Based on 10k+ verified sessions.</p>
            </div>
            <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-black/70 mb-2">Availability</p>
              <p className="text-4xl font-bold text-black">24/7</p>
              <p className="text-black/70 text-sm">Choose a time that fits your schedule.</p>
            </div>
            <div className="p-5 rounded-3xl bg-white/90 border border-black/5 shadow-lg col-span-2">
              <p className="text-xs uppercase tracking-[0.3em] text-black/70 mb-2">Custom Remedies</p>
              <p className="text-black">Detailed guidance, rituals, and gemstone advice delivered post-session.</p>
            </div>
          </div>
        </section>

        {/* Free Consultation Banner */}
        <div className="relative bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl px-6 py-4 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 pointer-events-none"></div>
          <div className="relative z-10 flex items-center justify-center">
            <Star className="h-6 w-6 text-white mr-3 animate-pulse" />
            <p className="text-center text-xl md:text-2xl font-bold text-white">
              Book Your First Consultation FREE! 🎉
            </p>
            <Star className="h-6 w-6 text-white ml-3 animate-pulse" />
          </div>
        </div>

        <div className="bg-white/90 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-black/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100/80 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Personal Information Section */}
            <div className="border-b border-black/10 pb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    min="1"
                    max="120"
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                    placeholder="Enter your age"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Cake className="inline h-4 w-4 mr-1" />
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={getMinDate()}
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                  />
                </div>

                {/* Place of Birth */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Place of Birth *
                  </label>
                  <input
                    type="text"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                    placeholder="City, Town, or Village"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                    placeholder="Enter your state"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="border-b border-black/10 pb-6">
              <h3 className="text-lg font-semibold text-black mb-4">Appointment Details</h3>

              {/* Astrologer Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  <Sparkles className="inline h-4 w-4 mr-1" />
                  Astrologer Category *
                </label>
                <select
                  value={astrologerCategory}
                  onChange={(e) => setAstrologerCategory(e.target.value)}
                  required
                  className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                >
                  <option value="">Select a category</option>
                  {astrologerCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label} - {category.description}
                    </option>
                  ))}
                </select>
                {astrologerCategory && (
                  <p className="mt-2 text-sm text-gray-600">
                    {astrologerCategories.find(c => c.value === astrologerCategory)?.description}
                  </p>
                )}
              </div>

              {/* Astrologer Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-black mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  Select Astrologer *
                </label>
                <select
                  value={selectedAstrologer}
                  onChange={(e) => setSelectedAstrologer(e.target.value)}
                  required
                  disabled={!astrologerCategory}
                  className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {astrologerCategory ? 'Choose an astrologer' : 'Please select a category first'}
                  </option>
                  {filteredAstrologers.map((astrologer) => (
                    <option key={astrologer._id} value={astrologer._id}>
                      {astrologer.name} - {astrologer.specialization?.join(', ')}
                    </option>
                  ))}
                </select>
                {astrologerCategory && filteredAstrologers.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">
                    No astrologers available for this category
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Consultation Type */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Star className="inline h-4 w-4 mr-1" />
                    Consultation Type *
                  </label>
                  <select
                    value={consultationType}
                    onChange={(e) => setConsultationType(e.target.value)}
                    required
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                  >
                    {Object.entries(consultationTypes).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.label} - Rs. {type.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Duration *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                    disabled={isFirstTime}
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {isFirstTime ? (
                      <option value={10}>10 minutes (Locked for Free Session)</option>
                    ) : (
                      durationOptions.filter(opt => opt.value !== 10).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))
                    )}
                  </select>
                  {isFirstTime && (
                    <p className="mt-1 text-xs text-astro-purple font-medium">
                      * Free consultations are limited to 10 minutes.
                    </p>
                  )}
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Appointment Date *
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={getMinDate()}
                    required
                    className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                  />
                </div>
              </div>
            </div>

            {/* Time Slots Dropdown */}
            {appointmentDate && selectedAstrologer && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Select Time Slot *
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                >
                  <option value="">Choose a time</option>
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))
                  ) : (
                    <option disabled>No available slots for this date</option>
                  )}
                </select>
              </div>
            )}

            {/* Question Selection */}
            <div className="bg-black/5 rounded-2xl p-5 border border-black/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-black text-base flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-astro-gold animate-spin-slow" />
                  Select Questions for Session
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${selectedQuestions.length >= getQuestionLimit(duration) ? 'bg-red-100 text-red-700' : 'bg-astro-purple/10 text-astro-purple'}`}>
                  Questions: {selectedQuestions.length} / Max {getQuestionLimit(duration)}
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">
                    Select Topic
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => {
                      setSelectedTopic(e.target.value);
                      setSelectedQuestion('');
                    }}
                    className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-1 focus:ring-astro-gold"
                  >
                    <option value="">-- Choose a Topic --</option>
                    {Object.keys(TOPICS_AND_QUESTIONS).map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1.5">
                    Select Question
                  </label>
                  <select
                    value={selectedQuestion}
                    onChange={(e) => setSelectedQuestion(e.target.value)}
                    disabled={!selectedTopic}
                    className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-1 focus:ring-astro-gold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedTopic ? '-- Choose a Question --' : 'Select a topic first'}
                    </option>
                    {selectedTopic &&
                      TOPICS_AND_QUESTIONS[selectedTopic].map((question) => (
                        <option key={question} value={question}>
                          {question}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!selectedTopic || !selectedQuestion || selectedQuestions.length >= getQuestionLimit(duration)}
                  onClick={() => {
                    // Check duplicate
                    const isDuplicate = selectedQuestions.some(
                      (q) => q.topic === selectedTopic && q.question === selectedQuestion
                    );
                    if (isDuplicate) {
                      alert('This question has already been added to the session!');
                      return;
                    }
                    setSelectedQuestions((prev) => [...prev, { topic: selectedTopic, question: selectedQuestion }]);
                    setSelectedTopic('');
                    setSelectedQuestion('');
                  }}
                  className="px-4 py-2 bg-astro-gold hover:bg-amber-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg text-sm transition duration-200"
                >
                  Add Question
                </button>
              </div>

              {/* List of Added Questions */}
              {selectedQuestions.length > 0 && (
                <div className="mt-4 border-t border-black/10 pt-4 space-y-2">
                  <p className="text-xs font-semibold text-black/70">Added Questions:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-start justify-between bg-white p-2.5 rounded-lg border border-black/5 shadow-sm gap-2">
                        <div className="text-xs text-black">
                          <span className="font-bold text-astro-purple">[{q.topic}]</span>: {q.question}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedQuestions((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="text-[10px] text-red-500 hover:text-red-700 hover:underline font-semibold flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {/* Notes */}
            <div>

              <label className="block text-sm font-medium text-black mb-2">
                <FileText className="inline h-4 w-4 mr-1" />
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-3 bg-white border border-black/15 rounded-lg text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold focus:border-astro-gold"
                placeholder="Any specific questions or areas you'd like to focus on..."
              />
            </div>

            {/* Price Display */}
            {consultationType && (
              <div className={`bg-gradient-to-r ${isFirstTime ? 'from-green-500/20 to-emerald-500/20 border-green-400/40' : 'from-astro-purple/15 to-mystic-indigo/10 border-astro-purple/30'} border rounded-xl p-4`}>
                <div className="flex items-center justify-between text-black">
                  <span className="text-black font-medium">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Total Price:
                  </span>
                  <span className="text-2xl font-bold text-black">
                    {isFirstTime ? (
                      <span className="text-green-600 flex items-center gap-2">
                        FREE 🎉
                        <span className="text-sm font-normal">(First Consultation)</span>
                      </span>
                    ) : (
                      `Rs. ${calculatePrice()}`
                    )}
                  </span>
                </div>
                {isFirstTime && (
                  <p className="text-sm text-green-700 mt-2 text-center font-semibold">
                    🌟 Congratulations! Your first consultation is absolutely FREE! 🌟
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedTime}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Book Appointment'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;