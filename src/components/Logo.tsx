import { Bot } from "lucide-react";
import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
  variant?: 'box' | 'flat';
  iconColor?: string;
  textColor?: string;
}

export const Logo = ({ 
  className, 
  iconSize = 32, 
  textSize = "text-xl", 
  showText = true,
  variant = 'box',
  iconColor,
  textColor
}: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "rounded-xl flex items-center justify-center transition-all",
        variant === 'box' ? "bg-[#1800ad] p-2 shadow-lg shadow-[#1800ad]/20" : "p-0 bg-transparent"
      )}>
        <Bot 
          size={iconSize} 
          className={cn(iconColor ? iconColor : "text-white")} 
        />
      </div>
      {showText && (
        <span className={cn(
          "font-display font-bold tracking-tight",
          textSize
        )}>
          <span className={cn(
            textColor ? textColor : "text-blue-500 dark:text-blue-400"
          )}>
            Jago
          </span>
          <span className={cn(
            textColor ? textColor : "text-[#1800ad] dark:text-indigo-300"
          )}>
            Bot
          </span>
        </span>
      )}
    </div>
  );
};
