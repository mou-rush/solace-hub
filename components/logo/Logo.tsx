import { Heart } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface LogoProps {
  expanded?: boolean;
  className?: string;
}
export const Logo = ({ expanded, className = "" }: LogoProps) => (
  <div className={cn("flex items-center gap-3", className)}>
    <div className="relative">
      <Heart className="w-7 h-7 text-primary" />
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full animate-pulse" />
    </div>
    {expanded && (
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
        SolaceHub
      </span>
    )}
  </div>
);
