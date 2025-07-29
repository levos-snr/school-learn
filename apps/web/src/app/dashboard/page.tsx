"use client";

import { SignInButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { Loader2 } from "lucide-react";
import { UserProfile } from "@/components/auth/user-profile";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
	return (
		<div
			className="min-h-screen p-4"
			style={{ backgroundColor: "var(--color-background)" }}
		>
			<div className="mx-auto max-w-4xl">
				<AuthLoading>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-kenya-green" />
							<p className="text-muted-foreground">Loading your dashboard...</p>
						</div>
					</div>
				</AuthLoading>

				<Unauthenticated>
					<div className="flex min-h-[400px] items-center justify-center">
						<div className="text-center">
							<h1 className="mb-4 font-bold text-2xl">Welcome to Masomo</h1>
							<p className="mb-6 text-muted-foreground">
								Please sign in to access your dashboard
							</p>
							<SignInButton>
								<Button className="cta-button-primary">Sign In</Button>
							</SignInButton>
						</div>
					</div>
				</Unauthenticated>

				<Authenticated>
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
						<div className="lg:col-span-1">
							<UserProfile />
						</div>
						<div className="lg:col-span-2">
							<div className="space-y-6">
								<h1 className="font-bold text-3xl">Dashboard</h1>
								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div className="learning-card p-6">
										<h3 className="mb-2 font-semibold text-lg">
											Continue Learning
										</h3>
										<p className="text-muted-foreground">
											Pick up where you left off
										</p>
									</div>
									<div className="learning-card p-6">
										<h3 className="mb-2 font-semibold text-lg">
											Practice Tests
										</h3>
										<p className="text-muted-foreground">Test your knowledge</p>
									</div>
									<div className="learning-card p-6">
										<h3 className="mb-2 font-semibold text-lg">Past Papers</h3>
										<p className="text-muted-foreground">
											Download exam papers
										</p>
									</div>
									<div className="learning-card p-6">
										<h3 className="mb-2 font-semibold text-lg">Virtual Labs</h3>
										<p className="text-muted-foreground">Conduct experiments</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</Authenticated>
			</div>
		</div>
	);
}
