"use client";

import { Button } from "@/components/ui/button";

export default function DataStateMessage({
  variant = "empty",
  message,
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-8 text-center min-h-[200px]">
      <p className="text-sm text-muted-foreground">{message}</p>
      {variant === "error" && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
