interface EmptyStateProps {
  title: string;
  message?: string;
}

export default function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center shadow-soft">
      <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      {message && <p className="mt-3 text-slate-600">{message}</p>}
    </div>
  );
}
