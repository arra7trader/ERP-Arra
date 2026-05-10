"use client"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent, Badge, Avatar } from "@/components/ui"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ArrowUpRight, MoreHorizontal } from "lucide-react"

interface Activity {
  id: string
  type: "sale" | "purchase" | "payment" | "lead" | "task"
  title: string
  description: string
  amount?: number
  user?: {
    name: string
    avatar?: string
  }
  createdAt: string
}

interface RecentActivityProps {
  activities: Activity[]
  className?: string
}

const activityColors = {
  sale: "bg-emerald-500",
  purchase: "bg-blue-500",
  payment: "bg-purple-500",
  lead: "bg-amber-500",
  task: "bg-pink-500",
}

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div
              className={cn(
                "mt-1 h-2 w-2 rounded-full shrink-0",
                activityColors[activity.type]
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {activity.title}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(activity.createdAt, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            {activity.amount && (
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(activity.amount)}
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface TopItem {
  id: string
  name: string
  subtitle?: string
  value: number
  change?: number
  image?: string
}

interface TopItemsListProps {
  title: string
  items: TopItem[]
  valueLabel?: string
  valueFormat?: "currency" | "number"
  className?: string
}

export function TopItemsList({
  title,
  items,
  valueLabel = "Sales",
  valueFormat = "currency",
  className,
}: TopItemsListProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <button className="p-1 rounded-lg hover:bg-muted">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground w-4">
                {index + 1}
              </span>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <Avatar alt={item.name} size="md" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {item.name}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground truncate">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {valueFormat === "currency"
                    ? formatCurrency(item.value)
                    : item.value}
                </p>
                {item.change !== undefined && (
                  <p
                    className={cn(
                      "text-xs",
                      item.change >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.change}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface Task {
  id: string
  title: string
  dueDate?: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  assignee?: {
    name: string
    avatar?: string
  }
}

interface TaskListProps {
  tasks: Task[]
  className?: string
}

const priorityColors = {
  low: "success",
  medium: "warning",
  high: "destructive",
} as const

const statusColors = {
  pending: "secondary",
  "in-progress": "info",
  completed: "success",
} as const

export function TaskList({ tasks, className }: TaskListProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="h-3 w-3" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <input
                type="checkbox"
                checked={task.status === "completed"}
                className="h-4 w-4 rounded border-input"
                readOnly
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    task.status === "completed" &&
                      "line-through text-muted-foreground"
                  )}
                >
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    Due: {formatDate(task.dueDate, { day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
              <Badge variant={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              {task.assignee && (
                <Avatar
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                  size="sm"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
