"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@school-learn/backend/convex/_generated/api"
import { FadeIn } from "@/components/motion/fade-in"
import { SlideIn } from "@/components/motion/slide-in"
import {
  Users,
  UserPlus,
  MessageCircle,
  Trophy,
  Clock,
  BookOpen,
  Search,
  Mail,
  CheckCircle,
  X,
  Zap,
  Crown,
  Star,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [friendEmail, setFriendEmail] = useState("")

  const friends = useQuery(api.friends.getUserFriends, { status: "accepted" })
  const pendingRequests = useQuery(api.friends.getUserFriends, { status: "pending" })
  const suggestions = useQuery(api.friends.getFriendSuggestions, { limit: 8 })

  const sendFriendRequest = useMutation(api.friends.sendFriendRequest)
  const acceptFriendRequest = useMutation(api.friends.acceptFriendRequest)

  const handleSendRequest = async () => {
    if (!friendEmail.trim()) return

    try {
      await sendFriendRequest({ friendEmail: friendEmail.trim() })
      toast.success("Friend request sent!")
      setFriendEmail("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send request")
    }
  }

  const handleAcceptRequest = async (friendshipId: string) => {
    try {
      await acceptFriendRequest({ friendshipId })
      toast.success("Friend request accepted!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to accept request")
    }
  }

  const filteredFriends =
    friends?.filter((friendship) => friendship.friend.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  const formatLastSeen = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 5) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-b">
        <div className="container mx-auto px-4 py-12">
          <FadeIn>
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                My Study Network
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Connect with fellow learners, share progress, and learn together
              </p>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          <SlideIn direction="up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <div className="text-2xl font-bold text-pink-600">{friends?.length || 0}</div>
                    <div className="text-sm font-medium">Friends</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {friends?.filter((f) => f.friend.isOnline).length || 0}
                    </div>
                    <div className="text-sm font-medium">Online</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{pendingRequests?.length || 0}</div>
                    <div className="text-sm font-medium">Pending</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <UserPlus className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-purple-600">{suggestions?.length || 0}</div>
                    <div className="text-sm font-medium">Suggestions</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SlideIn>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs defaultValue="friends" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="friends">Friends</TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests{" "}
                    {pendingRequests && pendingRequests.length > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                        {pendingRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search friends..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>

                  {/* Add Friend Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Friend</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Friend's Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            value={friendEmail}
                            onChange={(e) => setFriendEmail(e.target.value)}
                          />
                        </div>
                        <Button onClick={handleSendRequest} className="w-full">
                          Send Friend Request
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Friends Tab */}
              <TabsContent value="friends" className="space-y-4">
                {filteredFriends.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
                      <p className="text-muted-foreground mb-4">Start building your study network by adding friends!</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Your First Friend
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Friend</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="email">Friend's Email</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={friendEmail}
                                onChange={(e) => setFriendEmail(e.target.value)}
                              />
                            </div>
                            <Button onClick={handleSendRequest} className="w-full">
                              Send Friend Request
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredFriends.map((friendship, index) => (
                      <FadeIn key={friendship._id} delay={index * 0.1}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="relative">
                                <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                                  <AvatarImage src={friendship.friend.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white font-bold text-lg">
                                    {friendship.friend.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className={`absolute -bottom-1 -right-1 h-5 w-5 ${getStatusColor(friendship.friend.status)} rounded-full border-3 border-background`}
                                />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-bold text-lg text-foreground">{friendship.friend.name}</h3>
                                  <Badge variant={friendship.friend.isOnline ? "default" : "secondary"}>
                                    {friendship.friend.isOnline ? "Online" : "Offline"}
                                  </Badge>
                                </div>

                                {friendship.friend.currentCourse && (
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Currently studying: {friendship.friend.currentCourse}
                                  </p>
                                )}

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1 bg-orange-100 dark:bg-orange-900/20 rounded">
                                      <Trophy className="h-4 w-4 text-orange-500" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">XP Points</p>
                                      <p className="font-semibold text-sm text-orange-600">
                                        {friendship.friend.stats?.xpPoints || 0}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="p-1 bg-blue-100 dark:bg-blue-900/20 rounded">
                                      <Clock className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Last Seen</p>
                                      <p className="font-semibold text-sm text-blue-600">
                                        {formatLastSeen(friendship.friend.lastSeen)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1">
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message
                                  </Button>
                                  <Button size="sm" variant="outline">
                                    <Zap className="h-4 w-4 mr-2" />
                                    Challenge
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Requests Tab */}
              <TabsContent value="requests" className="space-y-4">
                {!pendingRequests || pendingRequests.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
                      <p className="text-muted-foreground">You don't have any friend requests at the moment.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((friendship, index) => (
                      <FadeIn key={friendship._id} delay={index * 0.1}>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage src={friendship.friend.avatar || "/placeholder.svg"} />
                                  <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-500 text-white font-bold">
                                    {friendship.friend.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-foreground">{friendship.friend.name}</h3>
                                  <p className="text-sm text-muted-foreground">Sent you a friend request</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleAcceptRequest(friendship._id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="outline">
                                  <X className="h-4 w-4 mr-2" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="space-y-4">
                {!suggestions || suggestions.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <UserPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No suggestions available</h3>
                      <p className="text-muted-foreground">
                        We'll suggest friends based on your interests and courses.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestions.map((suggestion, index) => (
                      <FadeIn key={suggestion.user._id} delay={index * 0.1}>
                        <Card className="hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
                                <AvatarImage src={suggestion.user.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-green-500 text-white font-bold text-lg">
                                  {suggestion.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-bold text-lg text-foreground">{suggestion.user.name}</h3>
                                  <Badge variant="outline">
                                    <Star className="h-3 w-3 mr-1" />
                                    Suggested
                                  </Badge>
                                </div>

                                <div className="space-y-2 mb-4">
                                  {suggestion.user.commonSubjects > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <BookOpen className="h-4 w-4 text-blue-500" />
                                      <span className="text-muted-foreground">
                                        {suggestion.user.commonSubjects} common subject
                                        {suggestion.user.commonSubjects !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  )}
                                  {suggestion.user.commonGoals > 0 && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Trophy className="h-4 w-4 text-green-500" />
                                      <span className="text-muted-foreground">
                                        {suggestion.user.commonGoals} common goal
                                        {suggestion.user.commonGoals !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <Button size="sm" className="w-full">
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Send Request
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </FadeIn>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Study Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Study Groups
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Join study groups to collaborate with friends</p>
                  <Button size="sm" className="mt-3">
                    Browse Groups
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Friend activity will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

