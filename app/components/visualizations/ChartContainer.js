export default function ChartContainer({ children, className = "" }) {
  return (
    <div
      className={`h-fit w-full self-start rounded-xl border bg-card p-4 shadow-sm md:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
