class VedAstroChatClient {
    constructor(config = {}) {
        this.apiUrl = config.apiUrl || '/api/chatbot';
        this.userId = config.userId || '101'; // Default guest user
        this.sessionId = config.sessionId || this.generateSessionId();
        this.isAITalking = false;
    }

    generateSessionId() {
        return `Session_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    }

    /**
     * Format birth time to VedAstro URL format
     * @param {Object} birthDetails - { dob, tob, pob }
     * @returns {string} - Formatted time URL
     */
    formatBirthTimeUrl(birthDetails) {
        const { dob, tob, pob } = birthDetails;

        // Parse date
        const birthDate = new Date(dob);
        const day = birthDate.getDate().toString().padStart(2, '0');
        const month = (birthDate.getMonth() + 1).toString().padStart(2, '0');
        const year = birthDate.getFullYear();

        // Format location (remove commas and extra info)
        let location = pob;
        if (location.includes(',')) {
            location = location.split(',')[0].trim();
        }
        location = encodeURIComponent(location);

        // Format time (ensure HH:mm format)
        let time = tob || "12:00";
        // Remove AM/PM if present (VedAstro expects 24h format)
        time = time.replace(/\s*(AM|PM|am|pm)/g, '');

        // Default timezone offset for India
        const offset = encodeURIComponent("+05:30");
        const encodedTime = encodeURIComponent(time);

        return `Location/${location}/Time/${encodedTime}/${day}/${month}/${year}/${offset}`;
    }

    /**
     * Send message to VedAstro HoroscopeChat API
     * @param {string} userMessage - User's question
     * @param {Object} birthDetails - Birth details { dob, tob, pob }
     * @returns {Promise<Object>} - AI response
     */
    async sendMessage(userMessage, birthDetails) {
        try {
            // Validate inputs
            if (!userMessage || !userMessage.trim()) {
                throw new Error('Message cannot be empty');
            }

            if (!birthDetails || !birthDetails.dob || !birthDetails.tob || !birthDetails.pob) {
                throw new Error('Birth details are required (dob, tob, pob)');
            }

            // Set AI talking flag
            this.isAITalking = true;

            // Format birth time URL
            const timeUrl = this.formatBirthTimeUrl(birthDetails);

            // Clean user message (remove question marks as they break API)
            const cleanMessage = encodeURIComponent(userMessage.replace(/\?/g, ''));

            // Construct API URL
            // Construct API URL - targeting local backend intelligent chat
            // The local backend controller handles the complexity of calling VedAstro or falling back to Gemini
            const url = `${this.apiUrl}/chat`;

            console.log('🔮 Calling Local Chat API:', url);

            // Make API call
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    userId: this.userId,
                    dob: birthDetails.dob,
                    tob: birthDetails.tob,
                    pob: birthDetails.pob,
                    name: birthDetails.name,
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed with status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 Local Chat Data:', data);

            // Check response status
            if (data.success) {
                // Update session ID if provided (though local backend might not return it explicitly in same way)
                // this.sessionId = data.sessionId || this.sessionId; 

                return {
                    text: data.response,
                    textHtml: data.response, // Local API returns markdown/text
                    text2: null,
                    text3: null,
                    followUpQuestions: [], // Local API suggestions are different structure
                    commands: [],
                    sessionId: this.sessionId,
                    success: true,
                    audio: null
                };

            } else {
                throw new Error(data.message || 'Unknown error');
            }

        } catch (error) {
            console.error('❌ VedAstro Chat API error:', error);
            this.isAITalking = false;

            return {
                text: 'क्षमा करें, VedAstro AI सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया बाद में पुनः प्रयास करें।',
                textHtml: 'क्षमा करें, VedAstro AI सर्वर से कनेक्ट नहीं हो पा रहा है। कृपया बाद में पुनः प्रयास करें।',
                followUpQuestions: [],
                commands: [],
                sessionId: this.sessionId,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send follow-up question
     * @param {string} followUpQuestion - Follow-up question
     * @param {string} primaryAnswerHash - Hash of the primary answer
     * @param {Object} birthDetails - Birth details
     * @returns {Promise<Object>} - AI response
     */
    async sendFollowUpQuestion(followUpQuestion, primaryAnswerHash, birthDetails) {
        try {
            const timeUrl = this.formatBirthTimeUrl(birthDetails);
            const cleanQuestion = encodeURIComponent(followUpQuestion.replace(/\?/g, ''));

            const url = `${this.apiUrl}/HoroscopeFollowUpChat/${timeUrl}/FollowUpQuestion/${cleanQuestion}/PrimaryAnswerHash/${primaryAnswerHash}/UserId/${this.userId}/SessionId/${this.sessionId}`;

            console.log('🔮 Calling VedAstro Follow-up API:', url);

            const response = await fetch(url);
            const data = await response.json();
            console.log('📦 VedAstro Follow-up Raw Data:', data);

            const status = (data.Status || '').toLowerCase();
            if (status === "pass" || status === "success") {
                const chatData = data.Payload?.HoroscopeFollowUpChat || data.Payload;

                return {
                    text: chatData.Text || '',
                    textHtml: chatData.TextHtml || '',
                    followUpQuestions: chatData.FollowUpQuestions || [],
                    commands: chatData.Commands || [],
                    sessionId: this.sessionId,
                    success: true
                };
            } else {
                throw new Error(`API returned error status: ${data.Status}`);
            }

        } catch (error) {
            console.error('❌ VedAstro Follow-up API error:', error);
            return {
                text: 'क्षमा करें, फॉलो-अप प्रश्न का उत्तर नहीं मिल पाया।',
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Send feedback for a message
     * @param {string} answerHash - Hash of the answer
     * @param {number} feedbackScore - 1 for good, -1 for bad
     * @returns {Promise<Object>} - Feedback response
     */
    async sendFeedback(answerHash, feedbackScore) {
        try {
            const url = `${this.apiUrl}/HoroscopeChatFeedback/AnswerHash/${answerHash}/FeedbackScore/${feedbackScore}`;

            console.log('📊 Sending feedback to VedAstro:', url);

            const response = await fetch(url);
            const data = await response.json();
            console.log('📊 VedAstro Feedback Raw Data:', data);

            const status = (data.Status || '').toLowerCase();
            if (status === "pass" || status === "success") {
                return {
                    success: true,
                    message: 'Feedback submitted successfully'
                };
            } else {
                throw new Error(`Feedback submission failed: ${data.Status}`);
            }

        } catch (error) {
            console.error('❌ VedAstro Feedback error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Reset session (start new conversation)
     */
    resetSession() {
        this.sessionId = this.generateSessionId();
        this.isAITalking = false;
        console.log('🔄 Session reset:', this.sessionId);
    }
}

// Export singleton instance
export default VedAstroChatClient;
