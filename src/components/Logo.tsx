import { cn } from "../lib/utils";

interface LogoProps {
  className?: string;
  iconSize?: number;
  variant?: 'box' | 'flat';
}

export const Logo = ({ 
  className, 
  iconSize = 32,
  variant = 'box'
}: LogoProps) => {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn(
        "flex items-center justify-center transition-all p-0 bg-transparent"
      )}>
        <img 
          src="/Logo_JagoAI.png" 
          alt="JagoAI Logo"
          style={{ width: iconSize, height: iconSize, minWidth: iconSize, minHeight: iconSize }}
          className="object-contain"
        />
      </div>

    </div>
  );
};
