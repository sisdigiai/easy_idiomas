import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg border border-outline-variant bg-white px-4 py-3 text-sm focus:outline-none focus:border-on-secondary-fixed-variant focus:ring-2 focus:ring-on-secondary-fixed-variant/20 disabled:cursor-not-allowed disabled:opacity-50 font-body-md text-on-surface",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
