// components/ui/Card.tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
}

export function Card({ 
  children, 
  className, 
  padding = "md",
  shadow = "sm" 
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  const shadows = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
        "overflow-hidden",
        shadows[shadow],
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

// Card subcomponents for composition pattern
Card.Header = function CardHeader({ 
  children, 
  className,
  title,
  subtitle,
  action
}: { 
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  if (children) {
    return <div className={cn("px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700", className)}>{children}</div>;
  }
  
  return (
    <div className={cn("px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between", className)}>
      <div>
        {title && <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>}
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({
  children,
  className,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}) {
  const paddings = {
    none: "p-0",
    sm: "px-4 py-4 sm:px-5 sm:py-5",
    md: "px-4 py-5 sm:p-6",
    lg: "px-6 py-6 sm:p-8",
  };

  return (
    <div className={cn(paddings[padding], className)}>{children}</div>
  );
};

Card.Footer = function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-4 py-4 sm:px-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700", className)}>{children}</div>;
};