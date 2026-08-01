import { supabase } from "@/lib/supabase";
import { addNotice, updateNotice, deleteNotice } from "../actions";
import { ConfirmSubmitButton, NoticeAddSubmitButton } from "../confirm-submit-button";

export const dynamic = "force-dynamic";

type Notice = {
  id: string;
  message: string;
  is_active: boolean;
};

export default async function AdminNoticesPage() {
  const { data: notices, error } = await supabase
    .from("notices")
    .select("id, message, is_active")
    .order("created_at", { ascending: false });

  if (error) console.error("Failed to fetch notices from Supabase", error);

  return (
    <section className="admin-section">
      <h2>お知らせ（臨時休業など）</h2>

      {error && (
        <p className="admin-error">
          データの取得に失敗しました。時間をおいて再度お試しください。（表示されている一覧が空でも、データが消えたわけではありません）
        </p>
      )}

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
          <label className="admin-checkbox-row admin-checkbox-warn">
            <input type="checkbox" name="broadcast" />
            LINEの友だち全員に今すぐ配信する（取り消せません）
          </label>
          <NoticeAddSubmitButton>お知らせを追加</NoticeAddSubmitButton>
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
            <ConfirmSubmitButton confirmMessage="このお知らせを削除します。よろしいですか？" className="admin-danger">
              削除
            </ConfirmSubmitButton>
          </form>
        </div>
      ))}
    </section>
  );
}
