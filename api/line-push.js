// Vercel Serverless Function: /api/line-push
// Acts as a server-side proxy to the LINE Messaging API.
// This bypasses browser CORS restrictions since the call is made server-to-server.

export default async function handler(req, res) {
  // Allow CORS from the app's own origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.VITE_LINE_CHANNEL_ACCESS_TOKEN ||
    'J00lAX72A/wSSFMXFDlV1l1royQK7zkGWHPAjos/3HsYgS1wSL0qEa7/f93JGyPgzE/5z6PWVRRMuugSOMt9KVx8PsBQmfJ0TGcmB+bx6t15DpkWv6b9jKAHYI22z16vFCtEIpY3G/3X2wFB85TKTgdB04t89/1O/w1cDnyilFU=';

  if (!token) {
    return res.status(500).json({ error: 'LINE channel access token not configured' });
  }

  try {
    const { path = '/v2/bot/message/push', body } = req.body;

    const lineResponse = await fetch(`https://api.line.me${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await lineResponse.json();
    return res.status(lineResponse.status).json(data);
  } catch (error) {
    console.error('LINE proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
