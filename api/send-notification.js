const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL:
      "https://bbq-minsoulz-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title, body, senderName } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body required" });
  }

  try {
    const db = admin.database();
    const tokensSnap = await db.ref("fcm_tokens").once("value");
    const tokensData = tokensSnap.val();

    if (!tokensData) {
      return res
        .status(200)
        .json({ success: true, sent: 0, message: "No tokens found" });
    }

    const tokens = Object.values(tokensData)
      .map((t) => t.token)
      .filter(Boolean);

    if (!tokens.length) {
      return res.status(200).json({ success: true, sent: 0 });
    }

    const response = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: "/favicon.png",
          badge: "/favicon.png",
          vibrate: [200, 100, 200],
          tag: "bbq-notif",
        },
      },
    });

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
