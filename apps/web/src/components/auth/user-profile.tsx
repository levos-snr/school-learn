"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { api } from "@school-learn/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { LogOut, Settings, UserIcon } from "lucide-react";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UserProfile() {
	const { user } = useUser();
	const { signOut } = useClerk();
	const currentUser = useQuery(api.users.current);
	const storeUser = useMutation(api.users.store);

	// Store user in Convex database when they sign in
	useEffect(() => {
		if (user && !currentUser) {
			storeUser();
		}
	}, [user, currentUser, storeUser]);

	if (!user) return null;

	const handleSignOut = () => {
		signOut();
	};

	return (
		<Card className="learning-card w-full max-w-md">
			<CardHeader className="text-center">
				<Avatar className="mx-auto mb-4 h-20 w-20">
					<AvatarImage
						src={user.imageUrl || "/placeholder.svg"}
						alt={user.fullName || "User"}
					/>
					<AvatarFallback className="bg-kenya-green text-kenya-white text-xl">
						{user.firstName?.[0]}
						{user.lastName?.[0]}
					</AvatarFallback>
				</Avatar>
				<CardTitle className="text-xl">{user.fullName}</CardTitle>
				<p className="text-muted-foreground">
					{user.primaryEmailAddress?.emailAddress}
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4 text-center">
					<div className="rounded-lg bg-kenya-green/10 p-4">
						<div className="font-bold text-2xl text-kenya-green">0</div>
						<div className="text-muted-foreground text-sm">Courses</div>
					</div>
					<div className="rounded-lg bg-acacia-gold/10 p-4">
						<div className="font-bold text-2xl text-acacia-gold">0</div>
						<div className="text-muted-foreground text-sm">Certificates</div>
					</div>
				</div>

				<div className="space-y-2">
					<Button
						variant="outline"
						className="w-full justify-start bg-transparent"
					>
						<UserIcon className="mr-2 h-4 w-4" />
						Edit Profile
					</Button>
					<Button
						variant="outline"
						className="w-full justify-start bg-transparent"
					>
						<Settings className="mr-2 h-4 w-4" />
						Settings
					</Button>
					<Button
						variant="outline"
						className="w-full justify-start bg-transparent text-destructive"
						onClick={handleSignOut}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Sign Out
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
