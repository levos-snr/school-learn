"use client"

import { InstructorDashboard } from "@/components/instructor/instructor-dashboard"

/**
 * Page component that renders the instructor dashboard inside the app container.
 *
 * Renders a centered container with padding and the InstructorDashboard component.
 *
 * @returns The page's JSX element.
 */
export default function InstructorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <InstructorDashboard />
    </div>
  )
}
