const { GoogleAuth } = require("google-auth-library");

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { title, body, senderName } = req.body;
  if (!title || !body) return res.status(400).json({ error: "title and body required" });

  const ADMINS = ["DAVIN", "VINCENT", "VELLICIA"];
  if (!ADMINS.includes((senderName || "").toUpperCase())) {
    return res.status(403).json({ error: "Bukan admin!" });
  }

  try {
    // Ambil semua FCM tokens dari environment
    const tokensRaw = process.env.FCM_TOKENS || "[]";
    // Kita kirim ke topic "bbq" agar simpel
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const projectId = "bbq-minsoulz";
    const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          topic: "bbq-night",
          notification: {
            title,
            body,
          },
          webpush: {
            notification: {
              icon: "https://bbq-minsoulzz.vercel.app/favicon.png",
              badge: "https://bbq-minsoulzz.vercel.app/favicon.png",
              vibrate: [200, 100, 200],
              requireInteraction: true,
            },
            fcm_options: {
              link: "https://bbq-minsoulzz.vercel.app",
            },
          },
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("FCM error:", data);
      return res.status(500).json({ error: "FCM error", detail: data });
    }
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}