import { IncomingForm } from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // wajib untuk FormData
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Gagal parsing form:", err);
      return res.status(500).json({ error: 'Gagal parsing form' });
    }

    const token = '7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI'; // fallback
    const telegramUrl = `https://api.telegram.org/bot${token}/sendVideo`;

    try {
      const formData = new FormData();
      formData.append('chat_id', fields.chat_id);
      if (fields.caption) formData.append('caption', fields.caption);

      const videoFile = files.video;
      formData.append('video', fs.createReadStream(videoFile.filepath), videoFile.originalFilename);

      const tgRes = await fetch(telegramUrl, {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      const result = await tgRes.json();
      res.status(tgRes.status).json(result);
    } catch (err) {
      console.error('❌ Gagal kirim video ke Telegram:', err);
      res.status(500).json({ error: 'Gagal kirim video ke Telegram' });
    }
  });
}
