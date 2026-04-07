// components/ui/Table.tsx
import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full divide-y divide-gray-200 dark:divide-gray-700", className)}>
        {children}
      </table>
    </div>
  );
}

Table.Header = function TableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("bg-gray-50 dark:bg-gray-800", className)}>
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={cn("divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900", className)}>
      {children}
    </tbody>
  );
};

Table.Row = function TableRow({ 
  children, 
  className,
  onClick,
  isClickable
}: { 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        isClickable && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
        className
      )}
    >
      {children}
    </tr>
  );
};

Table.Head = function TableHead({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <th
      scope="col"
      onClick={onClick}
      className={cn(
        "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </th>
  );
};

Table.Cell = function TableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100", className)}>
      {children}
    </td>
  );
};

Table.Empty = function TableEmpty({ 
  colSpan, 
  message = "No data available" 
}: { 
  colSpan: number; 
  message?: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
      >
        {message}
      </td>
    </tr>
  );
};