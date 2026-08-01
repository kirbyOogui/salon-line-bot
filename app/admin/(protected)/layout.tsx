import Link from "next/link";
import "../admin.css";
import { logout } from "./actions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>管理画面</h1>
        <form action={logout}>
          <button type="submit">ログアウト</button>
        </form>
      </header>
      <nav className="admin-nav">
        <Link href="/admin">FAQ</Link>
        <Link href="/admin/notices">お知らせ</Link>
      </nav>
      {children}
    </div>
  );
}
