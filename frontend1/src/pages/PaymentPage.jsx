import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { liveChatAPI } from '../services/api';
import { Shield, CreditCard, Sparkles, CheckCircle, Smartphone } from 'lucide-react';

const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const paymentId = searchParams.get('paymentId');
    const amount = searchParams.get('amount') || '51';
    const astroName = searchParams.get('astroName') || 'Astrologer';
    const astrologerId = searchParams.get('astrologerId');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('upi');

    useEffect(() => {
        if (!paymentId) {
            alert('Invalid Payment Request');
            navigate('/live-chat');
        }
    }, [paymentId, navigate]);

    const handleConfirmPayment = async () => {
        try {
            setLoading(true);
            const response = await liveChatAPI.confirmDakshinaPayment(paymentId);
            if (response.data.success || response.data.payment?.paymentStatus === 'completed') {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/live-chat', { state: { autoSelectAstroId: astrologerId } });
                }, 2500);
            } else {
                alert('Payment verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Failed to complete mock payment.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white">
                <Navigation />
                <div className="bg-slate-900/60 backdrop-blur-2xl p-10 rounded-3xl border border-emerald-500/30 text-center max-w-md mx-auto shadow-[0_20px_50px_rgba(16,185,129,0.15)] animate-in zoom-in-95 duration-300">
                    <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6 animate-bounce" />
                    <h2 className="text-2xl font-black uppercase tracking-wider text-emerald-400 mb-2">Offer Accepted!</h2>
                    <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                        Your Guru Dakshina of <span className="font-extrabold text-white text-lg">₹{amount}</span> has been received with reverence.
                    </p>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                        Redirecting back to Live Chat...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <Navigation />
            
            <div className="flex-1 flex items-center justify-center p-4 pt-28">
                <div className="w-full max-w-lg bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl relative">
                    {/* Header Decorative Sparkle */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" /> Secure Gateway
                    </div>

                    <div className="text-center mt-4 mb-8">
                        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">Offer Guru Dakshina</h2>
                        <p className="text-3xl font-black text-white">₹{amount}</p>
                        <p className="text-xs text-slate-300 mt-2 font-medium">To consult with <span className="text-amber-400 font-bold">{astroName}</span></p>
                    </div>

                    {/* Tabs */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 border border-white/5 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('upi')}
                            className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                paymentMethod === 'upi' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            <Smartphone className="w-4 h-4" /> UPI Apps
                        </button>
                        <button
                            type="button"
                            onClick={() => setPaymentMethod('card')}
                            className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                paymentMethod === 'card' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
                            }`}
                        >
                            <CreditCard className="w-4 h-4" /> Card
                        </button>
                    </div>

                    {/* Method Details */}
                    {paymentMethod === 'upi' ? (
                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/20 transition-all flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium text-slate-200">Google Pay / PhonePe / Paytm</span>
                                <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">Instant</span>
                            </div>
                            <input
                                type="text"
                                placeholder="enter-your-upi-id@okhdfc"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder-white/30"
                            />
                        </div>
                    ) : (
                        <div className="space-y-4 mb-8">
                            <input
                                type="text"
                                placeholder="Card Number"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder-white/30"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder-white/30"
                                />
                                <input
                                    type="password"
                                    placeholder="CVV"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder-white/30"
                                />
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleConfirmPayment}
                        className="w-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black uppercase tracking-wider py-4 rounded-2xl shadow-lg shadow-amber-500/15 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent animate-spin rounded-full" />
                        ) : (
                            <>Confirm Offering (₹{amount})</>
                        )}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <Shield className="w-4 h-4" /> 256-Bit SSL Encrypted Transaction
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
