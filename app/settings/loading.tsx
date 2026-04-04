import { AppShell } from "@/components/layout/AppShell";

export default function SettingsLoading() {
  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-40 mb-6" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-24" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    </AppShell>
  );
}
