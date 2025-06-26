// app/page.tsx
'use client';

import React, { useState, useRef, FormEvent } from 'react';
import { BubbleBackground } from '@/components/animate-ui/backgrounds/bubble';

import styles from './page.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: { content: string } = await res.json();

      setMessages((msgs) => [
        ...msgs,
        { id: crypto.randomUUID(), role: 'assistant', content: data.content },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Error: Could not get response from Ollama. ${err instanceof Error ? err.message : 'Unknown error'}`,
        },
      ]);
      // Optionally log error to a service here
      // console.error(err);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
      <BubbleBackground
        interactive
        className="absolute inset-0 flex items-center justify-center rounded-xl -x-1"
      />
      </div>
      <main className={styles.main}>
      <h1 className='text-3xl font-extrabold text-white'>Ollama Chatbot</h1>
      <div className={styles.chat}>
        {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
          textAlign: msg.role === 'user' ? 'right' : 'left',
          margin: '8px 0',
          }}
        >
          <span
            style={{
            display: 'inline-block',
            padding: '8px 12px',
            borderRadius: 8,
            background: msg.role === 'user' ? 'var(--chat-b-bg)' : 'var(--chat-a-bg)',
            }}
          >
            {msg.content.split(/(```[\s\S]*?```)/g).map((part, i) => {
            if (part.startsWith('```') && part.endsWith('```')) {
              const code = part.slice(3, -3).replace(/^\n/, '');
              return (
              <pre key={i} style={{ background: '#222', color: '#fff', padding: 12, borderRadius: 6, overflowX: 'auto' }}>
                <code>{code}</code>
              </pre>
              );
            }
            return <span key={i}>{part}</span>;
            })}
          </span>
        </div>
        ))}
        {loading && (
        <div style={{ color: '#888', fontStyle: 'italic' }}>Ollama is thinking…</div>
        )}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex', gap: 8, color: '#fff' }}>
        <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message…"
        style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        disabled={loading}
        autoFocus
        />
        <button className={styles.button} type="submit" disabled={loading || !input.trim()}>
        Send
        </button>
      </form>
      </main>
    </>
  );
}
