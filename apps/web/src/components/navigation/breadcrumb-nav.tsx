"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BreadcrumbNav() {
  const pathname = usePathname()

  // Skip breadcrumbs for root paths
  if (pathname === "/" || pathname === "/dashboard") {
    return null
  }

  const pathSegments = pathname.split("/").filter(Boolean)

  const breadcrumbItems = [{ label: "Home", href: "/dashboard", icon: Home }]

  // Build breadcrumb items based on path
  let currentPath = ""
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    let label = segment
    const href = currentPath

    // Customize labels for known routes
    switch (segment) {
      case "dashboard":
        label = "Dashboard"
        break
      case "instructor":
        label = "Instructor"
        break
      case "admin":
        label = "Admin Panel"
        break
      case "courses":
        label = "Courses"
        break
      case "learn":
        label = "Learning"
        break
      case "create-course":
        label = "Create Course"
        break
      default:
        // For dynamic segments like course IDs, keep as is or fetch from API
        if (segment.length > 10) {
          label = `${segment.substring(0, 8)}...`
        }
    }

    breadcrumbItems.push({ label, href })
  })

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}

          {index === breadcrumbItems.length - 1 ? (
            // Current page - not clickable
            <span className="font-medium text-foreground flex items-center gap-1">
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </span>
          ) : (
            // Previous pages - clickable
            <Link href={item.href}>
              <Button variant="ghost" size="sm" className="h-auto p-1 font-normal">
                {item.icon && <item.icon className="h-4 w-4 mr-1" />}
                {item.label}
              </Button>
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
