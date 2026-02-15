import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Transparent Proxy: Forward the incoming stream directly to n8n
    // This avoids parsing and re-serializing the file, preventing corruption.

    const webhookUrl = process.env.WEBHOOK_URL || 'https://coy-personal-n8n.l2p5bx.easypanel.host/webhook/procesador-facturas';
    const apiKey = process.env.WEBHOOK_API_KEY || 'rJbYEKt4p4QU7O7EmfkrUvEU0bHjv54a';

    const contentType = request.headers.get('content-type');

    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Invalid content-type, expected multipart/form-data' }, { status: 400 });
    }

    // Forward the request body (stream) directly
    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: request.body,
      headers: {
        'Content-Type': contentType, // Preserve boundary and multipart type
        'miapikey': apiKey,
      },
      // @ts-ignore - Required for Node.js fetch with streams
      duplex: 'half',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook processing error:', errorText);
      return NextResponse.json({ error: `Webhook error: ${response.status}`, details: errorText }, { status: response.status });
    }

    // Return the successful response from n8n
    const data = await response.json().catch(() => ({ success: true }));
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
