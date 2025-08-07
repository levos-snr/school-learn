"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, BookOpen, Users, Zap, Target, Plus, X, Upload, Check } from 'lucide-react'
import { toast } from "sonner"

interface CourseCreationWizardProps {
  isOpen: boolean
  onClose: () => void
}

interface CourseData {
  title: string
  description: string
  category: string
  level: "beginner" | "intermediate" | "advanced"
  duration: string
  price: number
  tags: string[]
  requirements: string[]
  whatYouWillLearn: string[]
  thumbnail?: string
}

const courseTemplates = [
  {
    id: "basic",
    name: "Basic Course",
    description: "Simple course structure with video lessons",
    icon: BookOpen,
    features: ["Video lessons", "Basic quizzes", "Certificate"],
  },
  {
    id: "interactive",
    name: "Interactive Course",
    description: "Engaging course with interactive elements",
    icon: Users,
    features: ["Interactive content", "Discussion forums", "Live sessions"],
  },
  {
    id: "project",
    name: "Project-Based",
    description: "Hands-on learning with real projects",
    icon: Zap,
    features: ["Project assignments", "Code reviews", "Portfolio building"],
  },
]

export function CourseCreationWizard({ isOpen, onClose }: CourseCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newLearningOutcome, setNewLearningOutcome] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    category: "",
    level: "beginner",
    duration: "",
    price: 0,
    tags: [],
    requirements: [],
    whatYouWillLearn: [],
  })

  const createCourse = useMutation(api.courses.createCourse)

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: keyof CourseData, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      handleInputChange("tags", [...courseData.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange("tags", courseData.tags.filter(tag => tag !== tagToRemove))
  }

  const addRequirement = () => {
    if (newRequirement.trim() && !courseData.requirements.includes(newRequirement.trim())) {
      handleInputChange("requirements", [...courseData.requirements, newRequirement.trim()])
      setNewRequirement("")
    }
  }

  const removeRequirement = (requirementToRemove: string) => {
    handleInputChange("requirements", courseData.requirements.filter(req => req !== requirementToRemove))
  }

  const addLearningOutcome = () => {
    if (newLearningOutcome.trim() && !courseData.whatYouWillLearn.includes(newLearningOutcome.trim())) {
      handleInputChange("whatYouWillLearn", [...courseData.whatYouWillLearn, newLearningOutcome.trim()])
      setNewLearningOutcome("")
    }
  }

  const removeLearningOutcome = (outcomeToRemove: string) => {
    handleInputChange("whatYouWillLearn", courseData.whatYouWillLearn.filter(outcome => outcome !== outcomeToRemove))
  }

  const handleSubmit = async () => {
    if (!courseData.title || !courseData.description || !courseData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      await createCourse({
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration || "4 weeks",
        price: courseData.price,
        tags: courseData.tags,
        requirements: courseData.requirements,
        whatYouWillLearn: courseData.whatYouWillLearn,
        thumbnail: courseData.thumbnail,
      })
      
      toast.success("Course created successfully!")
      onClose()
      
      // Reset form
      setCourseData({
        title: "",
        description: "",
        category: "",
        level: "beginner",
        duration: "",
        price: 0,
        tags: [],
        requirements: [],
        whatYouWillLearn: [],
      })
      setCurrentStep(1)
      setSelectedTemplate("")
    } catch (error) {
      toast.error("Failed to create course")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedTemplate !== ""
      case 2:
        return courseData.title && courseData.description && courseData.category
      case 3:
        return true // Optional step
      case 4:
        return true // Review step
      default:
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Follow the steps below to create your new course
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Content */}
        <div className="py-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose Course Template</h3>
                <p className="text-gray-600 mb-4">
                  Select a template that best fits your course structure
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {courseTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate === template.id
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="text-center">
                      <template.icon className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {template.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <p className="text-gray-600 mb-4">
                  Provide the essential details about your course
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Course Title *</Label>
                    <Input
                      id="title"
                      value={courseData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter course title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={courseData.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="programming">Programming</SelectItem>
                        <SelectItem value="art">Art</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="level">Difficulty Level</Label>
                    <Select
                      value={courseData.level}
                      onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                        handleInputChange("level", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={courseData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        placeholder="e.g., 4 weeks"
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        value={courseData.price}
                        onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    value={courseData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe what students will learn in this course..."
                    className="h-48"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Course Details</h3>
                <p className="text-gray-600 mb-4">
                  Add tags, requirements, and learning outcomes
                </p>
              </div>

              <div className="space-y-6">
                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {courseData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <Label>Prerequisites/Requirements</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newRequirement}
                      onChange={(e) => setNewRequirement(e.target.value)}
                      placeholder="Add a requirement"
                      onKeyPress={(e) => e.key === "Enter" && addRequirement()}
                    />
                    <Button type="button" onClick={addRequirement} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {courseData.requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <span className="flex-1">{requirement}</span>
                        <X
                          className="h-4 w-4 cursor-pointer text-gray-500"
                          onClick={() => removeRequirement(requirement)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learning Outcomes */}
                <div>
                  <Label>What Students Will Learn</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newLearningOutcome}
                      onChange={(e) => setNewLearningOutcome(e.target.value)}
                      placeholder="Add a learning outcome"
                      onKeyPress={(e) => e.key === "Enter" && addLearningOutcome()}
                    />
                    <Button type="button" onClick={addLearningOutcome} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {courseData.whatYouWillLearn.map((outcome, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <Target className="h-4 w-4 text-green-500" />
                        <span className="flex-1">{outcome}</span>
                        <X
                          className="h-4 w-4 cursor-pointer text-gray-500"
                          onClick={() => removeLearningOutcome(outcome)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review & Create</h3>
                <p className="text-gray-600 mb-4">
                  Review your course details before creating
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>{courseData.title}</CardTitle>
                  <CardDescription>{courseData.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm text-gray-600">Category</Label>
                      <p className="font-medium capitalize">{courseData.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Level</Label>
                      <p className="font-medium capitalize">{courseData.level}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Duration</Label>
                      <p className="font-medium">{courseData.duration || "4 weeks"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Price</Label>
                      <p className="font-medium">${courseData.price}</p>
                    </div>
                  </div>

                  {courseData.tags.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {courseData.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {courseData.requirements.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Requirements</Label>
                      <ul className="list-disc list-inside space-y-1 mt-1">
                        {courseData.requirements.map((req, index) => (
                          <li key={index} className="text-sm">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {courseData.whatYouWillLearn.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600">Learning Outcomes</Label>
                      <ul className="space-y-1 mt-1">
                        {courseData.whatYouWillLearn.map((outcome, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-green-500" />
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
                {isSubmitting ? "Creating..." : "Create Course"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
