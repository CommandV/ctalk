import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// AES-256-CBC encryption using Web Crypto API
async function generateKey(secret) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret.padEnd(32, "0").slice(0, 32)),
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );
  return keyMaterial;
}

async function encryptText(text, secret) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await generateKey(secret);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    enc.encode(text)
  );
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googlesheets");

    // Fetch all posts
    const posts = await base44.asServiceRole.entities.Post.list("-created_date", 1000);
    const profiles = await base44.asServiceRole.entities.UserProfile.list("-created_date", 500);
    const subjects = await base44.asServiceRole.entities.Subject.list("-created_date", 100);

    // Build lookup maps
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.username] = p; });

    const subjectMap = {};
    subjects.forEach(s => { subjectMap[s.id] = s.title; });

    // Encryption secret — random per export session
    const encSecret = `thoughts-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Group posts by username
    const byUser = {};
    for (const post of posts) {
      if (!byUser[post.username]) byUser[post.username] = [];
      byUser[post.username].push(post);
    }

    // Build rows: each row = one user's post, encrypted content
    const rows = [["USERNAME (enc)", "POST CONTENT (enc)", "SUBJECT (enc)", "TIMESTAMP (enc)", "HAS IMAGE"]];
    for (const [username, userPosts] of Object.entries(byUser)) {
      for (const post of userPosts) {
        const encUser = await encryptText(username, encSecret);
        const encContent = await encryptText(post.content || "", encSecret);
        const encSubject = await encryptText(post.subject_title || subjectMap[post.subject_id] || "Unknown", encSecret);
        const encTime = await encryptText(post.created_date || "", encSecret);
        rows.push([encUser, encContent, encSubject, encTime, post.image_url ? "YES" : "NO"]);
      }
    }

    // Create a new spreadsheet
    const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        properties: { title: `Thoughts Export - ${new Date().toISOString().slice(0, 10)}` },
        sheets: [{ properties: { title: "Messages" } }]
      })
    });

    const spreadsheet = await createRes.json();
    const spreadsheetId = spreadsheet.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    // Write data
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Messages!A1:E${rows.length}?valueInputOption=RAW`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: rows })
    });

    // Add a second sheet with the decryption key
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [{
          addSheet: { properties: { title: "DECRYPTION KEY (KEEP PRIVATE)" } }
        }]
      })
    });

    // Write key to second sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/DECRYPTION KEY (KEEP PRIVATE)!A1:B4?valueInputOption=RAW`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        values: [
          ["ENCRYPTION INFO", ""],
          ["Algorithm", "AES-256-CBC"],
          ["Decryption Key", encSecret],
          ["Format", "Base64(IV[16 bytes] + CipherText)"]
        ]
      })
    });

    return Response.json({
      success: true,
      spreadsheetUrl,
      totalPosts: posts.length,
      totalUsers: Object.keys(byUser).length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});