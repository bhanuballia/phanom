import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hand, Upload, User, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Navigation from '../components/Navigation';
import { authAPI, palmistryAPI } from '../services/api';

const Palmistry = () => {
    const navigate = useNavigate();
    const [astrologers, setAstrologers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        userName: '',
        astrologerId: '',
        astrologerName: ''
    });

    const [images, setImages] = useState({
        rightHandImage: null,
        leftHandImage: null
    });

    const [imagePreviews, setImagePreviews] = useState({
        rightHandImage: null,
        leftHandImage: null
    });

    // Fetch palmistry astrologers
    useEffect(() => {
        const fetchAstrologers = async () => {
            try {
                const response = await authAPI.getAstrologers();
                const palmistryExperts = response.data.astrologers.filter(
                    astrologer => astrologer.specialization?.includes('Palmistry')
                );
                setAstrologers(palmistryExperts);
            } catch (err) {
                console.error('Error fetching astrologers:', err);
                setError('Failed to load astrologers. Please try again.');
            }
        };

        fetchAstrologers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // If astrologer is selected, update astrologer name
        if (name === 'astrologerId') {
            const selectedAstrologer = astrologers.find(a => a._id === value);
            setFormData(prev => ({
                ...prev,
                astrologerName: selectedAstrologer?.name || ''
            }));
        }
    };

    const handleImageChange = (e, hand) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError(`Please upload a valid image file for ${hand} hand`);
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError(`Image size should be less than 10MB for ${hand} hand`);
                return;
            }

            setImages(prev => ({
                ...prev,
                [`${hand}HandImage`]: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({
                    ...prev,
                    [`${hand}HandImage`]: reader.result
                }));
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitSuccess(false);

        // Validation
        if (!formData.userName.trim()) {
            setError('Please enter your name');
            return;
        }

        if (!formData.astrologerId) {
            setError('Please select an astrologer');
            return;
        }

        if (!images.rightHandImage || !images.leftHandImage) {
            setError('Please upload both right and left hand images');
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('userName', formData.userName);
            submitData.append('astrologerId', formData.astrologerId);
            submitData.append('astrologerName', formData.astrologerName);
            submitData.append('rightHandImage', images.rightHandImage);
            submitData.append('leftHandImage', images.leftHandImage);

            await palmistryAPI.submitPalmistry(submitData);

            setSubmitSuccess(true);

            // Reset form
            setFormData({
                userName: '',
                astrologerId: '',
                astrologerName: ''
            });
            setImages({
                rightHandImage: null,
                leftHandImage: null
            });
            setImagePreviews({
                rightHandImage: null,
                leftHandImage: null
            });

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/astrologers');
            }, 3000);
        } catch (err) {
            console.error('Error submitting palmistry form:', err);
            setError(err.response?.data?.message || 'Failed to submit palmistry request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navigation />

            <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6">
                            <Hand className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500">
                            Palmistry Reading
                        </h1>
                        <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                            Get personalized palm reading from expert astrologers. Upload clear images of both your palms and receive detailed insights about your life, career, relationships, and future.
                        </p>
                    </div>

                    {/* Success Message */}
                    {submitSuccess && (
                        <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-start gap-4">
                            <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-green-400 mb-2">Submission Successful!</h3>
                                <p className="text-slate-300">
                                    Your palmistry reading request has been submitted successfully. The astrologer will review your palm images and provide insights soon. Redirecting to astrologers page...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-8 bg-red-500/10 border border-red-500/30 rounded-2xl p-6 flex items-start gap-4">
                            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
                                <p className="text-slate-300">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-3">
                                    Your Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="userName"
                                        value={formData.userName}
                                        onChange={handleInputChange}
                                        placeholder="Enter your full name"
                                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Astrologer Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-3">
                                    Select Palmistry Expert *
                                </label>
                                <select
                                    name="astrologerId"
                                    value={formData.astrologerId}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="bg-slate-900">Select an astrologer</option>
                                    {astrologers.map(astrologer => (
                                        <option key={astrologer._id} value={astrologer._id} className="bg-slate-900">
                                            {astrologer.name} - {astrologer.experience}+ years exp.
                                        </option>
                                    ))}
                                </select>
                                {astrologers.length === 0 && (
                                    <p className="mt-2 text-sm text-amber-400">
                                        No palmistry experts available at the moment. Please check back later.
                                    </p>
                                )}
                            </div>

                            {/* Right Hand Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-3">
                                    Right Hand Palm Image *
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'right')}
                                        className="hidden"
                                        id="rightHandImage"
                                        required
                                    />
                                    <label
                                        htmlFor="rightHandImage"
                                        className="block w-full p-8 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all"
                                    >
                                        {imagePreviews.rightHandImage ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={imagePreviews.rightHandImage}
                                                    alt="Right hand preview"
                                                    className="w-full h-64 object-contain rounded-xl"
                                                />
                                                <p className="text-center text-sm text-green-400 flex items-center justify-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Right hand image uploaded. Click to change.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                                <p className="text-slate-300 mb-2">Click to upload right hand palm image</p>
                                                <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Left Hand Image Upload */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-200 mb-3">
                                    Left Hand Palm Image *
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'left')}
                                        className="hidden"
                                        id="leftHandImage"
                                        required
                                    />
                                    <label
                                        htmlFor="leftHandImage"
                                        className="block w-full p-8 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-purple-500/50 transition-all"
                                    >
                                        {imagePreviews.leftHandImage ? (
                                            <div className="space-y-4">
                                                <img
                                                    src={imagePreviews.leftHandImage}
                                                    alt="Left hand preview"
                                                    className="w-full h-64 object-contain rounded-xl"
                                                />
                                                <p className="text-center text-sm text-green-400 flex items-center justify-center gap-2">
                                                    <CheckCircle className="h-4 w-4" />
                                                    Left hand image uploaded. Click to change.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                                <p className="text-slate-300 mb-2">Click to upload left hand palm image</p>
                                                <p className="text-sm text-slate-500">PNG, JPG up to 10MB</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Tips for better images */}
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-blue-400 mb-3">Tips for Clear Palm Images:</h3>
                                <ul className="space-y-2 text-slate-300 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Ensure good lighting - natural daylight works best</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Keep your palm flat and fingers slightly spread</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Capture the entire palm including all major lines</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span>Avoid shadows and blurry images</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading || astrologers.length === 0}
                                className="w-full py-4 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Hand className="h-5 w-5" />
                                        Submit Palmistry Request
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Info Section */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Expert Analysis</h3>
                            <p className="text-sm text-slate-400">Get detailed palm reading from certified palmistry experts</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto mb-4">
                                <Hand className="h-6 w-6 text-pink-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Comprehensive Reading</h3>
                            <p className="text-sm text-slate-400">Insights on life, career, health, and relationships</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-4">
                                <User className="h-6 w-6 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Personalized Guidance</h3>
                            <p className="text-sm text-slate-400">Receive customized remedies and suggestions</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Palmistry;
