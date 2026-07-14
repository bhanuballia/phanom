import React, { useState } from 'react';
import { chatbotAPI } from '../services/api';

const ChatbotDebug = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testMessage = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('Testing chatbot API with message:', message);
      const result = await chatbotAPI.sendMessage(message);
      console.log('API Response:', result);
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message + ' - ' + JSON.stringify(err.response?.data || {}));
    } finally {
      setLoading(false);
    }
  };

  const testAuthenticatedMessage = async () => {
    setLoading(true);
    setError('');
    setResponse('');

    try {
      console.log('Testing authenticated chatbot API with message:', message);
      const result = await chatbotAPI.sendMessageWithContext(message);
      console.log('Authenticated API Response:', result);
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (err) {
      console.error('Authenticated API Error:', err);
      setError(err.message + ' - ' + JSON.stringify(err.response?.data || {}));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Chatbot Debug Console</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Message:
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter test message (e.g., 'गायत्री मंत्र बताइए')"
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        
        <div className="mt-4 space-x-4">
          <button
            onClick={testMessage}
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Public API'}
          </button>
          
          <button
            onClick={testAuthenticatedMessage}
            disabled={loading || !message.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Authenticated API'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">API Response:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
            {response}
          </pre>
        </div>
      )}
      
      <div className="mt-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Quick Test Messages:</h3>
        <div className="space-y-2">
          <button
            onClick={() => setMessage('गायत्री मंत्र बताइए')}
            className="block w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            गायत्री मंत्र बताइए
          </button>
          <button
            onClick={() => setMessage('नमस्ते')}
            className="block w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            नमस्ते
          </button>
          <button
            onClick={() => setMessage('मेरी राशि क्या है')}
            className="block w-full text-left p-2 bg-gray-50 hover:bg-gray-100 rounded"
          >
            मेरी राशि क्या है
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDebug;