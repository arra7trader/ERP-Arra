"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Boxes,
  Warehouse,
  Truck,
  Receipt,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  Handshake,
  Clock,
  Bell,
  Search,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"

interface NavItem {
  title: string
  href?: string
  icon: React.ElementType
  children?: NavItem[]
  badge?: string
}

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "CRM & Sales",
    icon: Handshake,
    children: [
      { title: "Customers", href: "/crm/customers", icon: Users },
      { title: "Leads", href: "/crm/leads", icon: Target },
      { title: "Sales Orders", href: "/crm/sales-orders", icon: ShoppingCart },
    ],
  },
  {
    title: "Inventory",
    icon: Package,
    children: [
      { title: "Products", href: "/inventory/products", icon: Boxes },
      { title: "Warehouses", href: "/inventory/warehouses", icon: Warehouse },
      { title: "Stock Movements", href: "/inventory/stock-movements", icon: Truck },
      { title: "Procurement", href: "/inventory/procurement", icon: ShoppingCart },
    ],
  },
  {
    title: "Finance",
    icon: Wallet,
    children: [
      { title: "Invoices", href: "/finance/invoices", icon: Receipt },
      { title: "Expenses", href: "/finance/expenses", icon: Wallet },
      { title: "Reports", href: "/finance/reports", icon: BarChart3 },
    ],
  },
  {
    title: "HRM",
    icon: UserCog,
    children: [
      { title: "Employees", href: "/hrm/employees", icon: Users },
      { title: "Attendance", href: "/hrm/attendance", icon: Clock },
      { title: "Leave", href: "/hrm/leave", icon: Calendar },
      { title: "Payroll", href: "/hrm/payroll", icon: DollarSign },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarContextType {
  isCollapsed: boolean
  toggleCollapse: () => void
  isMobileOpen: boolean
  toggleMobile: () => void
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const toggleMobile = React.useCallback(() => {
    setIsMobileOpen((prev) => !prev)
  }, [])

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleCollapse, isMobileOpen, toggleMobile }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

function NavItemComponent({ item, level = 0 }: { item: NavItem; level?: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const { isCollapsed } = useSidebar()

  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((child) => pathname === child.href)

  React.useEffect(() => {
    if (item.children?.some((child) => pathname === child.href)) {
      setIsOpen(true)
    }
  }, [pathname, item.children])

  if (item.children && !isCollapsed) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive && "bg-sidebar-accent text-primary"
          )}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          <span className="flex-1 text-left">{item.title}</span>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
          )}
        </button>
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
            {item.children.map((child) => (
              <NavItemComponent key={child.href} item={child} level={level + 1} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-sidebar-foreground",
          isCollapsed && "justify-center px-2"
        )}
        title={isCollapsed ? item.title : undefined}
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!isCollapsed && <span>{item.title}</span>}
        {!isCollapsed && item.badge && (
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {item.badge}
          </span>
        )}
      </Link>
    )
  }

  return null
}

export function Sidebar() {
  const { isCollapsed, isMobileOpen, toggleMobile } = useSidebar()

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col bg-sidebar border-r border-border transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border px-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-lg shadow-lg">
            P
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">PICA</span>
              <span className="text-xs text-muted-foreground">ERP System</span>
            </div>
          )}
          <button
            onClick={toggleMobile}
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => (
            <NavItemComponent key={item.title} item={item} />
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-lg p-2 hover:bg-sidebar-accent transition-colors cursor-pointer",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar src={null} alt="Admin User" size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@pica.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

export function Header() {
  const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar()
  const [isDark, setIsDark] = React.useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-4 transition-all duration-300",
        isCollapsed ? "left-16" : "left-64",
        "left-0 lg:left-64",
        !isCollapsed && "lg:left-64",
        isCollapsed && "lg:left-16"
      )}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden p-2 rounded-lg hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Collapse Button */}
      <button
        onClick={toggleCollapse}
        className="hidden lg:flex p-2 rounded-lg hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <button className="p-2 rounded-lg hover:bg-accent transition-colors text-destructive">
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main
        className={cn(
          "pt-16 transition-all duration-300",
          isCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
