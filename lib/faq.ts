import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./anthropic";
import { supabase } from "./supabase";

const FaqAnswerSchema = z.object({
  answer: z.string().describe("お客様への返信文（LINEでの返信にふさわしい自然な日本語）"),
  escalate: z
    .boolean()
    .describe(
      "予約の変更・キャンセルの相談、または以下のFAQ・お知らせだけでは自信を持って回答できない場合はtrue",
    ),
});

export type FaqAnswer = z.infer<typeof FaqAnswerSchema>;

const FALLBACK_ANSWER: FaqAnswer = {
  answer: "確認のうえ、あらためてご連絡いたします。",
  escalate: true,
};

function buildSystemPrompt(faqList: string, noticeList: string): string {
  return `あなたは美容室の公式LINEアカウントで、お客様からの質問に自動応答するアシスタントです。

## 回答してよい内容
- 営業時間・定休日
- メニュー・料金
- 施術にかかる時間の目安
- 駐車場の有無

これらはすべて、以下の「FAQ一覧」と「現在のお知らせ」の情報のみを根拠に回答してください。情報にない内容を推測で答えてはいけません。

## エスカレーション（escalate: true）が必要なケース
- 予約の変更・キャンセルに関する相談
- 今日・明日の空き状況など、FAQ一覧に含まれないリアルタイムの予約状況
- FAQ一覧・お知らせの情報だけでは自信を持って回答できない質問

escalateがtrueの場合のanswerは、「担当者が確認して折り返しご連絡します」という趣旨の、丁寧で簡潔な一言にしてください。

## FAQ一覧
${faqList || "（登録されているFAQはありません）"}

## 現在のお知らせ（臨時休業など）
${noticeList || "（現在、有効なお知らせはありません）"}`;
}

export async function answerFaq(question: string): Promise<FaqAnswer> {
  const [{ data: faqs }, { data: notices }] = await Promise.all([
    supabase.from("faqs").select("category, question_examples, answer"),
    supabase.from("notices").select("message").eq("is_active", true),
  ]);

  const faqList = (faqs ?? [])
    .map((f) => `- カテゴリ: ${f.category}\n  想定質問: ${f.question_examples}\n  回答: ${f.answer}`)
    .join("\n");
  const noticeList = (notices ?? []).map((n) => `- ${n.message}`).join("\n");

  const message = await anthropic.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: buildSystemPrompt(faqList, noticeList),
    messages: [{ role: "user", content: question }],
    output_config: {
      format: zodOutputFormat(FaqAnswerSchema),
    },
  });

  return message.parsed_output ?? FALLBACK_ANSWER;
}
