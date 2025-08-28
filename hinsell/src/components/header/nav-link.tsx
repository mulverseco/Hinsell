import { cn } from "@/lib/utils";
import Link from "next/link";

export const NavLink = ({
  href,
  isActive,
  onClick,
  children,
}: {
  href: string;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative rounded-md px-4 py-2 text-sm font-medium tracking-wide transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
};
