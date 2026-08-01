import "../admin.css";
import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="admin-auth">
      <h1>管理画面ログイン</h1>
      <form action={login}>
        <div className="admin-field">
          <label htmlFor="password">パスワード</label>
          <input id="password" name="password" type="password" required autoFocus />
        </div>
        {error && <p className="admin-error">パスワードが違います</p>}
        <button type="submit">ログイン</button>
      </form>
    </main>
  );
}
