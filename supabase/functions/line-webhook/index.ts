// Supabase Edge Function: LINE Webhook — Auto-detect Group ID & Welcome Message
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://vvscpbgwgmnawwkymeqg.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const LINE_CHANNEL_ACCESS_TOKEN = Deno.env.get("LINE_CHANNEL_ACCESS_TOKEN") || "J00lAX72A/wSSFMXFDlV1l1royQK7zkGWHPAjos/3HsYgS1wSL0qEa7/f93JGyPgzE/5z6PWVRRMuugSOMt9KVx8PsBQmfJ0TGcmB+bx6t15DpkWv6b9jKAHYI22z16vFCtEIpY3G/3X2wFB85TKTgdB04t89/1O/w1cDnyilFU=";

/**
 * Build Flex Message: Welcome / Bot Ready card
 */
function buildWelcomeFlexMessage() {
  return {
    type: "flex",
    altText: "🎉 Nitan Production Tracker พร้อมทำงานแล้ว!",
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#2563eb",
        paddingAll: "20px",
        contents: [
          {
            type: "text",
            text: "NITAN PRODUCTION TRACKER",
            weight: "bold",
            color: "#FFFFFF",
            size: "xs"
          },
          {
            type: "text",
            text: "🎉 พร้อมทำงานแล้ว!",
            weight: "bold",
            color: "#FFFFFF",
            size: "xl",
            margin: "sm"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        paddingAll: "20px",
        contents: [
          {
            type: "text",
            text: "บอทติดตามงานผลิต Nitan เชื่อมต่อกับกลุ่มนี้เรียบร้อยแล้วครับ!",
            weight: "bold",
            size: "sm",
            wrap: true,
            color: "#1e293b"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "text",
            text: "📢 ระบบจะแจ้งเตือนอัตโนมัติในกรณี:",
            weight: "bold",
            size: "xs",
            color: "#334155",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "sm",
            spacing: "xs",
            contents: [
              {
                type: "text",
                text: "✨ เปิดโครงการผลิตใหม่",
                size: "xs",
                color: "#475569"
              },
              {
                type: "text",
                text: "🔄 อัปเดตสถานะ/ขั้นตอนงาน",
                size: "xs",
                color: "#475569"
              },
              {
                type: "text",
                text: "⏰ เตือนล่วงหน้า 1 วันก่อนกำหนดส่ง",
                size: "xs",
                color: "#475569"
              },
              {
                type: "text",
                text: "⚠️ งานเลยกำหนดส่งมอบ (Overdue)",
                size: "xs",
                color: "#475569"
              }
            ]
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "สถานะบอท",
                size: "xs",
                color: "#64748b",
                flex: 0
              },
              {
                type: "text",
                text: "✅ Online & Ready",
                size: "xs",
                color: "#059669",
                weight: "bold",
                align: "end"
              }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "sm",
            contents: [
              {
                type: "text",
                text: "เชื่อมต่อเมื่อ",
                size: "xs",
                color: "#64748b",
                flex: 0
              },
              {
                type: "text",
                text: new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
                size: "xs",
                color: "#0f172a",
                weight: "bold",
                align: "end"
              }
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#2563eb",
            action: {
              type: "uri",
              label: "เปิดดูในระบบ",
              uri: "https://crm-production-tracker.vercel.app/"
            }
          },
          {
            type: "text",
            text: "🤖 Nitan Production Tracker Bot",
            size: "xxs",
            color: "#94a3b8",
            align: "center",
            margin: "sm"
          }
        ]
      }
    }
  };
}

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

      // Case 1: Bot ถูกเพิ่มเข้ากลุ่ม (join event) — ส่ง Welcome Flex Message ครั้งแรกครั้งเดียว
      if (groupId && event.type === "join") {
        // Save detected Group ID into Supabase app_settings
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from("app_settings")
          .upsert({
            key: "line_group_id",
            value: { groupId: groupId, activated_at: new Date().toISOString() }
          }, { onConflict: "key" });

        // Send Welcome Flex Message via reply
        if (event.replyToken) {
          const welcomeMessage = buildWelcomeFlexMessage();
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [welcomeMessage]
            })
          });
        }
      }

      // Case 2: พิมพ์คีย์เวิร์ด "tracker" ในกลุ่ม — อัปเดต Group ID (ไม่ส่งซ้ำ welcome)
      if (groupId && event.type === "message" && messageText.includes("tracker")) {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        await supabase
          .from("app_settings")
          .upsert({
            key: "line_group_id",
            value: { groupId: groupId, activated_at: new Date().toISOString() }
          }, { onConflict: "key" });
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
