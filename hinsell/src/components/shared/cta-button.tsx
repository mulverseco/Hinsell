"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "../ui/button"
import { Spinner } from "../spinner"
import { cn } from "@/lib/utils"

/**
 * CTAButton component for consistent call-to-action buttons with enhanced flexibility
 */
export const CTAButton = ({
  children,
  variant = "default",
  href,
  size = "lg",
  icon,
  iconPosition = "left",
  onClick,
  className,
  disabled = false,
  loading = false,
  external = false,
  fullWidth = false,
  ...props
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  size?: "sm" | "md" | "lg" | "xl"
  href?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  onClick?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  external?: boolean
  fullWidth?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const buttonClass = cn(
    "font-semibold tracking-wide transition-all duration-200",
    size === "sm" && "h-10 px-4 text-sm",
    size === "md" && "h-12 px-6 text-base",
    size === "lg" && "h-16 px-8 text-base sm:text-lg",
    size === "xl" && "h-20 px-10 text-lg sm:text-xl",
    variant === "outline" && "hover:bg-background/5 border-2",
    fullWidth && "w-full",
    loading && "opacity-70 cursor-not-allowed",
    className,
  )


  const renderIcon = () => {
    if (loading) return <Spinner />
    if (!icon) return null

    return (
      <span
        className={cn(
          "bg-primary-foreground/10 inline-flex items-center justify-center rounded-full",
          size === "sm" && "h-6 w-6",
          size === "md" && "h-7 w-7",
          size === "lg" && "h-8 w-8",
          size === "xl" && "h-10 w-10",
          iconPosition === "left" ? "mr-3 -ml-2" : "ml-3 -mr-2",
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
    )
  }

  const button = (
    <Button
      size={size as any}
      variant={variant as any}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {iconPosition === "left" && renderIcon()}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
      {iconPosition === "right" && renderIcon()}
    </Button>
  )

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
          {button}
        </a>
      )
    }
    return (
      <Link href={href} className="inline-block">
        {button}
      </Link>
    )
  }

  return button
}
