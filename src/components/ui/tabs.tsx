import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  setValue: (v: string) => void
}
const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

const tabsVariants = cva(
  "flex flex-col w-full",
  {
    variants: {
      orientation: {
        horizontal: "",
        vertical: "flex-row",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  }
)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tabsVariants> {
  value: string
  onValueChange: (v: string) => void
}
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(({ className, orientation, value, onValueChange, ...props }, ref) => (
  <TabsContext.Provider value={{ value, setValue: onValueChange }}>
    <div ref={ref} className={cn(tabsVariants({ orientation }), className)} {...props} />
  </TabsContext.Provider>
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    role="tablist"
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(({ className, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsTrigger must be used within Tabs")
  const selected = ctx.value === value
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        selected && "bg-background text-foreground shadow-sm",
        className
      )}
      data-state={selected ? "active" : undefined}
      role="tab"
      aria-selected={selected}
      aria-controls={value}
      tabIndex={selected ? 0 : -1}
      type="button"
      onClick={() => ctx.setValue(value)}
      {...props}
    >
      {props.children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(({ className, value, ...props }, ref) => {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error("TabsContent must be used within Tabs")
  if (ctx.value !== value) return null
  return (
    <div
      ref={ref}
      className={cn("mt-2", className)}
      role="tabpanel"
      aria-labelledby={value}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent } 