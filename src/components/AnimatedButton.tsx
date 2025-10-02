import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface AnimatedButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "success" | "warning" | "info" | "gradient";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  href?: string;
  download?: string;
  target?: string;
  disabled?: boolean;
}

const variants = {
  primary: "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-purple-500/30",
  secondary: "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border-slate-600/30", 
  success: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 border-green-500/30",
  warning: "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 border-orange-500/30",
  info: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-blue-500/30",
  gradient: "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 border-purple-500/30"
};

const sizes = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base"
};

export function AnimatedButton({ 
  children, 
  icon: Icon, 
  variant = "secondary", 
  size = "md",
  className,
  onClick,
  href,
  download,
  target,
  disabled = false
}: AnimatedButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center gap-2 rounded-lg font-medium text-white",
    "border backdrop-blur-sm transition-all duration-300 ease-out",
    "hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25",
    "active:scale-95 transform-gpu",
    "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <a 
        href={href}
        download={download}
        target={target}
        className={baseClasses}
      >
        {Icon && <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />}
        <span className="relative">
          {children}
          <span className="absolute inset-0 bg-white/10 rounded opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </span>
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(baseClasses, "group")}
    >
      {Icon && <Icon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />}
      <span className="relative">
        {children}
        <span className="absolute inset-0 bg-white/10 rounded opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </span>
    </button>
  );
}