interface StatCardProps {
  label: string;
  value: string;
  note: string;
  tone?: "default" | "danger" | "positive";
}

export function StatCard({ label, value, note, tone = "default" }: StatCardProps) {
  return (
    <div className={`stat stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}
