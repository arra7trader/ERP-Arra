"use client"

import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: LucideIcon
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  format?: "number" | "currency" | "percentage" | "none"
  className?: string
}

const variantStyles = {
  default: "bg-card border",
  primary: "bg-gradient-to-br from-primary to-blue-600 text-white border-0",
  success: "bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0",
  warning: "bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0",
  danger: "bg-gradient-to-br from-red-500 to-rose-600 text-white border-0",
}

const iconContainerStyles = {
  default: "bg-primary/10 text-primary",
  primary: "bg-white/20 text-white",
  success: "bg-white/20 text-white",
  warning: "bg-white/20 text-white",
  danger: "bg-white/20 text-white",
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  variant = "default",
  format = "none",
  className,
}: StatsCardProps) {
  const formattedValue = (() => {
    if (typeof value === "string") return value
    switch (format) {
      case "currency":
        return formatCurrency(value)
      case "number":
        return formatNumber(value)
      case "percentage":
        return `${value}%`
      default:
        return value.toString()
    }
  })()

  const TrendIcon = change ? (change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus) : null
  const isPositive = change && change > 0
  const isNegative = change && change < 0

  return (
    <div
      className={cn(
        "rounded-xl p-6 transition-all duration-200 hover:shadow-lg card-shine",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "default" ? "text-muted-foreground" : "text-white/80"
            )}
          >
            {title}
          </p>
          <p className="text-3xl font-bold tracking-tight">{formattedValue}</p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {TrendIcon && (
                <TrendIcon
                  className={cn(
                    "h-4 w-4",
                    variant === "default"
                      ? isPositive
                        ? "text-emerald-500"
                        : isNegative
                          ? "text-red-500"
                          : "text-muted-foreground"
                      : "text-white/80"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  variant === "default"
                    ? isPositive
                      ? "text-emerald-500"
                      : isNegative
                        ? "text-red-500"
                        : "text-muted-foreground"
                    : "text-white/80"
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              {changeLabel && (
                <span
                  className={cn(
                    "text-sm",
                    variant === "default" ? "text-muted-foreground" : "text-white/60"
                  )}
                >
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconContainerStyles[variant]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  )
}

interface QuickStatsProps {
  stats: {
    label: string
    value: string | number
    color?: string
  }[]
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-card border"
        >
          <span className="text-2xl font-bold" style={{ color: stat.color }}>
            {stat.value}
          </span>
          <span className="text-sm text-muted-foreground">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
