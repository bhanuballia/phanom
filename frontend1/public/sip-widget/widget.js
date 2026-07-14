// Generic SIP Widget using SIP.js
// Ensure SIP.js is loaded before this script

class SipWidget {
    constructor(config) {
        console.log("SipWidget: Constructor called with config", config);
        this.config = config;
        this.userAgent = null;
        this.session = null;
        this.isRegistered = false;
        this.audioElement = new Audio();

        this.initUI();
    }

    initUI() {
        // Container
        const container = document.createElement('div');
        container.className = 'sip-widget-container';

        // Status Label
        this.statusEl = document.createElement('div');
        this.statusEl.className = 'sip-status';
        this.statusEl.textContent = 'Disconnected';
        container.appendChild(this.statusEl);

        // Call Button
        this.btn = document.createElement('button');
        this.btn.className = 'sip-call-btn';
        this.btn.innerHTML = `
      <svg width="32" height="32" viewBox="0 0 24 24">
        <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1.01A11.36 11.36 0 0 1 8.5 3.99C8.5 3.44 8.05 3 7.5 3H3.99C3.44 3 3 3.44 3 3.99 3 13.28 10.73 21 20.01 21c.55 0 .99-.45.99-.99v-3.51c0-.55-.45-.99-.99-.99z"/>
      </svg>`;
        this.btn.onclick = () => this.toggleCall();
        container.appendChild(this.btn);

        // Error Modal
        this.errorModal = document.createElement('div');
        this.errorModal.className = 'sip-error';
        this.errorModal.innerHTML = `
      <h3>Connection Error</h3>
      <p id="sip-error-msg"></p>
      <button onclick="document.querySelector('.sip-error').style.display='none'">Close</button>
    `;
        document.body.appendChild(this.errorModal);
        document.body.appendChild(container);
    }

    updateStatus(status, isError = false) {
        this.statusEl.textContent = status;
        this.statusEl.style.backgroundColor = isError ? 'rgba(211, 47, 47, 0.9)' : 'rgba(0,0,0,0.8)';

        if (status === 'In Call' || status === 'Ringing') {
            this.btn.classList.add('in-call');
            this.btn.innerHTML = `
        <svg viewBox="0 0 24 24">
          <path d="M12 9c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-6H6c-3.31 0-6 2.69-6 6v6c0 3.31 2.69 6 6 6h12c3.31 0 6-2.69 6-6V9c0-3.31-2.69-6-6-6zM6 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm12 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>`; // Hangup icon
        } else {
            this.btn.classList.remove('in-call');
            this.btn.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24">
          <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.05 15.05 0 0 1-6.59-6.59l2.2-2.21a.96.96 0 0 0 .25-1.01A11.36 11.36 0 0 1 8.5 3.99C8.5 3.44 8.05 3 7.5 3H3.99C3.44 3 3 3.44 3 3.99 3 13.28 10.73 21 20.01 21c.55 0 .99-.45.99-.99v-3.51c0-.55-.45-.99-.99-.99z"/>
        </svg>`;
        }
    }

    showError(msg) {
        document.getElementById('sip-error-msg').textContent = msg;
        this.errorModal.style.display = 'block';
        this.updateStatus('Error', true);
    }

    async initSIP() {
        if (!window.SIP) {
            this.showError('SIP.js library not loaded!');
            return;
        }

        this.updateStatus('Connecting...');

        const uri = SIP.UserAgent.makeURI(`sip:${this.config.username}@${this.config.domain}`);

        const transportOptions = {
            server: this.config.websocketUrl
        };

        this.userAgent = new SIP.UserAgent({
            uri: uri,
            transportOptions: transportOptions,
            authorizationUsername: this.config.username,
            authorizationPassword: this.config.password,
            delegate: {
                onDisconnect: (error) => {
                    if (error) {
                        this.showError('Server disconnected: ' + error.message);
                    }
                    this.updateStatus('Disconnected');
                    this.isRegistered = false;
                },
                onInvite: (invitation) => {
                    // Handle incoming calls if needed
                    this.handleIncomingCall(invitation);
                }
            }
        });

        try {
            await this.userAgent.start();
            this.updateStatus('Connected');
            await this.register();
        } catch (error) {
            this.showError('Failed to start UA: ' + error.message);
        }

    }

    async register() {
        const registerer = new SIP.Registerer(this.userAgent);
        try {
            await registerer.register();
            this.isRegistered = true;
            this.updateStatus('Ready to Call');
        } catch (error) {
            this.showError('Registration failed: ' + error.message);
        }
    }

    async toggleCall() {
        if (this.session && this.session.state === SIP.SessionState.Established) {
            // Hangup
            this.session.bye();
        } else if (this.session && this.session.state === SIP.SessionState.Establishing) {
            // Cancel
            this.session.cancel();
        } else {
            // Make Call
            this.makeCall();
        }
    }

    async makeCall() {
        if (!this.userAgent || !this.isRegistered) {
            // Allow trying to connect on click if not already connected
            if (!this.userAgent) await this.initSIP();
            else if (!this.isRegistered) await this.register();

            // If still not ready, stop
            if (!this.isRegistered) return;
        }

        const target = SIP.UserAgent.makeURI(`sip:${this.config.targetNumber}@${this.config.domain}`);
        if (!target) {
            this.showError('Invalid target number URI');
            return;
        }

        const inviter = new SIP.Inviter(this.userAgent, target);
        this.session = inviter;

        // Session Logic
        inviter.stateChange.addListener((newState) => {
            switch (newState) {
                case SIP.SessionState.Establishing:
                    this.updateStatus('Calling...');
                    break;
                case SIP.SessionState.Established:
                    this.updateStatus('In Call');
                    this.setupAudio(inviter);
                    break;
                case SIP.SessionState.Terminated:
                    this.updateStatus('Ready to Call');
                    this.session = null;
                    break;
            }
        });

        try {
            this.updateStatus('Dialing...');
            await inviter.invite({
                sessionDescriptionHandlerOptions: {
                    constraints: { audio: true, video: false }
                }
            });
        } catch (error) {
            this.showError('Call failed: ' + error.message);
        }
    }

    setupAudio(session) {
        const remoteStream = new MediaStream();
        session.sessionDescriptionHandler.peerConnection.getReceivers().forEach((receiver) => {
            if (receiver.track) {
                remoteStream.addTrack(receiver.track);
            }
        });
        this.audioElement.srcObject = remoteStream;
        this.audioElement.play();
    }
}

// Auto-initialize when config is present
window.initSipWidget = function (config) {
    console.log("window.initSipWidget called");
    window.sipWidgetInstance = new SipWidget(config);
};
