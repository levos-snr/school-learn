"use client";

import { useSignUp } from "@clerk/nextjs";
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuthButtons } from "./social-auth-buttons";

export function SignUpForm() {
	const { isLoaded, signUp, setActive } = useSignUp();
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [pendingVerification, setPendingVerification] = useState(false);
	const [code, setCode] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoaded) return;

		setIsLoading(true);
		setError("");

		try {
			await signUp.create({
				firstName,
				lastName,
				emailAddress: email,
				password,
			});

			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			setPendingVerification(true);
		} catch (err: unknown) {
			const error = err as { errors?: Array<{ message: string }> };
			setError(
				error.errors?.[0]?.message || "An error occurred during sign up",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerification = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!isLoaded) return;

		setIsLoading(true);
		setError("");

		try {
			const completeSignUp = await signUp.attemptEmailAddressVerification({
				code,
			});

			if (completeSignUp.status === "complete") {
				await setActive({ session: completeSignUp.createdSessionId });
			}
		} catch (err: unknown) {
			const error = err as { errors?: Array<{ message: string }> };
			setError(error.errors?.[0]?.message || "Invalid verification code");
		} finally {
			setIsLoading(false);
		}
	};

	if (pendingVerification) {
		return (
			<Card className="learning-card mx-auto w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="font-bold text-2xl text-kenya-green">
						Verify Your Email
					</CardTitle>
					<CardDescription>
						We've sent a verification code to {email}
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleVerification} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="code">Verification Code</Label>
							<Input
								id="code"
								type="text"
								placeholder="Enter verification code"
								value={code}
								onChange={(e) => setCode(e.target.value)}
								required
							/>
						</div>

						{error && (
							<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="cta-button-primary w-full"
							disabled={isLoading}
						>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							Verify Email
						</Button>
					</form>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="learning-card mx-auto w-full max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="font-bold text-2xl text-kenya-green">
					Join Masomo
				</CardTitle>
				<CardDescription>Create your account to start learning</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<SocialAuthButtons mode="signup" />

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-background px-2 text-muted-foreground">
							Or continue with email
						</span>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">First Name</Label>
							<div className="relative">
								<User className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									id="firstName"
									type="text"
									placeholder="First name"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="pl-10"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastName">Last Name</Label>
							<Input
								id="lastName"
								type="text"
								placeholder="Last name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<div className="relative">
							<Mail className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="pl-10"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<div className="relative">
							<Lock className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								placeholder="Create a password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="pr-10 pl-10"
								required
							/>
							<Button
								type="button"
								variant="ghost"
								size="sm"
								className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
								onClick={() => setShowPassword(!showPassword)}
							>
								{showPassword ? (
									<EyeOff className="h-4 w-4" />
								) : (
									<Eye className="h-4 w-4" />
								)}
							</Button>
						</div>
					</div>

					{error && (
						<div className="rounded-md bg-destructive/10 p-3 text-destructive text-sm">
							{error}
						</div>
					)}

					<Button
						type="submit"
						className="cta-button-primary w-full"
						disabled={isLoading}
					>
						{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create Account
					</Button>
				</form>

				<div className="text-center text-muted-foreground text-sm">
					By creating an account, you agree to our{" "}
					<Button variant="link" className="h-auto p-0 text-kenya-green">
						Terms of Service
					</Button>{" "}
					and{" "}
					<Button variant="link" className="h-auto p-0 text-kenya-green">
						Privacy Policy
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
