import { AppShell } from "@/components/layout/AppShell";

export default function HabitsLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3" />
        ))}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-xl w-40 mt-8 mb-3" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3" />
        ))}
      </div>
    </AppShell>
  );
}
