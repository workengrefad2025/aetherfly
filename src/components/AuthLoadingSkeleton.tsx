import React from 'react';

export function AuthLoadingSkeleton() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20">
      <div className="space-y-5">
        <div className="h-8 w-48 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-5 w-64 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-72 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}
