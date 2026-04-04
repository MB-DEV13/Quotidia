import { AppShell } from "@/components/layout/AppShell";

export default function BudgetLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-32 mb-6" />
        <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-3" />
        ))}
      </div>
    </AppShell>
  );
}
