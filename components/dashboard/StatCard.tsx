"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly icon: React.ReactNode;
  readonly subtext?: string;
  readonly linkText?: string;
  readonly linkHref?: string;
}

export function StatCard({
  title,
  value,
  icon,
  subtext,
  linkText,
  linkHref,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="rounded-full bg-teal-100 p-2 text-teal-600 dark:bg-teal-900 dark:text-teal-300">
          {icon}
        </span>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>

        {linkText && linkHref && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 p-0 h-auto hover:bg-transparent"
            asChild
          >
            <Link
              href={linkHref}
              className="flex items-center text-teal-600 dark:text-teal-400"
            >
              {linkText} <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
