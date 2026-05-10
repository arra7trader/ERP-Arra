"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui"
import { ChevronLeft, Save, X } from "lucide-react"
import Link from "next/link"

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  actions?: React.ReactNode
  children?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  backHref,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions || children}
    </div>
  )
}

interface FormActionsProps {
  onCancel?: () => void
  cancelHref?: string
  cancelLabel?: string
  submitLabel?: string
  isSubmitting?: boolean
  className?: string
}

export function FormActions({
  onCancel,
  cancelHref,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  isSubmitting = false,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 pt-6 border-t border-border",
        className
      )}
    >
      {cancelHref ? (
        <Link href={cancelHref}>
          <Button type="button" variant="outline">
            <X className="h-4 w-4 mr-2" />
            {cancelLabel}
          </Button>
        </Link>
      ) : onCancel ? (
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          {cancelLabel}
        </Button>
      ) : null}
      <Button type="submit" isLoading={isSubmitting}>
        <Save className="h-4 w-4 mr-2" />
        {submitLabel}
      </Button>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && (
        <div className="mb-4 p-4 rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
      {action && (
        <div className="mt-4">
          {action.href ? (
            <Link href={action.href}>
              <Button>{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </div>
      )}
    </div>
  )
}

interface TabsProps {
  tabs: { id: string; label: string; count?: number }[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn("border-b border-border", className)}>
      <nav className="flex gap-4 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "py-3 px-1 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 rounded-full text-xs",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
