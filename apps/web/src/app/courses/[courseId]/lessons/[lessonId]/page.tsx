import { LessonViewer } from "@/components/courses/lesson-viewer"

interface LessonPageProps {
  params: {
    courseId: string
    lessonId: string
  }
}

export default function LessonPage({ params }: LessonPageProps) {
  return <LessonViewer courseId={params.courseId} lessonId={params.lessonId} />
}

