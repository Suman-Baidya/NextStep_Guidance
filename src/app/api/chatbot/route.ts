import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@insforge/nextjs/server';
import { createClient } from '@insforge/sdk';

export async function POST(request: NextRequest) {
  try {
    // Get auth token (works for both authenticated and anonymous users)
    const { token } = await auth().catch(() => ({ token: null }));

    // Create client with token if available, otherwise use anon key
    const baseUrl =
      process.env.NEXT_PUBLIC_INSFORGE_BASE_URL ||
      'https://dw38nz2i.ap-southeast.insforge.app';
    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || '';

    const client = createClient({
      baseUrl,
      ...(token ? { edgeFunctionToken: token } : { anonKey }),
    });

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const completion = await client.ai.chat.completions.create({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for NextStep Guidance, a consultancy platform that helps users achieve their goals through structured planning. Be friendly, concise, and helpful. Answer questions about the service, how it works, goal setting, and general inquiries.',
        },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    const assistantMessage =
      completion.choices[0]?.message?.content ||
      'I apologize, but I could not generate a response. Please try again.';

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Failed to generate response',
        details: error?.toString(),
      },
      { status: 500 }
    );
  }
}
