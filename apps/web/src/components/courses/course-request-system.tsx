"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Plus, Send, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar, BookOpen, AlertCircle } from 'lucide-react'
import { toast } from "sonner"
import { format } from "date-fns"

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  justification: z.string().min(20, "Justification must be at least 20 characters"),
})

type RequestFormData = z.infer<typeof requestSchema>

interface CourseRequestSystemProps {
  userRole: "admin" | "instructor" | "user"
}

export function CourseRequestSystem({ userRole }: CourseRequestSystemProps) {
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [feedback, setFeedback] = useState("")

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      justification: "",
    },
  })

  // Queries
  const allRequests = useQuery(
    userRole === "admin" ? api.courseManagement.getCourseRequests : undefined,
    userRole === "admin" ? {} : "skip"
  )
  
  const myRequests = useQuery(
    userRole !== "admin" ? api.courseManagement.getCourseRequests : undefined,
    userRole !== "admin" ? {} : "skip"
  )

  // Mutations
  const createRequest = useMutation(api.courseManagement.createCourseRequest)
  const approveRequest = useMutation(api.courseManagement.approveCourseRequest)

  const onSubmit = async (data: RequestFormData) => {
    try {
      await createRequest(data)
      toast.success("Course request submitted successfully!")
      form.reset()
      setShowRequestForm(false)
    } catch (error) {
      toast.error("Failed to submit request")
      console.error(error)
    }
  }

  const handleApproveRequest = async (requestId: string, approved: boolean) => {
    try {
      await approveRequest({
        requestId: requestId as any,
        approved,
        feedback: feedback || undefined,
      })
      toast.success(`Request ${approved ? "approved" : "rejected"} successfully`)
      setSelectedRequest(null)
      setFeedback("")
    } catch (error) {
      toast.error("Failed to process request")
    }
  }

  const requests = userRole === "admin" ? allRequests : myRequests
  const pendingRequests = requests?.filter(r => r.status === "pending") || []
  const approvedRequests = requests?.filter(r => r.status === "approved") || []
  const rejectedRequests = requests?.filter(r => r.status === "rejected") || []

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Requests
          </h1>
          <p className="text-muted-foreground mt-2">
            {userRole === "admin" 
              ? "Review and manage course requests from users"
              : "Request new courses to be added to the platform"
            }
          </p>
        </div>
        {userRole !== "admin" && (
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Request a New Course</DialogTitle>
                <DialogDescription>
                  Fill out the form below to request a new course. Our team will review your request.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Advanced React Development"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programming">Programming</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="language">Language</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Course Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this course should cover..."
                    rows={4}
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Why is this course needed? *</Label>
                  <Textarea
                    id="justification"
                    placeholder="Explain why this course would be valuable and who would benefit from it..."
                    rows={4}
                    {...form.register("justification")}
                  />
                  {form.formState.errors.justification && (
                    <p className="text-sm text-red-600">{form.formState.errors.justification.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{requests?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
          <TabsTrigger value="all">All ({requests?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>{request.description}</CardDescription>
                    </div>
                    {userRole === "admin" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Review Course Request</DialogTitle>
                            <DialogDescription>
                              Review the details and provide feedback
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Requester</Label>
                                <p className="font-medium">{request.requesterName}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                                <p className="font-medium capitalize">{request.category}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                              <p className="font-medium">{request.title}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                              <p className="text-sm">{request.description}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Justification</Label>
                              <p className="text-sm">{request.justification}</p>
                            </div>
                            <div>
                              <Label htmlFor="feedback">Feedback (optional)</Label>
                              <Textarea
                                id="feedback"
                                placeholder="Provide feedback for the requester..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={3}
                              />
                            </div>
                            <div className="flex justify-end space-x-3">
                              <Button
                                variant="outline"
                                onClick={() => handleApproveRequest(request._id, false)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleApproveRequest(request._id, true)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{request.requesterName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(request.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {request.category}
                      </Badge>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Justification</Label>
                      <p className="text-sm mt-1">{request.justification}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {pendingRequests.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  All requests have been reviewed
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {approvedRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>{request.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{request.requesterName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(request.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {request.category}
                      </Badge>
                    </div>
                    {request.feedback && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Admin Feedback</Label>
                          <p className="text-sm mt-1">{request.feedback}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {approvedRequests.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No approved requests</h3>
                <p className="text-muted-foreground">
                  Approved requests will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {rejectedRequests.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>{request.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{request.requesterName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(request.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {request.category}
                      </Badge>
                    </div>
                    {request.feedback && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
                          <p className="text-sm mt-1">{request.feedback}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {rejectedRequests.length === 0 && (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No rejected requests</h3>
                <p className="text-muted-foreground">
                  Rejected requests will appear here
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="space-y-4">
            {requests?.map((request) => (
              <Card key={request._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{request.title}</CardTitle>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <CardDescription>{request.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{request.requesterName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(request.createdAt), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {request.category}
                      </Badge>
                    </div>
                    {request.feedback && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">
                            {request.status === "approved" ? "Admin Feedback" : "Rejection Reason"}
                          </Label>
                          <p className="text-sm mt-1">{request.feedback}</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!requests || requests.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No requests yet</h3>
                <p className="text-muted-foreground">
                  {userRole === "admin" 
                    ? "Course requests will appear here when users submit them"
                    : "Start by requesting a course you'd like to see on the platform"
                  }
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
