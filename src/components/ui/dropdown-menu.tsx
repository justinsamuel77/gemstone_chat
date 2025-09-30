"use client";

import * as React from "react";
import { cn } from "./utils";
import { Icons } from "./icons";

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
}

const DropdownMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function DropdownMenu({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) {
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
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ children, asChild, className, ...props }: DropdownMenuTriggerProps) {
  const context = React.useContext(DropdownMenuContext);
  
  if (!context) {
    throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
  }

  const { open, setOpen } = context;

  const handleClick = () => {
    setOpen(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...props,
      onClick: handleClick,
      'aria-expanded': open,
      'aria-haspopup': true,
    });
  }

  return (
    <button
      onClick={handleClick}
      aria-expanded={open}
      aria-haspopup={true}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({ 
  children, 
  className, 
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  ...props 
}: DropdownMenuContentProps) {
  const context = React.useContext(DropdownMenuContext);
  const [mounted, setMounted] = React.useState(false);
  
  if (!context) {
    throw new Error('DropdownMenuContent must be used within a DropdownMenu');
  }

  const { open, setOpen } = context;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setOpen(false);
      }
    };

    if (open && mounted) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [open, mounted, setOpen]);

  if (!open) return null;

  const positionClasses = {
    top: 'bottom-full mb-1',
    bottom: 'top-full mt-1',
    left: 'right-full mr-1',
    right: 'left-full ml-1',
  };

  const alignClasses = {
    start: side === 'top' || side === 'bottom' ? 'left-0' : 'top-0',
    center: side === 'top' || side === 'bottom' ? 'left-1/2 -translate-x-1/2' : 'top-1/2 -translate-y-1/2',
    end: side === 'top' || side === 'bottom' ? 'right-0' : 'bottom-0',
  };

  return (
    <div
      data-dropdown
      className={cn(
        "absolute z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        positionClasses[side],
        alignClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({ 
  className, 
  inset, 
  children, 
  onClick,
  ...props 
}: {
  className?: string;
  inset?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    context?.setOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground",
        inset && "pl-8",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onCheckedChange,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DropdownMenuItem
      className={cn("relative flex items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && <Icons.Check className="h-4 w-4" />}
      </span>
      {children}
    </DropdownMenuItem>
  );
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <DropdownMenuItem
      className={cn("relative flex items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <Icons.Circle className="h-2 w-2 fill-current" />
      </span>
      {children}
    </DropdownMenuItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: {
  className?: string;
  inset?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 py-1.5 text-sm font-semibold",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: {
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-muted", className)}
      {...props}
    />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}: {
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
}

// Aliases for common dropdown menu patterns
const DropdownMenuGroup = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => children;
const DropdownMenuSub = DropdownMenu;
const DropdownMenuSubContent = DropdownMenuContent;
const DropdownMenuSubTrigger = DropdownMenuTrigger;
const DropdownMenuRadioGroup = DropdownMenuGroup;

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};