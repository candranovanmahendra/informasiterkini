export const config = {
  api: {
    bodyParser: false, // karena FormData (blob)
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = '7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI';
  const url = `https://api.telegram.org/bot${token}/sendVideo`; // lebih aman pakai sendDocument

  try {
    const tgRes = await fetch(url, {
      method: 'POST',
      headers: {
        ...req.headers,
      },
      body: req, // langsung stream FormData dari frontend
      duplex: 'half', // penting agar tidak error di Node.js 18+
    });

    const result = await tgRes.json();
    res.status(tgRes.status).json(result);
  } catch (err) {
    console.error("❌ Gagal kirim video:", err);
    res.status(500).json({ error: 'Gagal kirim video ke Telegram' });
  }
}
