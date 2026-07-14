# Gemini AI API Key Setup

## How to Get a Valid Gemini API Key

To use the Gemini AI integration in this chatbot, you need to obtain a valid API key from Google:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API key" or navigate to the API keys section
4. Create a new API key
5. Copy the API key

## Update Your Environment Configuration

Replace the placeholder API key in your `.env` file:

```env
# Google Gemini AI Configuration
# NOTE: Replace with your valid API key from https://aistudio.google.com/
GEMINI_API_KEY=your_actual_api_key_here
```

## Testing the API Key

After updating your API key, you can test it using the provided test script:

```bash
cd c:\Users\User\Desktop\Astrology\backend
node test-gemini-key.js
```

You should see output similar to:
```
Testing Gemini API key: ✅ Key loaded
Key length: 39
✅ Gemini AI SDK loaded successfully
✅ Gemini API connection successful
Test response: Hello
```

## Troubleshooting

If you encounter issues:

1. **Invalid API Key Error**: 
   - Double-check that you've copied the complete API key
   - Ensure there are no extra spaces or characters
   - Verify the key was created in Google AI Studio

2. **Network Issues**:
   - Check your internet connection
   - Ensure your firewall isn't blocking requests to Google's APIs

3. **Rate Limiting**:
   - Gemini has usage quotas; check your usage in the Google AI Studio dashboard
   - For development, consider implementing request throttling

## Security Note

Never commit your actual API key to version control. The `.env` file is included in `.gitignore` to prevent accidental commits.