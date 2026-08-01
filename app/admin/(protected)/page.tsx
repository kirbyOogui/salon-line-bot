import { supabase } from "@/lib/supabase";
import { addFaq, updateFaq, deleteFaq, addNotice, updateNotice, deleteNotice } from "./actions";

export const dynamic = "force-dynamic";

type Faq = {
  id: string;
  category: string;
  question_examples: string;
  answer: string;
};

type Notice = {
  id: string;
  message: string;
  is_active: boolean;
};

export default async function AdminPage() {
  const [faqsResult, noticesResult] = await Promise.all([
    supabase.from("faqs").select("id, category, question_examples, answer").order("category"),
    supabase.from("notices").select("id, message, is_active").order("created_at", { ascending: false }),
  ]);

  if (faqsResult.error) console.error("Failed to fetch faqs from Supabase", faqsResult.error);
  if (noticesResult.error) console.error("Failed to fetch notices from Supabase", noticesResult.error);

  const faqs = faqsResult.data;
  const notices = noticesResult.data;

  return (
    <>
      {(faqsResult.error || noticesResult.error) && (
        <p className="admin-error">
          データの取得に失敗しました。時間をおいて再度お試しください。（表示されている一覧が空でも、データが消えたわけではありません）
        </p>
      )}

      <section className="admin-section">
        <h2>FAQ</h2>

        <div className="admin-card">
          <form action={addFaq}>
            <div className="admin-field">
              <label htmlFor="new-category">カテゴリ</label>
              <input id="new-category" type="text" name="category" placeholder="例: 営業時間" required />
            </div>
            <div className="admin-field">
              <label htmlFor="new-question_examples">想定される質問の言い回し</label>
              <textarea
                id="new-question_examples"
                name="question_examples"
                placeholder="例: 何時までやってますか？"
                required
              />
            </div>
            <div className="admin-field">
              <label htmlFor="new-answer">回答</label>
              <textarea id="new-answer" name="answer" placeholder="お客様への回答文" required />
            </div>
            <button type="submit">FAQを追加</button>
          </form>
        </div>

        {(faqs as Faq[] | null)?.map((faq) => (
          <div className="admin-card" key={faq.id}>
            <form action={updateFaq}>
              <input type="hidden" name="id" value={faq.id} />
              <div className="admin-field">
                <label>カテゴリ</label>
                <input type="text" name="category" defaultValue={faq.category} required />
              </div>
              <div className="admin-field">
                <label>想定される質問の言い回し</label>
                <textarea name="question_examples" defaultValue={faq.question_examples} required />
              </div>
              <div className="admin-field">
                <label>回答</label>
                <textarea name="answer" defaultValue={faq.answer} required />
              </div>
              <div className="admin-row-actions">
                <button type="submit">更新</button>
              </div>
            </form>
            <form action={deleteFaq}>
              <input type="hidden" name="id" value={faq.id} />
              <button type="submit" className="admin-danger">
                削除
              </button>
            </form>
          </div>
        ))}
      </section>

      <section className="admin-section">
        <h2>お知らせ（臨時休業など）</h2>

        <div className="admin-card">
          <form action={addNotice}>
            <div className="admin-field">
              <label htmlFor="new-message">お知らせ内容</label>
              <textarea id="new-message" name="message" placeholder="例: 8月13日は臨時休業します" required />
            </div>
            <label className="admin-checkbox-row">
              <input type="checkbox" name="is_active" />
              有効にする（botの回答に反映する）
            </label>
            <button type="submit">お知らせを追加</button>
          </form>
        </div>

        {(notices as Notice[] | null)?.map((notice) => (
          <div className="admin-card" key={notice.id}>
            <form action={updateNotice}>
              <input type="hidden" name="id" value={notice.id} />
              <div className="admin-field">
                <label>お知らせ内容</label>
                <textarea name="message" defaultValue={notice.message} required />
              </div>
              <label className="admin-checkbox-row">
                <input type="checkbox" name="is_active" defaultChecked={notice.is_active} />
                有効にする（botの回答に反映する）
              </label>
              <div className="admin-row-actions">
                <button type="submit">更新</button>
              </div>
            </form>
            <form action={deleteNotice}>
              <input type="hidden" name="id" value={notice.id} />
              <button type="submit" className="admin-danger">
                削除
              </button>
            </form>
          </div>
        ))}
      </section>
    </>
  );
}
