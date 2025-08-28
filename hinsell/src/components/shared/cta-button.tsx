import Link from "next/link";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

/**
 * CTAButton component for consistent call-to-action buttons
 */
export const CTAButton = ({
    children,
    variant = "default",
    href,
    size,
    icon,
    onClick,
  }: {
    children: React.ReactNode;
    variant?: "default" | "outline" | "ghost";
    size?: "lg" | "sm" | "md";
    href?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }) => {
    const buttonClass = cn(
      "h-16 px-8 text-base font-semibold tracking-wide uppercase sm:text-lg",
      variant === "outline" && "hover:bg-background/5 border-2",
    );
  
    const button = (
      <Button size={size} variant={variant as any} className={buttonClass} onClick={onClick}>
        {icon && (
          <span
            className="bg-primary-foreground/10 mr-3 -ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        {children}
      </Button>
    );
  
    if (href) {
      return <Link href={href}>{button}</Link>;
    }
  
    return button;
  };