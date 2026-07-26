import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json({ error: 'Product description is required' }, { status: 400 });
    }

    // 1. Clean description and draft simulated copy variations
    // In production, this would call GPT-4o or Gemini to generate copy
    /*
    import OpenAI from 'openai';
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert fashion copywriter. Generate a high-converting short social media caption with emojis and hashtags based on the clothing description.' },
        { role: 'user', content: description }
      ]
    });
    const aiCaption = completion.choices[0].message.content;
    */

    const sentences = description.split(/[.!?]/).filter((s: string) => s.trim().length > 0);
    const keyDetail = sentences[0] || 'Check out our latest collection';
    const secondDetail = sentences[1] || 'Elevate your seasonal wardrobe';

    const emojis = ['🍂', '✨', '🔥', '🌟', '👔', '🧥', '👖'];
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const aiCaption = `New Arrival at WF GALAXY! ${selectedEmoji}\n\n` +
      `${keyDetail.trim()}.\n` +
      `${secondDetail.trim()}.\n\n` +
      `📍 Available now at Shiv Chowk, Janakpur.\n` +
      `📞 Hotlines: 9709141876, 9709143347, 9705447139.\n\n` +
      `#WFGALAXY #NewArrivals #BoutiqueFashion #JanakpurShopping`;

    return NextResponse.json({ caption: aiCaption });
  } catch (error: any) {
    console.error('AI Caption API Error:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
