import { validateSignature, type webhook } from "@line/bot-sdk";
import { lineClient } from "@/lib/line";
import { answerFaq } from "@/lib/faq";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!signature || !validateSignature(body, process.env.LINE_CHANNEL_SECRET!, signature)) {
    return new Response("invalid signature", { status: 401 });
  }

  const { events } = JSON.parse(body) as webhook.CallbackRequest;

  // LINE resends the whole batch on a non-2xx/timeout response, so one event's
  // failure must never fail the others or bubble up into a 500 here.
  await Promise.allSettled(events.map(handleEvent));

  return new Response("OK", { status: 200 });
}

async function handleEvent(event: webhook.Event) {
  try {
    if (event.type !== "message" || event.message.type !== "text") {
      return;
    }
    if (!event.replyToken) {
      return;
    }

    const { answer, escalate } = await answerFaq(event.message.text);

    try {
      await lineClient.replyMessage({
        replyToken: event.replyToken,
        messages: [{ type: "text", text: answer }],
      });
    } catch (error) {
      console.error("Failed to reply to LINE message", error);
    }

    // ポートフォリオ公開用のデモ環境では、エスカレーション通知（開発者個人のLINEへのPush）を
    // 無効化する。お客様への返信（answer）はデモでも通常通り送られる——変わるのは
    // オーナー通知が飛ばない点のみ。
    if (escalate && process.env.DEMO_MODE !== "true") {
      const userId = event.source?.type === "user" ? event.source.userId : undefined;
      try {
        await lineClient.pushMessage({
          to: process.env.LINE_OWNER_USER_ID!,
          messages: [
            {
              type: "text",
              text: `【要確認】botが回答できなかった質問です。\n\nお客様（${userId ?? "不明"}）:\n${event.message.text}`,
            },
          ],
        });
      } catch (error) {
        console.error("Failed to push escalation notification", error);
      }
    }
  } catch (error) {
    console.error("Failed to handle LINE event", error);
  }
}
