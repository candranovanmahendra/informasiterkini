import { IncomingForm } from "formidable";
import fs from "fs";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

function getFirstFile(fileOrArray) {
  if (!fileOrArray) return null;
  if (Array.isArray(fileOrArray)) return fileOrArray[0];
  if (typeof fileOrArray === "object" && "filepath" in fileOrArray) return fileOrArray;
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const token = "7525794586:AAH9YlfXazDX1zzx1ss23q8RuIqyMJcVzZI";
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Gagal parsing form:", err);
      return res.status(500).json({ error: "Gagal parsing form data" });
    }

    const chat_id = fields.chat_id;
    const caption = fields.caption || "";
    const photoFile = getFirstFile(files.photo);

    if (!chat_id || !photoFile) {
      return res.status(400).json({ error: "chat_id atau photo tidak ditemukan" });
    }

    try {
      const formData = new FormData();
      formData.append("chat_id", chat_id);
      formData.append("caption", caption);
      formData.append(
        "photo",
        fs.createReadStream(photoFile.filepath),
        photoFile.originalFilename
      );

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      });

      const data = await tgRes.json();

      if (!data.ok) {
        console.error("Telegram API error:", data);
        return res.status(500).json({ error: "Gagal kirim foto ke Telegram" });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error("Error kirim ke Telegram:", error);
      return res.status(500).json({ error: "Gagal kirim foto ke Telegram" });
    }
  });
}
