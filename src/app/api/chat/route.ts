// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface OllamaRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
}

interface OllamaResponse {
  message: {
    role: 'assistant';
    content: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    const ollamaReq: OllamaRequest = {
      model: 'tinyllama:latest',
      messages,
      stream: false,
    };

    const ollamaRes = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ollamaReq),
    });

    if (!ollamaRes.ok) {
      console.error('Ollama error', ollamaRes.status, await ollamaRes.text());
      return NextResponse.json(
        { error: 'Ollama API error' },
        { status: 500 }
      );
    }

    const data: OllamaResponse = await ollamaRes.json();

    return NextResponse.json({ content: data.message.content });
  } catch (err) {
    console.error('API error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
