import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { liveChatAPI, buildAssetUrl } from '../services/api';
import {
    MessageSquare,
    Search,
    User,
    Calendar,
    Clock,
    ChevronRight,
    ChevronLeft,
    ArrowLeft
} from 'lucide-react';

const LiveChatHistory = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await liveChatAPI.getAdminSessions();
            setSessions(response.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFullHistory = async (chatId) => {
        try {
            setHistoryLoading(true);
            setSelectedSession(chatId);
            // We need a specific admin endpoint for full history by chatId
            // For now, we can use the messages by sessions logic
            const response = await liveChatAPI.getAdminAllHistory();
            const filtered = response.data.filter(m => m.chatId === chatId);
            setChatHistory(filtered.reverse());
        } catch (error) {
            console.error('Error fetching full history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const filteredSessions = sessions.filter(s =>
        s._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <MessageSquare className="text-amber-500" />
                            Live Chat Monitoring
                        </h1>
                        <p className="text-slate-400 mt-2">Oversee all real-time conversations between users and astrologers.</p>
                    </div>
                    <button
                        onClick={fetchSessions}
                        className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-sm"
                    >
                        Refresh Sessions
                    </button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sessions List */}
                    <div className={`lg:col-span-1 bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[700px] ${selectedSession ? 'hidden lg:flex' : 'flex'}`}>
                        <div className="p-6 border-b border-white/10 bg-white/5">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search sessions..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-amber-500/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {loading ? (
                                <div className="p-10 text-center animate-pulse text-slate-500">Loading sessions...</div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="p-10 text-center text-slate-500">No chat sessions found.</div>
                            ) : (
                                filteredSessions.map((session) => (
                                    <button
                                        key={session._id}
                                        onClick={() => fetchFullHistory(session._id)}
                                        className={`w-full text-left p-6 border-b border-white/5 transition-all hover:bg-white/5 ${selectedSession === session._id ? 'bg-amber-500/10 border-r-4 border-r-amber-500' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-mono text-slate-500 truncate max-w-[150px]">{session._id}</span>
                                            <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                                {new Date(session.lastTimestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white mb-2 line-clamp-2 italic">"{session.lastMessage}"</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs bg-white/5 px-2 py-1 rounded-md text-slate-400">
                                                {session.messageCount} messages
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-600" />
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Chat Transcript View */}
                    <div className={`lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-3xl overflow-hidden flex flex-col h-[700px] ${!selectedSession ? 'hidden lg:flex' : 'flex'}`}>
                        {!selectedSession ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10 opacity-50">
                                <MessageSquare className="w-20 h-20 mb-6" />
                                <h3 className="text-xl font-bold">Select a session</h3>
                                <p>Pick a chat from the left to view the full transcript.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedSession(null)}
                                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-slate-400"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div>
                                            <h3 className="font-bold text-white">Transcript: {selectedSession}</h3>
                                            <p className="text-xs text-slate-400">Viewing archived conversation history</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-xs hover:bg-red-500/20 transition-all">
                                            Flag Session
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                                    {historyLoading ? (
                                        <div className="flex justify-center items-center h-full">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                                        </div>
                                    ) : (
                                        chatHistory.map((msg, index) => (
                                            <div key={index} className="flex flex-col">
                                                <div className="flex items-baseline gap-3 mb-1">
                                                    <span className={`text-xs font-bold ${msg.sender.role === 'astrologer' ? 'text-purple-400' : 'text-blue-400'}`}>
                                                        {msg.sender.name} ({msg.sender.role})
                                                    </span>
                                                    <span className="text-[10px] text-slate-600">
                                                        {new Date(msg.timestamp).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none text-slate-200 text-sm leading-relaxed max-w-[90%]">
                                                    {msg.message}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveChatHistory;
