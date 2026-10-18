import { NextResponse } from 'next/server';

const INDEXNOW_KEY = 'c74384d4fa8448eb97a151b75249a05c';
const HOST = 'promptshift.dev';

const KEY_URLS = [
  'https://promptshift.dev',
  'https://promptshift.dev/cli',
  'https://promptshift.dev/convert/cursor-to-claude',
  'https://promptshift.dev/convert/claude-to-cursor',
  'https://promptshift.dev/convert/gemini-to-cursor',
  'https://promptshift.dev/convert/gemini-to-claude',
  'https://promptshift.dev/convert/cursor-to-gemini',
  'https://promptshift.dev/convert/claude-to-gemini',
  'https://promptshift.dev/convert/openai-to-cursor',
  'https://promptshift.dev/convert/cursor-to-openai',
  'https://promptshift.dev/convert/openai-to-claude',
  'https://promptshift.dev/convert/claude-to-openai',
  'https://promptshift.dev/convert/openai-to-gemini',
  'https://promptshift.dev/convert/gemini-to-openai',
];

export async function POST() {
  try {
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: KEY_URLS,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
      return NextResponse.json({
        success: true,
        message: `IndexNow pinged successfully! Submitted ${KEY_URLS.length} URLs to Bing, Copilot & AI search engines.`,
        urlCount: KEY_URLS.length,
      });
    }

    const errText = await res.text();
    return NextResponse.json(
      { success: false, status: res.status, error: errText },
      { status: res.status }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'IndexNow ping failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    protocol: 'IndexNow',
    engines: ['Bing', 'Microsoft Copilot', 'ChatGPT Search', 'DuckDuckGo', 'Yandex', 'Seznam'],
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
    urlCount: KEY_URLS.length,
  });
}
