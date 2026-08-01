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

  await Promise.all(events.map(handleEvent));

  return new Response("OK", { status: 200 });
}

async function handleEvent(event: webhook.Event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return;
  }
  if (!event.replyToken) {
    return;
  }

  const { answer, escalate } = await answerFaq(event.message.text);

  await lineClient.replyMessage({
    replyToken: event.replyToken,
    messages: [{ type: "text", text: answer }],
  });

  if (escalate) {
    const userId = event.source?.type === "user" ? event.source.userId : undefined;
    await lineClient.pushMessage({
      to: process.env.LINE_OWNER_USER_ID!,
      messages: [
        {
          type: "text",
          text: `【要確認】botが回答できなかった質問です。\n\nお客様（${userId ?? "不明"}）:\n${event.message.text}`,
        },
      ],
    });
  }
}
