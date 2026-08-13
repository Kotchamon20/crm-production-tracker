// Supabase Edge Function: Auto-detect LINE Group ID triggered by keyword "Tracker"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vvscpbgwgmnawwkymeqg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") || "J00lAX72A/wSSFMXFDlV1l1royQK7zkGWHPAjos/3HsYgS1wSL0qEa7/f93JGyPgzE/5z6PWVRRMuugSOMt9KVx8PsBQmfJ0TGcmB+bx6t15DpkWv6b9jKAHYI22z16vFCtEIpY3G/3X2wFB85TKTgdB04t89/1O/w1cDnyilFU=";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      } 
    });
  }

  try {
    const body = await req.json();
    const events = body?.events || [];

    for (const event of events) {
      const groupId = event?.source?.groupId;
      const messageText = (event?.message?.text || "").trim().toLowerCase();

      // Trigger condition: Keyword "Tracker" or bot join event
      if (groupId && (messageText.includes("tracker") || event.type === "join")) {
        // Save detected Group ID into Supabase app_settings
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from("app_settings")
          .upsert({
            key: "line_group_id",
            value: { groupId: groupId, activated_at: new Date().toISOString() }
          }, { onConflict: "key" });

        // Send a confirmation reply message to the group
        if (event.replyToken) {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{
                type: "text",
                text: "🎉 [Nitan Tracker Activated]\nบอทเปิดใช้งานและเชื่อมต่อกับกลุ่มนี้เรียบร้อยแล้วครับ! ต่อจากนี้ระบบจะส่งการแจ้งเตือนงานผลิตเข้ากลุ่มนี้ให้อัตโนมัติทันทีครับ 🚀"
              }]
            })
          });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
});
