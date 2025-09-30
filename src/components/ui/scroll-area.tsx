"use client";

import * as React from "react";
import { cn } from "./utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface ScrollBarProps {
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div className="h-full w-full rounded-[inherit] overflow-auto">
        {children}
      </div>
    </div>
  );
}

function ScrollBar({ className, orientation = "vertical", ...props }: ScrollBarProps) {
  return (
    <div
      className={cn(
        "flex touch-none select-none transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 w-full border-t border-t-transparent p-[1px]",
        className
      )}
      {...props}
    >
      <div className="relative flex-1 rounded-full bg-border" />
    </div>
  );
}

export { ScrollArea, ScrollBar };