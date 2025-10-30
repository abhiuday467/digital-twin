'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function Twin() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    session_id: sessionId || undefined,
                }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();

            if (!sessionId) {
                setSessionId(data.session_id);
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            // Refocus the input after message is sent
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Check if avatar exists
    const [hasAvatar, setHasAvatar] = useState(false);
    useEffect(() => {
        // Check if avatar.png exists
        fetch('/avatar.png', { method: 'HEAD' })
            .then(res => setHasAvatar(res.ok))
            .catch(() => setHasAvatar(false));
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#d6f3ef] rounded-3xl text-[#0f3f3b] font-[var(--font-brand)]">
            {/* Header */}
            <div className="relative bg-[#013437] text-[#d6f3ef] p-5 rounded-t-3xl border-b-4 border-[#36e0d2]">
                <h2 className="text-xl font-semibold flex items-center gap-2 tracking-wide uppercase">
                    <Bot className="w-6 h-6 text-[#36e0d2]" />
                    AI-Ready Growth Chat
                </h2>
                <p className="text-sm mt-1 text-[#bdf0e9]">Practical steps to make your website visible in AI-led search.</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-[#d6f3ef] via-[#e6faf6] to-[#d6f3ef]">
                {messages.length === 0 && (
                    <div className="text-center text-[#0f3f3b]/70 mt-8">
                        {hasAvatar ? (
                            <img 
                                src="/avatar.png" 
                                alt="Digital Twin Avatar" 
                                className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-[#36e0d2]"
                            />
                        ) : (
                            <Bot className="w-12 h-12 mx-auto mb-3 text-[#36e0d2]" />
                        )}
                        <p className="text-lg font-semibold">Hello! I&apos;m Christopher Clowes.</p>
                        <p className="text-sm mt-2 text-[#0f3f3b]/80">
                            Let&apos;s get your site AI-ready—tell me about your audience and goals.
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        } items-start`}
                    >
                        {message.role === 'assistant' && (
                            <div className="flex-shrink-0">
                                {hasAvatar ? (
                                    <img 
                                        src="/avatar.png" 
                                        alt="Digital Twin Avatar" 
                                        className="w-8 h-8 rounded-full border-2 border-[#36e0d2]"
                                    />
                                ) : (
                                    <div className="w-8 h-8 bg-[#013437] rounded-full flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-[#36e0d2]" />
                                    </div>
                                )}
                            </div>
                        )}

                        <div
                            className={`max-w-[70%] rounded-xl px-4 py-3 shadow-sm ${
                                message.role === 'user'
                                    ? 'bg-[#013437] text-[#d6f3ef]'
                                    : 'bg-white/90 border border-[#9be2d8] text-[#0f3f3b]'
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p
                                className={`text-xs mt-2 uppercase tracking-wide ${
                                    message.role === 'user' ? 'text-[#7dded3]' : 'text-[#0f3f3b]/60'
                                }`}
                            >
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        </div>

                        {message.role === 'user' && (
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-[#0bb7a4] rounded-full flex items-center justify-center border-2 border-white/70">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0">
                            {hasAvatar ? (
                                <img
                                    src="/avatar.png"
                                    alt="Digital Twin Avatar"
                                    className="w-8 h-8 rounded-full border-2 border-[#36e0d2]"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-[#013437] rounded-full flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-[#36e0d2]" />
                                </div>
                            )}
                        </div>
                        <div className="bg-white/90 border border-[#9be2d8] rounded-xl px-4 py-3 shadow-sm">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-[#0bb7a4] rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-[#0bb7a4] rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-[#0bb7a4] rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-[#9be2d8] p-4 bg-[#e6faf6] rounded-b-3xl">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Ask Christopher how to get AI-ready..."
                        className="flex-1 px-4 py-3 border border-[#9be2d8] rounded-xl bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#0bb7a4] focus:border-transparent text-[#0f3f3b]"
                        disabled={isLoading}
                        autoFocus
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || isLoading}
                        className="px-4 py-3 bg-[#0bb7a4] text-white rounded-xl font-semibold uppercase tracking-wide hover:bg-[#099987] focus:outline-none focus:ring-2 focus:ring-[#0bb7a4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
