import React, { useState, useEffect, useRef } from 'react';
import * as SIP from 'sip.js';
import { testWebSocketConnections } from '../utils/sipConfigTester';
import './SipWidget.css';

const SipWidget = () => {
    const [status, setStatus] = useState('Disconnected');
    const [isError, setIsError] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isInCall, setIsInCall] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isTesting, setIsTesting] = useState(false);

    // Configuration
    const config = {
        username: 'bhanu361',
        password: 'Bhanu@361', // Correct password from Mizu VoIP portal
        domain: 'voip.mizu-voip.com',
        websocketUrl: 'wss://voip.mizu-voip.com/ws', // Standard WSS with /ws path
        targetNumber: '9792769515'
    };

    const userAgentRef = useRef(null);
    const sessionRef = useRef(null);
    const audioElementRef = useRef(new Audio());

    useEffect(() => {
        // Expose SIP to window for external scripts/tests
        if (typeof window !== 'undefined') {
            window.SIP = SIP;
        }

        // Attempt to register on mount (optional, or wait for click)
        initSIP(); // Uncomment to connect immediately on load

        return () => {
            if (userAgentRef.current) {
                userAgentRef.current.stop();
            }
        };
    }, []);

    const updateStatus = (newStatus, error = false) => {
        setStatus(newStatus);
        setIsError(error);
        if (newStatus === 'In Call' || newStatus === 'Ringing') {
            setIsInCall(true);
        } else {
            setIsInCall(false);
        }
    };

    const showError = (msg) => {
        setErrorMsg(msg);
        setShowErrorModal(true);
        updateStatus('Error', true);
    };

    const testConnections = async () => {
        setIsTesting(true);
        updateStatus('Testing connections...');
        console.log('[SIP] Starting connection tests...');

        const result = await testWebSocketConnections(
            config.username,
            config.password,
            config.domain
        );

        setIsTesting(false);

        if (result.success) {
            console.log('[SIP] Found working WebSocket URL:', result.url);
            alert(`✓ Found working connection!\n\nWebSocket URL: ${result.url}\n\nPlease update your configuration to use this URL.`);
            updateStatus('Test Complete');
        } else {
            console.error('[SIP] All connection tests failed');
            showError('All WebSocket URLs failed. Please check:\n• Server configuration\n• Network/firewall settings\n• Account credentials');
        }
    };

    const initSIP = async () => {
        if (userAgentRef.current && userAgentRef.current.state === SIP.UserAgentState.Started) {
            console.log('[SIP] Already started, skipping initialization');
            return;
        }

        console.log('[SIP] Initializing connection...');
        console.log('[SIP] Config:', {
            username: config.username,
            domain: config.domain,
            websocketUrl: config.websocketUrl
        });

        updateStatus('Connecting...');

        const uri = SIP.UserAgent.makeURI(`sip:${config.username}@${config.domain}`);
        if (!uri) {
            showError('Invalid SIP URI configuration');
            return;
        }

        const transportOptions = {
            server: config.websocketUrl,
            connectionTimeout: 10, // 10 seconds
            keepAliveInterval: 30, // Send keep-alive every 30 seconds
            traceSip: true // Enable SIP message tracing
        };

        const userAgent = new SIP.UserAgent({
            uri: uri,
            transportOptions: transportOptions,
            authorizationUsername: config.username,
            authorizationPassword: config.password,
            logLevel: 'debug', // Enable debug logging
            delegate: {
                onConnect: () => {
                    console.log('[SIP] WebSocket connected successfully');
                    updateStatus('Connected');
                },
                onDisconnect: (error) => {
                    if (error) {
                        console.error('[SIP] Server disconnected with error:', error);
                        console.error('[SIP] Error details:', {
                            message: error.message,
                            code: error.code,
                            reason: error.reason
                        });
                        showError(`Connection lost: ${error.message || 'Unknown error'}`);
                    } else {
                        console.log('[SIP] Server disconnected normally');
                    }
                    updateStatus('Disconnected');
                    setIsRegistered(false);
                },
                onInvite: (invitation) => {
                    console.log('[SIP] Incoming call received');
                    // Handle incoming calls if needed
                    // handleIncomingCall(invitation);
                }
            }
        });

        // Add transport error handling
        userAgent.transport.onError = (error) => {
            console.error('[SIP] Transport error:', error);
        };

        userAgent.transport.onWebSocketError = (error) => {
            console.error('[SIP] WebSocket error:', error);
            showError(`WebSocket error: ${error.message || 'Connection failed'}`);
        };

        userAgentRef.current = userAgent;

        try {
            console.log('[SIP] Starting UserAgent...');
            await userAgent.start();
            console.log('[SIP] UserAgent started successfully');
            updateStatus('Connected');
            await register(userAgent);
        } catch (error) {
            console.error('[SIP] Failed to start UserAgent:', error);
            console.error('[SIP] Error stack:', error.stack);

            // Provide more specific error messages
            let errorMessage = 'Failed to start UA: ' + error.message;
            if (error.message.includes('WebSocket')) {
                errorMessage += '\n\nPossible causes:\n• Server may be down or unreachable\n• Port 10081 may be blocked\n• Invalid credentials\n• Network/firewall restrictions';
            }
            showError(errorMessage);
        }
    };

    const register = async (userAgent) => {
        const registerer = new SIP.Registerer(userAgent);
        try {
            await registerer.register();
            setIsRegistered(true);
            updateStatus('Ready to Call');
        } catch (error) {
            showError('Registration failed: ' + error.message);
        }
    };

    const toggleCall = async () => {
        // If currently in a call or establishing one
        if (sessionRef.current) {
            if (sessionRef.current.state === SIP.SessionState.Established) {
                sessionRef.current.bye();
            } else if (sessionRef.current.state === SIP.SessionState.Establishing) {
                sessionRef.current.cancel();
            }
            // State updates handled by event listeners
            return;
        }

        // Otherwise, make a call
        makeCall();
    };

    const makeCall = async () => {
        if (!userAgentRef.current || !isRegistered) {
            // Try to initialize and register first
            await initSIP();
            // Check if successful
            if (!userAgentRef.current || userAgentRef.current.state !== SIP.UserAgentState.Started) {
                return;
            }
        }

        const target = SIP.UserAgent.makeURI(`sip:${config.targetNumber}@${config.domain}`);
        if (!target) {
            showError('Invalid target number URI');
            return;
        }

        const inviter = new SIP.Inviter(userAgentRef.current, target);
        sessionRef.current = inviter;

        // Session Logic
        inviter.stateChange.addListener((newState) => {
            console.log("Session state changed to:", newState);
            switch (newState) {
                case SIP.SessionState.Establishing:
                    updateStatus('Calling...');
                    break;
                case SIP.SessionState.Established:
                    updateStatus('In Call');
                    setupAudio(inviter);
                    break;
                case SIP.SessionState.Terminated:
                    updateStatus('Ready to Call');
                    sessionRef.current = null;
                    setIsInCall(false);
                    break;
                default:
                    break;
            }
        });

        try {
            updateStatus('Dialing...');
            await inviter.invite({
                sessionDescriptionHandlerOptions: {
                    constraints: { audio: true, video: false }
                }
            });
        } catch (error) {
            showError('Call failed: ' + error.message);
            sessionRef.current = null;
        }
    };

    const setupAudio = (session) => {
        const remoteStream = new MediaStream();
        const pc = session.sessionDescriptionHandler.peerConnection;
        if (pc) {
            pc.getReceivers().forEach((receiver) => {
                if (receiver.track) {
                    remoteStream.addTrack(receiver.track);
                }
            });
            audioElementRef.current.srcObject = remoteStream;
            audioElementRef.current.play().catch(e => console.error("Audio play error", e));
        }
    };

    return (
        <>
            <div className="sip-widget-container">
                <div className={`sip-status ${status !== 'Disconnected' ? 'visible' : ''}`} style={{ backgroundColor: isError ? 'rgba(211, 47, 47, 0.9)' : 'rgba(0,0,0,0.8)' }}>
                    {status}
                </div>

                <button className={`sip-call-btn ${isInCall ? 'in-call' : ''}`} onClick={toggleCall} title={isInCall ? "Hangup" : "Call Astro Support"}>
                    {isInCall ? (
                        <svg viewBox="0 0 24 24">
                            <path d="M12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-6H6c-3.31 0-6 2.69-6 6v6c0 3.31 2.69 6 6 6h12c3.31 0 6-2.69 6-6V9c0-3.31-2.69-6-6-6zM6 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                        </svg>
                    ) : (
                        <svg width="32" height="32" viewBox="0 0 24 24">
                            <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1.01A11.36 11.36 0 0 1 8.5 3.99C8.5 3.44 8.05 3 7.5 3H3.99C3.44 3 3 3.44 3 3.99 3 13.28 10.73 21 20.01 21c.55 0 .99-.45.99-.99v-3.51c0-.55-.45-.99-.99-.99z" />
                        </svg>
                    )}
                </button>
            </div>

            {showErrorModal && (
                <div className="sip-error" style={{ display: 'block' }}>
                    <h3>Connection Error</h3>
                    <p style={{ whiteSpace: 'pre-line' }}>{errorMsg}</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={testConnections} disabled={isTesting}>
                            {isTesting ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button onClick={() => setShowErrorModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default SipWidget;
