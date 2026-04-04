import { AppShell } from "@/components/layout/AppShell";

export default function GoalsLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-36 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-xl w-56 mb-6" />
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
