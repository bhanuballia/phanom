import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, appointmentsAPI, walletAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, User, FileText, IndianRupee, Star, MapPin, Cake, Sparkles, Hand, Upload, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';

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
  " Personalized Questions": [
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
  const [consultationType, setConsultationType] = useState('custom_questions');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // New fields
  const [name, setName] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [useDefaultBirthDetails, setUseDefaultBirthDetails] = useState(false);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true);
  const [astrologerCategory, setAstrologerCategory] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [checkingFirstTime, setCheckingFirstTime] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Top Rotating Banner 1 Images (Cycles every 3 seconds)
  const banner1Images = useMemo(() => [
    '/images/astrobanner1.jpg',
    '/images/astrobanner3.jpg',
    '/images/astrobanner4.jpg',
    '/images/astrobanner5.jpg',
    '/images/astrobanner6.jpg',
    '/images/astrobanner7.jpg'
  ], []);
  const [currentBanner1Index, setCurrentBanner1Index] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner1Index((prev) => (prev + 1) % banner1Images.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banner1Images.length]);

  // Palmistry images states
  const [palmImages, setPalmImages] = useState({
    rightHandImage: null,
    leftHandImage: null
  });
  const [palmImagePreviews, setPalmImagePreviews] = useState({
    rightHandImage: null,
    leftHandImage: null
  });

  const handlePalmImageChange = (e, hand) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(`Please upload a valid image file for ${hand} hand`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError(`Image size should be less than 10MB for ${hand} hand`);
        return;
      }
      setPalmImages(prev => ({
        ...prev,
        [`${hand}HandImage`]: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPalmImagePreviews(prev => ({
          ...prev,
          [`${hand}HandImage`]: reader.result
        }));
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };



  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-fill user details if available
  useEffect(() => {
    if (user) {
      // Detect if user registered using default birth time & location
      const userBirthTimeVal = user.birthTime || user.timeOfBirth || '';
      const userPlaceVal = (user.placeOfBirth || user.city || '').toLowerCase();
      const isDefaultRegistered =
        (userBirthTimeVal === '12:00' || userBirthTimeVal === '12:00:00') &&
        (userPlaceVal.includes('delhi') || !userPlaceVal);

      if (isDefaultRegistered) {
        setUseDefaultBirthDetails(true);
      }

      if (user.name) setName(user.name);
      else if (user.firstName || user.lastName) {
        setName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      }
      if (user.birthTime) {
        setBirthTime(user.birthTime);
      } else if (user.timeOfBirth) {
        setBirthTime(user.timeOfBirth);
      } else if (isDefaultRegistered) {
        setBirthTime('12:00');
      }

      if (user.dateOfBirth) {
        try {
          const dateStr = user.dateOfBirth.split('T')[0];
          setDateOfBirth(dateStr);
        } catch (e) {
          setDateOfBirth(user.dateOfBirth);
        }
      }

      if (user.placeOfBirth) {
        setPlaceOfBirth(user.placeOfBirth);
        // Extract State and Country from "City, State, Country" format
        const parts = user.placeOfBirth.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          setState(parts[1]);
          setCountry(parts[parts.length - 1]);
        } else if (parts.length === 2) {
          setState(parts[0]);
          setCountry(parts[1]);
        }
      } else {
        if (isDefaultRegistered) {
          setPlaceOfBirth('New Delhi');
          setState('Delhi');
          setCountry('India');
        } else {
          if (user.state) setState(user.state);
          if (user.country) setCountry(user.country);
        }
      }
    }
  }, [user]);

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
    custom_questions: { label: 'Custom Questions (₹251 for 10 questions, ₹501 for 20 questions)', price: 251 },
    birth_chart: { label: 'Birth Chart Reading', price: 2100 },
    relationship: { label: 'Relationship Compatibility', price: 120 },
    career: { label: 'Career Guidance', price: 100 },
    health: { label: 'Health & Wellness', price: 130 },
    general: { label: 'General Consultation', price: 80 },
    vastu_consultation: { label: 'Vastu Consultation', price: 2100 },
    marriage_consultation: { label: 'Marriage Consultation', price: 2100 },
    finance_consultation: { label: 'Finance Consultation', price: 150 },
    business_consultation: { label: 'Business Consultation', price: 170 },
    study_consultation: { label: 'Study Consultation', price: 120 },
    horoscope_weekly: { label: 'Horoscope Weekly Consultation', price: 100 },
    horoscope_monthly: { label: 'Horoscope Monthly Consultation', price: 150 },
    horoscope_yearly: { label: 'Horoscope Yearly Consultation', price: 250 },
    lalkitab_consultation: { label: 'Lalkitab Consultation', price: 180 },
    numerology_consultation: { label: 'Numerology Consultation', price: 2100 },
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

  // Reset selected astrologer and update consultationType when category changes
  useEffect(() => {
    setSelectedAstrologer('');
    if (astrologerCategory === 'palmistry') {
      setConsultationType('palmistry');
    }
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

    const fetchWallet = async () => {
      if (user) {
        try {
          const response = await walletAPI.getBalance();
          setWalletBalance(response.data.balance || 0);
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      }
    };

    checkFirstTimeBooking();
    fetchWallet();
  }, [user]);

  // Handle first-time booking duration restriction
  useEffect(() => {
    if (isFirstTime) {
      setDuration(10);
    }
  }, [isFirstTime]);

  // Adjust duration if fixed price types, custom questions, horoscope weekly, monthly, or yearly is selected
  useEffect(() => {
    if (!isFirstTime) {
      if (['birth_chart', 'vastu_consultation', 'marriage_consultation', 'numerology_consultation'].includes(consultationType)) {
        if (duration !== 60 && duration !== 90) {
          setDuration(60);
        }
      } else if (consultationType === 'horoscope_weekly') {
        setDuration(15);
      } else if (consultationType === 'horoscope_monthly') {
        setDuration(30);
      } else if (consultationType === 'horoscope_yearly') {
        setDuration(60);
      } else if (consultationType === 'custom_questions') {
        if (duration !== 15 && duration !== 30) {
          setDuration(15);
        }
      }
    }
  }, [consultationType, isFirstTime]);

  // Fetch astrologers on component mount
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const response = await authAPI.getAstrologers();
        const astroList = response.data.astrologers || [];
        setAstrologers(astroList);

        // Pre-select astrologer if passed from navigation state
        const targetAstro = location.state?.selectedAstrologer || location.state?.astrologer;
        const targetId = location.state?.astrologerId || targetAstro?._id;
        if (targetId) {
          const found = astroList.find(a => a._id === targetId);
          if (found) {
            // Find appropriate category if current category isn't set
            const specList = (found.specialization || []).map(s => s.toLowerCase());
            const matchedCategory = astrologerCategories.find(cat =>
              cat.specializations.some(cs => specList.some(s => s.includes(cs.toLowerCase()) || cs.toLowerCase().includes(s)))
            );
            if (matchedCategory) {
              setAstrologerCategory(matchedCategory.value);
            } else {
              setAstrologerCategory('vedic');
            }
            setSelectedAstrologer(targetId);
          }
        }
      } catch (error) {
        setError('Failed to load astrologers');
      }
    };
    fetchAstrologers();
  }, [location.state]);

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

  // 1. Consultation types that have a FIXED price (Birth Chart, Vastu, Marriage, Numerology)
  const FIXED_PRICE_TYPES = [
    'birth_chart',            // Birth Chart Reading (Rs. 150)
    'vastu_consultation',     // Vastu Consultation (Rs. 200)
    'marriage_consultation',  // Marriage Consultation (Rs. 180)
    'numerology_consultation',// Numerology Consultation (Rs. 140)
    'custom_questions'        // Custom Questions package (Rs. 251 / 501)
  ];

  const isFixedPrice = FIXED_PRICE_TYPES.includes(consultationType);

  // Retrieve selected astrologer object and per-minute rate
  const selectedAstroObj = astrologers.find(a => a._id === selectedAstrologer);
  const astroPerMinuteRate = Number(selectedAstroObj?.pricing) > 0
    ? Number(selectedAstroObj.pricing)
    : (Number(selectedAstroObj?.callRate) > 0 ? Number(selectedAstroObj.callRate) : 16);

  // Calculate total price
  const calculatePrice = () => {
    if (isFirstTime) return 0; // First consultation is FREE!

    // Custom questions package
    if (consultationType === 'custom_questions') {
      return duration > 15 ? 501 : 251;
    }

    // Fixed Price Consultations (Birth Chart Reading, Vastu, Marriage, Numerology)
    if (['birth_chart', 'vastu_consultation', 'marriage_consultation', 'numerology_consultation'].includes(consultationType)) {
      const basePrice = consultationTypes[consultationType]?.price || 150;
      return duration === 90 ? Math.round(basePrice * 1.5) : basePrice;
    }

    if (isFixedPrice) {
      return consultationTypes[consultationType]?.price || 150;
    }

    // All other consultations (Relationship Compatibility, Career Guidance, Health & Wellness, General Consultation, Finance, Business, Study, Horoscope, Lal Kitab, Palmistry, Special Pooja, Negative Energy Removal, etc.):
    // Calculated at Astrologer Per-Minute Call Price
    return Math.round(astroPerMinuteRate * (duration || 15));
  };

  const getQuestionLimit = (dur) => {
    if (consultationType === 'custom_questions') {
      if (dur === 15) return 10;
      if (dur === 30) return 20;
      if (dur <= 15) return 10;
      return 20;
    }
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
      const effectiveBirthTime = useDefaultBirthDetails ? (birthTime || '12:00') : birthTime;
      const effectivePlaceOfBirth = useDefaultBirthDetails ? (placeOfBirth || 'New Delhi') : placeOfBirth;
      const effectiveState = useDefaultBirthDetails ? (state || 'Delhi') : state;
      const effectiveCountry = useDefaultBirthDetails ? (country || 'India') : country;

      let appointmentPayload;
      if (palmImages.rightHandImage || palmImages.leftHandImage) {
        const formData = new FormData();
        formData.append('astrologerId', selectedAstrologer);
        formData.append('appointmentDate', appointmentDate);
        formData.append('appointmentTime', selectedTime);
        formData.append('duration', duration);
        formData.append('consultationType', consultationType);
        formData.append('notes', notes);
        formData.append('price', calculatePrice());
        formData.append('clientName', name);
        formData.append('clientBirthTime', effectiveBirthTime);
        formData.append('clientDateOfBirth', dateOfBirth);
        formData.append('clientPlaceOfBirth', effectivePlaceOfBirth);
        formData.append('clientState', effectiveState);
        formData.append('clientCountry', effectiveCountry);
        formData.append('astrologerCategory', astrologerCategory);
        formData.append('selectedTopic', selectedTopic);
        formData.append('selectedQuestion', selectedQuestion);
        formData.append('selectedQuestions', JSON.stringify(selectedQuestions));
        if (palmImages.rightHandImage) {
          formData.append('rightHandImage', palmImages.rightHandImage);
        }
        if (palmImages.leftHandImage) {
          formData.append('leftHandImage', palmImages.leftHandImage);
        }
        appointmentPayload = formData;
      } else {
        appointmentPayload = {
          astrologerId: selectedAstrologer,
          appointmentDate,
          appointmentTime: selectedTime,
          duration,
          consultationType,
          notes,
          price: calculatePrice(),
          // New user information fields
          clientName: name,
          clientBirthTime: effectiveBirthTime,
          clientDateOfBirth: dateOfBirth,
          clientPlaceOfBirth: effectivePlaceOfBirth,
          clientState: effectiveState,
          clientCountry: effectiveCountry,
          astrologerCategory,
          selectedTopic,
          selectedQuestion,
          selectedQuestions,
        };
      }

      await appointmentsAPI.create(appointmentPayload);
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const bookedAstrologer = astrologers.find(a => a._id === selectedAstrologer);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div className="relative max-w-md w-full p-8 bg-white rounded-3xl shadow-2xl border border-black/10">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-astro-gold to-divine-orange rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Star className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-2xl font-cinzel font-bold text-center text-black mb-6">
            Appointment Booked!
          </h2>

          <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-4 border border-gray-100">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-[14px] text-amber-900 font-medium">Astrologer</span>
              <span className="text-[14px] text-black font-bold">{bookedAstrologer?.name || 'Astrologer'}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-[14px] text-amber-900 font-medium">Date</span>
              <span className="text-[14px] text-black font-bold">
                {(() => {
                  if (!appointmentDate) return 'N/A';
                  try {
                    // Split YYYY-MM-DD to avoid timezone shifting
                    const [y, m, d] = appointmentDate.split('-');
                    if (y && m && d) {
                      const dt = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
                      return dt.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      });
                    }
                    return appointmentDate;
                  } catch (e) {
                    return appointmentDate;
                  }
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-[14px] text-amber-900 font-medium">Time</span>
              <span className="text-[14px] text-black font-bold">{selectedTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[14px] text-amber-900 font-medium">Duration</span>
              <span className="text-[14px] text-black font-bold">{duration} Minutes</span>
            </div>
          </div>

          <p className="text-center text-gray-900 mb-2">Thank you for booking your sacred consultation.</p>
          <p className="text-center text-astro-gold font-hindi text-lg font-bold mb-8">
            धन्यवाद
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Close & Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed py-3 sm:py-4 px-3 sm:px-6"
      style={{ backgroundImage: "url('/images/dash1.png')" }}
    >
      <div className="relative z-10 max-w-7xl mx-auto space-y-4">
        {/* Top Narrow Flex Banner Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-center">
          <div className="w-full h-24 sm:h-28 md:h-48 rounded-2xl overflow-hidden border border-black/10 shadow-md bg-white group">
            <img
              src="/images/astrobanner1.jpg"
              alt="Astro Consultation Banner 1"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
          <div className="w-full h-24 sm:h-28 md:h-48 rounded-2xl overflow-hidden border border-black/10 shadow-md bg-white group">
            <img
              src="/images/astrobanner2.jpg"
              alt="Astro Consultation Banner 2"
              className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
              loading="lazy"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Left Column: Overview, Trust Badges, Free Consultation Banner, Astrologer Highlight & Wallet */}
          <div className="lg:col-span-4 flex flex-col justify-between rounded-3xl border border-black/10 bg-emerald-100 backdrop-blur-lg shadow-xl p-5 sm:p-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-astro-gold/15 border border-astro-gold/40 flex items-center justify-center">
                  <Star className="h-5 w-5 text-astro-gold" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-astro-gold font-semibold">
                    आपका भाग्य जानें
                  </p>
                  <h1 className="text-xl sm:text-2xl font-cinzel font-bold text-black leading-tight">
                    Book a Sacred <span className="text-astro-gold">Consultation</span>
                  </h1>
                </div>
              </div>

              <p className="text-xs text-black mb-3 leading-relaxed">
                Schedule your divine astrology session with trusted Vedic gurus and receive guided remedies crafted for you.
              </p>

              {/* Free Consultation Banner if First Time */}
              {isFirstTime && (
                <div className="mb-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl p-3 text-white shadow-md flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-300 animate-pulse flex-shrink-0" />
                  <div>
                    <p className="text-[14px] font-bold leading-tight">Your First Consultation is FREE! 🎉</p>
                    <p className="text-[12px] text-white/90">10 minutes introductory session included</p>
                  </div>
                </div>
              )}

              {/* Quick stats pills */}
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div className="p-2 rounded-xl bg-black/5 border border-black/5">
                  <p className="text-[14px] font-bold text-black">4.9/5</p>
                  <p className="text-[12px] text-amber-900 uppercase">10k+ Sessions</p>
                </div>
                <div className="p-2 rounded-xl bg-black/5 border border-black/5">
                  <p className="text-[14px] font-bold text-black">24/7</p>
                  <p className="text-[12px] text-amber-900 uppercase">Instant Slots</p>
                </div>
                <div className="p-2 rounded-xl bg-black/5 border border-black/5">
                  <p className="text-[14px] font-bold text-black">Verified</p>
                  <p className="text-[12px] text-amber-900 uppercase">Top Gurus</p>
                </div>
              </div>

              {/* Selected Astrologer Quick Highlight Card */}
              {selectedAstrologer ? (() => {
                const astro = astrologers.find(a => a._id === selectedAstrologer);
                if (!astro) return null;
                return (
                  <div className="p-3 bg-astro-gold/10 border border-astro-gold/30 rounded-xl mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-astro-gold/20 flex items-center justify-center font-bold text-astro-purple text-xs flex-shrink-0">
                        {astro.name?.charAt(0) || 'A'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[16px] font-bold text-black flex items-center justify-between">
                          <span className="truncate">{astro.name}</span>
                          {astro.experience && (
                            <span className="text-[14px] text-gray-900">{astro.experience}+ yrs</span>
                          )}
                        </div>
                        <p className="text-[16px] text-amber-900 font-medium truncate">
                          ₹{astro.pricing || astro.callRate || 16}/min live call
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="p-2.5 bg-black/5 rounded-xl border border-black/5 mb-3 text-center">
                  <p className="text-xs text-black/60">Choose your Astrologer from the form</p>
                </div>
              )}

              {/* Wallet Overview Box */}
              <div className="p-3 bg-white/70 border border-black/10 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[14px] uppercase tracking-wider text-black">Wallet Balance</p>
                  <p className={`text-base font-bold ${walletBalance >= calculatePrice() ? 'text-green-600' : 'text-amber-800'}`}>
                    ₹{walletBalance.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-xs font-semibold px-2.5 py-1 bg-black/5 hover:bg-black/10 rounded-lg text-black transition cursor-pointer"
                >
                  + Recharge
                </button>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center gap-2 text-[14px] text-black">
              <CheckCircle className="h-3.5 w-3.5 text-green-900 flex-shrink-0" />
              <span>100% Confidential &amp; Verified Consultation</span>
            </div>
          </div>

          {/* Right Column: Book Consultation Form */}
          <div className="lg:col-span-8 flex flex-col justify-between rounded-3xl border border-black/10 bg-amber-100 backdrop-blur-lg shadow-xl p-5 sm:p-6">
            <div className="border-b border-black/10 pb-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-black tracking-tight flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-800" />
                Book an Appointment With Astrologer
              </h2>
              <p className="text-xs sm:text-sm text-red-600 mt-0.5">
                Fill in your details below to schedule your consultation session
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100/80 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Personal Information Section */}
              <div className="border-b border-black/10 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-black flex items-center gap-2">
                    <User className="h-4 w-4 text-astro-gold" />
                    Personal Information
                    {name && !isPersonalInfoOpen && (
                      <span className="text-[14px] font-medium text-purple-900 ml-2">
                        ({name})
                      </span>
                    )}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsPersonalInfoOpen(prev => !prev)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/80 hover:bg-white text-slate-800 border border-black/15 shadow-xs transition-colors cursor-pointer"
                  >
                    {isPersonalInfoOpen ? (
                      <>
                        <span>Close</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <span>Open</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {isPersonalInfoOpen && (
                  <>
                    {/* Checkbox banner: I don't know my exact birth time or location */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 mb-3">
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="bookApptDefaultBirthDetailsCheckbox"
                          checked={useDefaultBirthDetails}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setUseDefaultBirthDetails(checked);
                            if (checked) {
                              setBirthTime('12:00');
                              setPlaceOfBirth('New Delhi');
                              setState('Delhi');
                              setCountry('India');
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">
                          I don't know my exact birth time or location (Use default time &amp; location)
                        </span>
                      </label>
                      {useDefaultBirthDetails && (
                        <p className="text-[11px] text-gray-700 mt-1 pl-6">
                          Default time (12:00 PM) and location (New Delhi, India) will be used for your consultation.
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1">
                          <User className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block text-xs font-semibold text-black mb-1">
                          <Cake className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          required
                          max={getMinDate()}
                          className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                        />
                      </div>

                      {!useDefaultBirthDetails ? (
                        <>
                          {/* Birth Time */}
                          <div>
                            <label className="block text-xs font-semibold text-black mb-1">
                              <Clock className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                              Birth Time *
                            </label>
                            <input
                              type="time"
                              value={birthTime}
                              onChange={(e) => setBirthTime(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                            />
                          </div>

                          {/* Place of Birth */}
                          <div>
                            <label className="block text-xs font-semibold text-black mb-1">
                              <MapPin className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                              Place of Birth *
                            </label>
                            <input
                              type="text"
                              value={placeOfBirth}
                              onChange={(e) => setPlaceOfBirth(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                              placeholder="City, Town, or Village"
                            />
                          </div>

                          {/* State */}
                          <div>
                            <label className="block text-xs font-semibold text-black mb-1">
                              State *
                            </label>
                            <input
                              type="text"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                              placeholder="Enter your state"
                            />
                          </div>

                          {/* Country */}
                          <div>
                            <label className="block text-xs font-semibold text-black mb-1">
                              Country *
                            </label>
                            <input
                              type="text"
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                              required
                              className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                              placeholder="Enter your country"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="md:col-span-2 bg-amber-50/80 border border-amber-200/80 rounded-lg p-2.5 text-xs text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-amber-950">Birth Details Applied:</span>
                            <span className="text-amber-800">12:00 PM (Default) • New Delhi, Delhi, India (Default)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUseDefaultBirthDetails(false)}
                            className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline whitespace-nowrap cursor-pointer"
                          >
                            Change to exact time &amp; place
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Appointment Details Section */}
              <div className="border-b border-black/10 pb-4">
                <h3 className="text-base font-bold text-black mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-astro-gold" />
                  Appointment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Astrologer Category */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      <Sparkles className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                      Astrologer Category *
                    </label>
                    <select
                      value={astrologerCategory}
                      onChange={(e) => setAstrologerCategory(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                    >
                      <option value="">Select a category</option>
                      {astrologerCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label} - {category.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Astrologer Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      <User className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                      Select Astrologer *
                    </label>
                    <select
                      value={selectedAstrologer}
                      onChange={(e) => setSelectedAstrologer(e.target.value)}
                      required
                      disabled={!astrologerCategory}
                      className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {astrologerCategory ? 'Choose an astrologer' : 'Please select category first'}
                      </option>
                      {filteredAstrologers.map((astrologer) => {
                        const specs = astrologer.specialization || [];
                        const topSpecs = specs.slice(0, 2).join(', ');
                        const extraCount = specs.length > 2 ? ` +${specs.length - 2} more` : '';
                        const rate = astrologer.pricing || astrologer.callRate || 16;
                        const label = specs.length > 0
                          ? `${astrologer.name} (${topSpecs}${extraCount}) - ₹${rate}/min`
                          : `${astrologer.name} - ₹${rate}/min`;

                        return (
                          <option key={astrologer._id} value={astrologer._id} title={`${astrologer.name} - ${specs.join(', ')} - ₹${rate}/min`}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Consultation Type */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      <Star className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                      Consultation Type *
                    </label>
                    <select
                      value={consultationType}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setConsultationType(newType);
                        if (['birth_chart', 'vastu_consultation', 'marriage_consultation', 'numerology_consultation'].includes(newType)) {
                          if (duration !== 60 && duration !== 90) {
                            setDuration(60);
                          }
                        } else if (newType === 'horoscope_weekly') {
                          setDuration(15);
                        } else if (newType === 'horoscope_monthly') {
                          setDuration(30);
                        } else if (newType === 'horoscope_yearly') {
                          setDuration(60);
                        } else if (newType === 'custom_questions' && duration !== 15 && duration !== 30) {
                          setDuration(15);
                        }
                      }}
                      required
                      className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                    >
                      {Object.entries(consultationTypes)
                        .filter(([key]) => {
                          if (astrologerCategory === 'palmistry') {
                            return key === 'palmistry';
                          }
                          return true;
                        })
                        .map(([key, type]) => {
                          const isFixed = FIXED_PRICE_TYPES.includes(key);
                          let labelText;
                          if (isFixed) {
                            if (key === 'custom_questions') {
                              labelText = `${type.label} - Fixed: ₹${duration > 15 ? 501 : 251}`;
                            } else {
                              labelText = `${type.label} - Fixed: ₹${type.price}`;
                            }
                          } else {
                            labelText = selectedAstrologer
                              ? `${type.label} - Video Chat: ₹${astroPerMinuteRate}/min`
                              : `${type.label} - Astrologer Video Chat Rate`;
                          }

                          return (
                            <option key={key} value={key}>
                              {labelText}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      <Clock className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                      Duration *
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      required
                      disabled={isFirstTime}
                      className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {isFirstTime ? (
                        <option value={10}>10 minutes (Locked for Free Session)</option>
                      ) : ['birth_chart', 'vastu_consultation', 'marriage_consultation', 'numerology_consultation'].includes(consultationType) ? (
                        <>
                          <option value={60}>60 minutes - ₹{consultationTypes[consultationType]?.price || 150}</option>
                          <option value={90}>90 minutes - ₹{Math.round((consultationTypes[consultationType]?.price || 150) * 1.5)}</option>
                        </>
                      ) : consultationType === 'horoscope_weekly' ? (
                        <option value={15}>15 minutes</option>
                      ) : consultationType === 'horoscope_monthly' ? (
                        <option value={30}>30 minutes</option>
                      ) : consultationType === 'horoscope_yearly' ? (
                        <option value={60}>60 minutes</option>
                      ) : consultationType === 'custom_questions' ? (
                        <>
                          <option value={15}>15 minutes - Rs. 251 (Max 10 questions)</option>
                          <option value={30}>30 minutes - Rs. 501 (Max 20 questions)</option>
                        </>
                      ) : (
                        durationOptions.filter(opt => opt.value !== 10).map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* Appointment Date */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      <Calendar className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={getMinDate()}
                      required
                      className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold"
                    />
                  </div>

                  {/* Time Slots */}
                  <div>
                    <label className="block text-xs font-semibold text-black mb-1">
                      <Clock className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                      Select Time Slot *
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      disabled={!appointmentDate || !selectedAstrologer}
                      className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-astro-gold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!appointmentDate || !selectedAstrologer ? 'Choose date & astrologer first' : 'Choose a time'}
                      </option>
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))
                      ) : (
                        appointmentDate && selectedAstrologer && (
                          <option disabled>No available slots for this date</option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* Question Selection for custom_questions */}
              {consultationType === 'custom_questions' && (
                <div className="bg-black/5 rounded-2xl p-4 border border-black/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-black text-sm flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-astro-gold" />
                      Select Questions for Session
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${selectedQuestions.length >= getQuestionLimit(duration) ? 'bg-red-100 text-red-700' : 'bg-astro-purple/10 text-astro-purple'}`}>
                      Questions: {selectedQuestions.length} / Max {getQuestionLimit(duration)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-black/70 mb-1">
                        Select Topic
                      </label>
                      <select
                        value={selectedTopic}
                        onChange={(e) => {
                          setSelectedTopic(e.target.value);
                          setSelectedQuestion('');
                        }}
                        className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-[14px] text-black focus:outline-none focus:ring-1 focus:ring-astro-gold"
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
                      <label className="block text-[11px] font-medium text-black/70 mb-1">
                        Select Question
                      </label>
                      <select
                        value={selectedQuestion}
                        onChange={(e) => setSelectedQuestion(e.target.value)}
                        disabled={!selectedTopic}
                        className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-[14px] text-black focus:outline-none focus:ring-1 focus:ring-astro-gold disabled:opacity-50"
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

                  <div className="flex justify-end items-center">
                    <button
                      type="button"
                      disabled={!selectedTopic || !selectedQuestion || selectedQuestions.length >= getQuestionLimit(duration)}
                      onClick={() => {
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
                      className="px-3 py-1.5 bg-yellow-400 hover:bg-emerald-400 disabled:bg-yellow-400 disabled:text-black text-black font-bold rounded-lg text-[14px] transition cursor-pointer"
                    >
                      Add Question +
                    </button>
                  </div>

                  {selectedQuestions.length > 0 && (
                    <div className="border-t border-black/10 pt-2 space-y-1.5 max-h-32 overflow-y-auto">
                      {selectedQuestions.map((q, idx) => (
                        <div key={idx} className="flex items-start justify-between bg-white p-2 rounded-lg border border-black/5 text-xs">
                          <span className="text-black truncate mr-2"><strong className="text-astro-purple">[{q.topic}]</strong> {q.question}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedQuestions((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Palmistry Palm Images Upload Section */}
              {(astrologerCategory === 'palmistry' || consultationType === 'palmistry') && (
                <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-amber-500/10 rounded-2xl p-4 border border-purple-300/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <Hand className="h-5 w-5 text-purple-700" />
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Upload Palm Images for Analysis</h4>
                      <p className="text-[11px] text-gray-600">Upload clear photos of right and left palms for reading.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-800 mb-1">Right Hand Palm</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePalmImageChange(e, 'right')}
                        className="hidden"
                        id="rightHandPalmUpload"
                      />
                      <label
                        htmlFor="rightHandPalmUpload"
                        className="block w-full p-2.5 bg-white border border-dashed border-purple-300 rounded-lg cursor-pointer text-center text-xs hover:border-purple-500"
                      >
                        {palmImagePreviews.rightHandImage ? (
                          <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Right Palm Uploaded (Change)
                          </span>
                        ) : (
                          <span className="text-gray-600">Click to upload right palm</span>
                        )}
                      </label>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-800 mb-1">Left Hand Palm</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePalmImageChange(e, 'left')}
                        className="hidden"
                        id="leftHandPalmUpload"
                      />
                      <label
                        htmlFor="leftHandPalmUpload"
                        className="block w-full p-2.5 bg-white border border-dashed border-purple-300 rounded-lg cursor-pointer text-center text-xs hover:border-purple-500"
                      >
                        {palmImagePreviews.leftHandImage ? (
                          <span className="text-green-600 font-semibold flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> Left Palm Uploaded (Change)
                          </span>
                        ) : (
                          <span className="text-gray-600">Click to upload left palm</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-black mb-1">
                  <FileText className="inline h-3.5 w-3.5 mr-1 text-astro-gold" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-black/15 rounded-lg text-sm text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-astro-gold"
                  placeholder="Any specific questions or areas you'd like to focus on..."
                />
              </div>

              {/* Price Display */}
              {consultationType && (
                <div className={`bg-gradient-to-r ${isFirstTime ? 'from-green-500/15 to-emerald-500/15 border-green-400/40' : 'from-astro-purple/10 to-mystic-indigo/10 border-astro-purple/20'} border rounded-xl p-3.5`}>
                  <div className="flex items-center justify-between text-black">
                    <span className="text-xs sm:text-sm font-semibold flex items-center">
                      <IndianRupee className="inline h-4 w-4 mr-1 text-astro-gold" />
                      Total Consultation Price:
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-black">
                        {isFirstTime ? (
                          <span className="text-green-600 flex items-center gap-1.5">
                            FREE 🎉 <span className="text-xs font-normal">(1st Session)</span>
                          </span>
                        ) : (
                          `₹${calculatePrice()}`
                        )}
                      </span>
                      {!isFirstTime && (
                        <span className="block text-[11px] font-medium text-gray-700">
                          {isFixedPrice ? `Fixed (${duration} mins)` : `₹${astroPerMinuteRate}/min live call`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {!isFirstTime && (
                isFixedPrice
                  ? walletBalance < calculatePrice()
                  : walletBalance < astroPerMinuteRate * 2
              ) ? (
                <div className="text-center pt-1">
                  <p className="text-red-500 text-xs mb-2">
                    {isFixedPrice
                      ? `Insufficient balance (₹${walletBalance.toFixed(2)}). Package requires ₹${calculatePrice()}. Please recharge.`
                      : `Insufficient balance (₹${walletBalance.toFixed(2)}). At least 2 minutes (₹${astroPerMinuteRate * 2}) required.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-green-600 hover:bg-green-700 transition cursor-pointer"
                  >
                    Go to Wallet to Recharge
                  </button>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !selectedTime}
                  className="w-full flex justify-center py-3 px-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isFirstTime ? (
                    'Book Free Appointment'
                  ) : isFixedPrice ? (
                    `Pay ₹${calculatePrice()} from Wallet & Book`
                  ) : (
                    `Book Appointment (₹${astroPerMinuteRate}/min Deducted During Video Call)`
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;