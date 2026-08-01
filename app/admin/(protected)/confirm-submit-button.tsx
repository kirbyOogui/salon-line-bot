"use client";

export function ConfirmSubmitButton({
  confirmMessage,
  className,
  children,
}: {
  confirmMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}

// Notices can optionally trigger a LINE broadcast, so the confirm message
// depends on the form's own "broadcast" checkbox at click time. That logic
// has to live inside this Client Component: a function prop can't cross the
// Server/Client Component boundary (it isn't serializable).
export function NoticeAddSubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const form = e.currentTarget.form;
        const willBroadcast =
          (form?.elements.namedItem("broadcast") as HTMLInputElement | null)?.checked ?? false;
        const message = willBroadcast
          ? "LINEの友だち全員にすぐに配信されます。取り消せません。よろしいですか？"
          : "このお知らせを追加しますか？";
        if (!confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
