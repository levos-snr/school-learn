"use client"

import { api } from "@school-learn/backend/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import { MessageCircle, Search, UserCheck, UserPlus, Users } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

export function FriendsTab() {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("friends")

  const friends = useQuery(api.friends.list)
  const friendRequests = useQuery(api.friends.getPendingRequests)
  const searchUsers = useQuery(api.friends.searchUsers, { query: searchQuery })
  const sendFriendRequest = useMutation(api.friends.sendRequest)
  const acceptFriendRequest = useMutation(api.friends.acceptRequest)
  const rejectFriendRequest = useMutation(api.friends.rejectRequest)

  const handleSendRequest = async (userId: string, userName: string) => {
    try {
      await sendFriendRequest({ friendId: userId as any })
      toast.success(`Friend request sent to ${userName}!`)
    } catch (error) {
      toast.error("Failed to send friend request")
    }
  }

  const handleAcceptRequest = async (requestId: string, userName: string) => {
    try {
      await acceptFriendRequest({ requestId: requestId as any })
      toast.success(`You are now friends with ${userName}! +25 XP`)
    } catch (error) {
      toast.error("Failed to accept friend request")
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest({ requestId: requestId as any })
      toast.success("Friend request declined")
    } catch (error) {
      toast.error("Failed to reject friend request")
    }
  }

  const totalFriends = friends?.length || 0
  const onlineFriends = friends?.filter((f) => f.isOnline).length || 0
  const pendingRequests = friendRequests?.length || 0

  if (!friends) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StaggerContainer className="grid gap-4 md:grid-cols-3">
        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Friends</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFriends}</div>
              <p className="text-xs text-muted-foreground">{onlineFriends} online now</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Friends</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{onlineFriends}</div>
              <p className="text-xs text-muted-foreground">Available to study</p>
            </CardContent>
          </Card>
        </FadeIn>

        <FadeIn>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Friends Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="friends">My Friends</TabsTrigger>
          <TabsTrigger value="requests">
            Friend Requests
            {pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {friends?.map((friend) => (
              <FadeIn key={friend._id}>
                <Card className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.imageUrl || "/placeholder.svg"} alt={friend.name} />
                          <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{friend.name}</CardTitle>
                        <CardDescription>{friend.isOnline ? "Online" : `Last seen ${friend.lastSeen}`}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Level:</span>
                      <Badge variant="outline">{friend.level}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">XP Points:</span>
                      <span className="font-medium">{friend.xpPoints?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Study Streak:</span>
                      <span className="font-medium">{friend.studyStreak} days</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        Study Together
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </StaggerContainer>

          {friends?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No friends yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start building your study network by adding friends!
                </p>
                <Button onClick={() => setActiveTab("discover")}>Discover Friends</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <StaggerContainer className="space-y-4">
            {friendRequests?.map((request) => (
              <FadeIn key={request._id}>
                <Card>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={request.senderImageUrl || "/placeholder.svg"} alt={request.senderName} />
                        <AvatarFallback>{request.senderName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{request.senderName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Sent {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(request._id, request.senderName)}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request._id)}>
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </StaggerContainer>

          {friendRequests?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                <p className="text-muted-foreground text-center">
                  Friend requests will appear here when you receive them.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for students to add as friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <StaggerContainer className="space-y-4">
            {searchUsers?.map((user) => {
              const isFriend = friends?.some((f) => f._id === user._id)
              const hasPendingRequest = friendRequests?.some((r) => r.senderId === user._id)

              return (
                <FadeIn key={user._id}>
                  <Card>
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{user.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Level {user.level} • {user.xpPoints?.toLocaleString()} XP
                          </p>
                          {user.profile?.school && (
                            <p className="text-xs text-muted-foreground">{user.profile.school}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {user.profile?.subjects && (
                          <div className="flex gap-1">
                            {user.profile.subjects.slice(0, 2).map((subject) => (
                              <Badge key={subject} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {isFriend ? (
                          <Badge variant="default">Friends</Badge>
                        ) : hasPendingRequest ? (
                          <Badge variant="secondary">Request Sent</Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleSendRequest(user._id, user.name)}>
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Friend
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )
            })}
          </StaggerContainer>

          {searchQuery && searchUsers?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground text-center">Try searching with different keywords or names.</p>
              </CardContent>
            </Card>
          )}

          {!searchQuery && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Discover new friends</h3>
                <p className="text-muted-foreground text-center">
                  Search for students by name or school to expand your study network.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

