"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import type { Id } from "@school-learn/backend/convex/_generated/dataModel"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Clock, FileText, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

interface AssignmentPanelProps {
  courseId: Id<"courses">
  lessonId?: string
}

export function AssignmentPanel({ courseId, lessonId }: AssignmentPanelProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const assignments = useQuery(api.assignments.getCourseAssignments, { courseId })
  const submitAssignment = useMutation(api.assignments.submitAssignment)

  const handleAnswerChange = (questionId: string, answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answer })
  }

  const handleSubmitAssignment = async (assignmentId: Id<"assignments">) => {
    const assignment = assignments?.find((a) => a._id === assignmentId)
    if (!assignment) return

    // Convert answers to the expected format
    const answers = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
      isCorrect: false, // This would be calculated on the backend
      pointsEarned: 0, // This would be calculated on the backend
    }))

    setSubmitting(true)
    try {
      await submitAssignment({
        assignmentId,
        answers,
        timeSpent: 0, // You could track this with a timer
      })
      toast.success("Assignment submitted successfully!")
      setSelectedAnswers({})
    } catch (error) {
      toast.error("Failed to submit assignment")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (assignments === undefined) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const courseAssignments = assignments?.filter((assignment) => !lessonId || assignment.lessonId === lessonId)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">{lessonId ? "Lesson Assignments" : "Course Assignments"}</h3>

      {courseAssignments?.map((assignment) => (
        <Card key={assignment._id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{assignment.title}</span>
                </CardTitle>
                <p className="text-gray-600 mt-1">{assignment.description}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <Badge variant="outline">{assignment.maxPoints} points</Badge>
                {assignment.dueDate && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>Due {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-gray-700">{assignment.instructions}</p>
            </div>

            {/* Check if user has already submitted */}
            {assignment.userSubmission ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Assignment Submitted</span>
                </div>
                <p className="text-green-700">
                  Score: {assignment.userSubmission.score}% ({assignment.userSubmission.totalPoints}/
                  {assignment.maxPoints} points)
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Submitted {formatDistanceToNow(new Date(assignment.userSubmission.submittedAt), { addSuffix: true })}
                </p>
              </div>
            ) : (
              <>
                {/* Questions */}
                {assignment.questions && assignment.questions.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Questions</h4>
                    {assignment.questions.map((question, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <p className="font-medium">
                                {index + 1}. {question.question}
                              </p>
                              <Badge variant="outline">{question.points} pts</Badge>
                            </div>

                            {question.type === "multiple_choice" && question.options && (
                              <RadioGroup
                                value={selectedAnswers[`${assignment._id}-${index}`] || ""}
                                onValueChange={(value) => handleAnswerChange(`${assignment._id}-${index}`, value)}
                              >
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${assignment._id}-${index}-${optionIndex}`} />
                                    <Label htmlFor={`${assignment._id}-${index}-${optionIndex}`}>{option}</Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            )}

                            {question.type === "text" && (
                              <Textarea
                                placeholder="Enter your answer..."
                                value={selectedAnswers[`${assignment._id}-${index}`] || ""}
                                onChange={(e) => handleAnswerChange(`${assignment._id}-${index}`, e.target.value)}
                                rows={3}
                              />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button onClick={() => handleSubmitAssignment(assignment._id)} disabled={submitting} size="lg">
                    {submitting ? "Submitting..." : "Submit Assignment"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      {courseAssignments?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-500">
              {lessonId ? "No assignments for this lesson." : "No assignments for this course."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

