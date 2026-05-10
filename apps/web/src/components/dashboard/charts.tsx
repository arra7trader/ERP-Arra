"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

interface ChartContainerProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function ChartContainer({
  title,
  subtitle,
  action,
  children,
  className,
}: ChartContainerProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Simple Bar Chart Component (No external library needed)
interface BarChartProps {
  data: { name: string; value: number; color?: string }[]
  height?: number
}

export function SimpleBarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 100
        return (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <span className="text-xs font-medium text-muted-foreground">
              {item.value}
            </span>
            <div
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
              style={{
                height: `${barHeight}%`,
                backgroundColor: item.color || "hsl(var(--primary))",
                minHeight: 4,
              }}
            />
            <span className="text-xs text-muted-foreground truncate max-w-full">
              {item.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Simple Line Chart Component
interface LineChartProps {
  data: { name: string; value: number }[]
  height?: number
  color?: string
}

export function SimpleLineChart({
  data,
  height = 200,
  color = "hsl(var(--primary))",
}: LineChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value - minValue) / range) * 100
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div style={{ height }} className="relative">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="hsl(var(--border))"
            strokeWidth="0.2"
          />
        ))}
        {/* Area under line */}
        <polygon
          points={`0,100 ${points} 100,100`}
          fill={color}
          fillOpacity="0.1"
        />
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Points */}
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 100
          const y = 100 - ((item.value - minValue) / range) * 100
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1"
              fill={color}
              className="hover:r-[1.5]"
            />
          )
        })}
      </svg>
      {/* Labels */}
      <div className="flex justify-between mt-2">
        {data.map((item, index) => (
          <span key={index} className="text-xs text-muted-foreground">
            {item.name}
          </span>
        ))}
      </div>
    </div>
  )
}

// Donut Chart Component
interface DonutChartProps {
  data: { name: string; value: number; color: string }[]
  size?: number
  thickness?: number
}

export function SimpleDonutChart({
  data,
  size = 200,
  thickness = 30,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let currentOffset = 0

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = item.value / total
          const strokeLength = percentage * circumference
          const offset = currentOffset
          currentOffset += strokeLength

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={thickness}
              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="transition-all duration-500"
            />
          )
        })}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-foreground"
        >
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Progress Bar
interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  color?: string
  size?: "sm" | "md" | "lg"
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  color = "hsl(var(--primary))",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {value} / {max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          heights[size]
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}
