import { ComprehensiveCourseCreator } from "@/components/instructor/comprehensive-course-creator"

/**
 * Page component that renders the comprehensive course creator within a full-height background container.
 *
 * This component is stateless and accepts no props. It composes the `ComprehensiveCourseCreator` inside a
 * wrapper div that ensures the page occupies the minimum full viewport height and applies the page background.
 *
 * @returns The page's JSX element.
 */
export default function CreateCoursePage() {
  return (
    <div className="min-h-screen bg-background">
      <ComprehensiveCourseCreator />
    </div>
  )
}
