// /pages/api/send-photo.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = "7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI";

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
      },
      body: req, // valid untuk streaming ke Telegram
    });

    const data = await telegramRes.json();
    res.status(telegramRes.status).json(data);
  } catch (err) {
    console.error("Gagal kirim:", err);
    res.status(500).json({ error: 'Gagal kirim video' });
  }
}
