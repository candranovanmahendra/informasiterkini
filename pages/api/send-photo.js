export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const token = "7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI";

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      body: req,
      headers: {
        'content-type': req.headers['content-type'],
      },
    });

    const data = await tgRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal kirim foto' });
  }
}
