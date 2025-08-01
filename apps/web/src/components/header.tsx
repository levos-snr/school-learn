"use client";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";

interface HeaderProps {
	variant?: "default" | "landing";
}

export default function Header({ variant = "default" }: HeaderProps) {
	if (variant === "landing") {
		return (
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
				<div className="flex items-center space-x-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kenya-green">
						<GraduationCap className="h-5 w-5 text-kenya-white" />
					</div>
					<span
						className="font-bold text-2xl"
						style={{ color: "var(--color-foreground)" }}
					>
						Masomo
					</span>
				</div>
				<div className="hidden items-center space-x-8 md:flex">
					<Link
						href="#features"
						className="transition-opacity hover:opacity-80"
						style={{ color: "var(--color-muted-foreground)" }}
					>
						Features
					</Link>
					<Link
						href="#courses"
						className="transition-opacity hover:opacity-80"
						style={{ color: "var(--color-muted-foreground)" }}
					>
						Courses
					</Link>
					<Link
						href="#about"
						className="transition-opacity hover:opacity-80"
						style={{ color: "var(--color-muted-foreground)" }}
					>
						About
					</Link>
					<Unauthenticated>
						<SignInButton>
							<Button
								variant="outline"
								className="floating-button-block bg-transparent"
							>
								Sign In
							</Button>
						</SignInButton>
						<Link href="/sign-up">
							<Button className="cta-button-primary floating-button-block">
								Get Started
							</Button>
						</Link>
					</Unauthenticated>
					<Authenticated>
						<Link href="/dashboard">
							<Button
								variant="outline"
								className="floating-button-block bg-transparent"
							>
								Dashboard
							</Button>
						</Link>
						<UserButton afterSignOutUrl="/" />
					</Authenticated>
				</div>
			</nav>
		);
	}

	// Default header for other pages
	const links = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/todos", label: "Todos" },
	];

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ to, label }) => {
						return (
							<Link key={to} href={to}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<Authenticated>
						<UserButton afterSignOutUrl="/" />
					</Authenticated>
					<Unauthenticated>
						<Link href="/onboarding">
							<Button variant="outline" size="sm">
								Get Started
							</Button>
						</Link>
					</Unauthenticated>
					<ModeToggle />
				</div>
			</div>
			<hr />
		</div>
	);
}
