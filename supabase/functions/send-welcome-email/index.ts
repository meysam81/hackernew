import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const SENDER_API_KEY = Deno.env.get("SENDER_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    if (!SENDER_API_KEY) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email skipped (no API key)",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const response = await fetch("https://api.sender.net/v2/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: "hello@hackernew.dev", name: "HackerNew" },
        to: [{ email, name: name || email.split("@")[0] }],
        subject: "Welcome to HackerNew! 🎉",
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #18181B; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #F97316; margin: 0;">HackerNew</h1>
  </div>

  <p>Hey ${name || "there"}! 👋</p>

  <p>Welcome to HackerNew — a modern reimagining of Hacker News.</p>

  <p>Here's what you can do now:</p>

  <ul>
    <li><strong>Bookmark stories</strong> — Save interesting reads for later</li>
    <li><strong>Track your reading</strong> — See what you've already read</li>
    <li><strong>Sync across devices</strong> — Your data follows you everywhere</li>
    <li><strong>Dark mode</strong> — Easy on the eyes, day or night</li>
  </ul>

  <p>We built this as a love letter to HN — keeping the information-dense, no-nonsense ethos while adding modern touches.</p>

  <p style="margin-top: 32px;">
    <a href="https://meysam81.github.io/hackernew" style="display: inline-block; background-color: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">Start reading</a>
  </p>

  <p style="color: #71717A; font-size: 14px; margin-top: 32px;">
    Happy reading!<br>
    The HackerNew Team
  </p>
</body>
</html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
