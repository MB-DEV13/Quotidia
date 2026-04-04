import { AppShell } from "@/components/layout/AppShell";

export default function ClassementLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-40 mb-6" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3" />
        ))}
      </div>
    </AppShell>
  );
}
