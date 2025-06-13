import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { PublicKey } from "@solana/web3.js";
import { cn } from "@/src/lib/utils";

interface UserAvatarProps {
  publicKey: PublicKey;
  username?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function UserAvatar({ publicKey, username, size = "md", className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12",
    xl: "h-16 w-16"
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base", 
    xl: "text-lg"
  };

  const avatarText = username 
    ? username.slice(0, 2).toUpperCase()
    : publicKey.toString().slice(0, 2).toUpperCase();

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className={cn(
        "bg-primary text-primary-foreground font-medium",
        textSizeClasses[size]
      )}>
        {avatarText}
      </AvatarFallback>
    </Avatar>
  );
}