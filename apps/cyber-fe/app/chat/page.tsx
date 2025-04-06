'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendPrompt = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: 'user' as const, content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/Ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a cybersecurity AI.' },
            { role: 'user', content: userInput },
          ],
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullResponse += chunk;

          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === 'assistant') {
              return [...prev.slice(0, -1), { role: 'assistant', content: last.content + chunk }];
            } else {
              return [...prev, { role: 'assistant', content: chunk }];
            }
          });
        }
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'No response body received.' }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error processing your request.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-800">Cyberhive Security Assistant</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">Welcome to Cyberhive Security Assistant</p>
              <p className="mt-1">Ask me anything about pentesting, scanning, security assessments, or network reconnaissance.</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start ${message.role === 'assistant' ? 'bg-white' : 'bg-gray-50'} p-6 rounded-lg`}
            >
              {message.role === 'assistant' ? (
                <Bot className="w-6 h-6 text-blue-600 mt-1" />
              ) : (
                <User className="w-6 h-6 text-gray-600 mt-1" />
              )}
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {message.role === 'assistant' ? 'Assistant' : 'You'}
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">{message.content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-pulse text-gray-500">Processing your request...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-end gap-4">
          <div className="flex-1 relative">
            <textarea
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-400 min-h-[52px] max-h-[200px] overflow-y-auto"
              rows={1}
              placeholder="Ask about pentesting, scanning techniques, security assessments, or network reconnaissance..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              style={{ height: 'auto', maxHeight: '200px' }}
            />
            <button
              onClick={sendPrompt}
              disabled={loading || !userInput.trim()}
              className={`absolute right-2 bottom-2.5 p-1.5 rounded-md ${
                loading || !userInput.trim()
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-w-3xl mx-auto mt-2">
          <p className="text-xs text-gray-500 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
