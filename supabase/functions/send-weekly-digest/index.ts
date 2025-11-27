import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SENDER_API_KEY = Deno.env.get("SENDER_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Bookmark {
  story_id: string;
  story_title: string;
  story_url: string | null;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Profile {
  id: string;
  username: string;
  email_digest: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    if (!SENDER_API_KEY) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Digest skipped (no API key)",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get users who have email digest enabled
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, username, email_digest")
      .eq("email_digest", true);

    if (profilesError) {
      throw profilesError;
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No users with digest enabled",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get bookmarks from the last week for each user
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let emailsSent = 0;

    for (const profile of profiles) {
      // Get user's email from auth
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.admin.getUserById(profile.id);

      if (userError || !user?.email) {
        continue;
      }

      // Get recent bookmarks
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("story_id, story_title, story_url, created_at")
        .eq("user_id", profile.id)
        .gte("created_at", oneWeekAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(10);

      if (bookmarksError || !bookmarks || bookmarks.length === 0) {
        continue;
      }

      // Generate email content
      const bookmarksList = bookmarks
        .map(
          (b: Bookmark) => `
          <li style="margin-bottom: 12px;">
            <a href="${b.story_url || `https://meysam81.github.io/hackernew/item/${b.story_id}`}" style="color: #F97316; text-decoration: none;">
              ${b.story_title}
            </a>
          </li>
        `,
        )
        .join("");

      // Send email
      const response = await fetch("https://api.sender.net/v2/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SENDER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: { email: "digest@hackernew.dev", name: "HackerNew" },
          to: [
            {
              email: user.email,
              name: profile.username || user.email.split("@")[0],
            },
          ],
          subject: `Your Weekly HackerNew Digest 📚`,
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
    <p style="color: #71717A; margin: 8px 0 0;">Weekly Digest</p>
  </div>

  <p>Hey ${profile.username || "there"}! 👋</p>

  <p>Here are the stories you bookmarked this week:</p>

  <ul style="padding-left: 20px;">
    ${bookmarksList}
  </ul>

  <p style="margin-top: 32px;">
    <a href="https://meysam81.github.io/hackernew/bookmarks" style="display: inline-block; background-color: #F97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">View all bookmarks</a>
  </p>

  <p style="color: #71717A; font-size: 12px; margin-top: 32px;">
    You're receiving this because you enabled weekly digests.
    <a href="https://meysam81.github.io/hackernew/settings" style="color: #71717A;">Manage preferences</a>
  </p>
</body>
</html>
          `,
        }),
      });

      if (response.ok) {
        emailsSent++;
      }
    }

    return new Response(JSON.stringify({ success: true, emailsSent }), {
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
