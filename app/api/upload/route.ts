import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, Size: ${file.size} bytes`);

    // Manual Multipart Construction (The "Nuclear Option" for reliability)
    // We construct the raw byte buffer manually to ensure 100% control over the binary data

    const boundary = '---------------------------' + Date.now().toString(16);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Header for the file part
    const header = `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${file.name}"\r\n` +
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

    // Footer for the multipart body
    const footer = `\r\n--${boundary}--\r\n`;

    // Combine everything into a single Buffer
    const fullBody = Buffer.concat([
      Buffer.from(header, 'utf-8'),
      fileBuffer,
      Buffer.from(footer, 'utf-8')
    ]);

    const webhookUrl = process.env.WEBHOOK_URL || 'https://coy-personal-n8n.l2p5bx.easypanel.host/webhook/procesador-facturas';
    const apiKey = process.env.WEBHOOK_API_KEY || 'rJbYEKt4p4QU7O7EmfkrUvEU0bHjv54a';

    console.log(`Sending manual multipart request. Total size: ${fullBody.length}`);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: fullBody,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length.toString(),
        'miapikey': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', errorText);
      return NextResponse.json({ error: `Webhook error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json().catch(() => ({ success: true }));
    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Manual Upload Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
