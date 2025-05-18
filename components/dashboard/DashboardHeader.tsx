"use client";

export function DashboardHeader({ name, timeOfDay }) {
  return (
    <div className="mb-8 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">
        Good {timeOfDay}, {name}
      </h1>
      <p className="text-muted-foreground mt-1">
        Welcome to your mental health dashboard
      </p>
    </div>
  );
}
