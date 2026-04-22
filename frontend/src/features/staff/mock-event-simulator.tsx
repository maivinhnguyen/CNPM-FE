"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Scan } from "lucide-react";

interface MockEventSimulatorProps {
  onCheckInSwipe: () => void;
  onCheckOutSwipe: () => void;
  disabled?: boolean;
}

export function MockEventSimulator({
  onCheckInSwipe,
  onCheckOutSwipe,
  disabled,
}: MockEventSimulatorProps) {
  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-2xl border-primary/20 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="py-3 px-4 border-b">
        <CardTitle className="text-xs font-mono text-muted-foreground flex items-center gap-2">
          <Scan className="h-3 w-3" />
          Dev Tools: Mock Hardware Events
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCheckInSwipe}
          disabled={disabled}
          className="w-full flex-col h-auto py-2 gap-1 border-emerald-500/30 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-xs">Swipe Input (Enter)</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCheckOutSwipe}
          disabled={disabled}
          className="w-full flex-col h-auto py-2 gap-1 border-blue-500/30 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <CreditCard className="h-4 w-4" />
          <span className="text-xs">Swipe Output (Exit)</span>
        </Button>
      </CardContent>
    </Card>
  );
}
