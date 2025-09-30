"use client";

import * as React from "react";
import { cn } from "./utils";
import { buttonVariants } from "./button";

interface AlertDialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface AlertDialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function AlertDialog({ children, open: controlledOpen, onOpenChange }: AlertDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = React.useCallback((newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setInternalOpen(newOpen);
    }
  }, [onOpenChange]);

  return (
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ children, asChild, className, ...props }: AlertDialogTriggerProps) {
  const context = React.useContext(AlertDialogContext);
  
  if (!context) {
    throw new Error('AlertDialogTrigger must be used within an AlertDialog');
  }

  const { setOpen } = context;

  const handleClick = () => {
    setOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
    });
  }

  return (
    <button
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

function AlertDialogPortal({ children }: { children: React.ReactNode }) {
  const context = React.useContext(AlertDialogContext);
  if (!context?.open) return null;
  return <>{children}</>;
}

function AlertDialogOverlay({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AlertDialogContext);
  
  const handleClick = () => {
    // Alert dialogs typically don't close on overlay click
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      onClick={handleClick}
      {...props}
    />
  );
}

function AlertDialogContent({
  className,
  children,
  ...props
}: AlertDialogContentProps & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(AlertDialogContext);
  
  if (!context?.open) return null;

  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:max-w-lg",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function AlertDialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AlertDialogContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  return (
    <button
      className={cn(buttonVariants(), className)}
      onClick={handleClick}
      {...props}
    />
  );
}

function AlertDialogCancel({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(AlertDialogContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    context?.setOpen(false);
  };

  return (
    <button
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onClick={handleClick}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};