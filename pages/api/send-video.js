// pages/api/send-video.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = '7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI';
  const url = `https://api.telegram.org/bot${token}/sendVideo`;

  try {
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: {
        ...req.headers,
      },
      body: req,
    });

    const result = await tgRes.json();
    res.status(tgRes.status).json(result);
  } catch (err) {
    console.error("❌ Error kirim video:", err);
    res.status(500).json({ error: 'Gagal kirim video' });
  }
}
