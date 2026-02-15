import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);


    // Create a new FormData instance for the external request
    const externalFormData = new FormData();
    externalFormData.append('file', file);

    // Send to n8n webhook
    // Use fallback values if environment variables are not set (e.g. in Netlify without manual config)
    const webhookUrl = process.env.WEBHOOK_URL || 'https://coy-personal-n8n.l2p5bx.easypanel.host/webhook/procesador-facturas';
    const apiKey = process.env.WEBHOOK_API_KEY || 'rJbYEKt4p4QU7O7EmfkrUvEU0bHjv54a';

    // Set a longer timeout for the fetch if needed by using AbortController (optional but good practice)
    // const controller = new AbortController();
    // const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: externalFormData,
      headers: {
        'miapikey': apiKey,
      },
      // signal: controller.signal
    });

    // clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);

      // Try to parse JSON error if possible
      let errorMessage = `Webhook failed with status: ${response.status}`;
      try {
        const jsonError = JSON.parse(errorText);
        if (jsonError.message) errorMessage = jsonError.message;
        else if (jsonError.error) errorMessage = jsonError.error;
      } catch {
        // If text is short, append it
        if (errorText.length < 200) errorMessage += ` - ${errorText}`;
      }

      throw new Error(errorMessage);
    }

    // Try to parse JSON, fallback to text
    let data;
    const responseText = await response.text();
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { message: responseText };
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
