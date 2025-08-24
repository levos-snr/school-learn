"use client";

import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import { GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./mode-toggle";
import { FadeIn } from "@/components/motion/fade-in";
import { SlideIn } from "@/components/motion/slide-in";

interface HeaderProps {
	variant?: "default" | "landing";
}

export default function Header({ variant = "default" }: HeaderProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(prev => !prev);
	}, []);

	const closeMobileMenu = useCallback(() => {
		setIsMobileMenuOpen(false);
	}, []);

	if (variant === "landing") {
		return (
			<FadeIn duration={0.8} className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
				<nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
					{/* Logo */}
					<SlideIn direction="left" duration={0.6}>
						<Link href="/" className="flex items-center space-x-2 group">
							<div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-kenya-green transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
								<GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-kenya-white transition-transform duration-300" />
							</div>
							<span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
								Masomo
							</span>
						</Link>
					</SlideIn>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-6 lg:space-x-8">
						{/* Auth Buttons */}
						<SlideIn direction="right" duration={0.6} delay={0.1}>
							<Unauthenticated>
								<div className="flex items-center space-x-3">
									<SignInButton>
										<Button
											variant="outline"
											size="sm"
											className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-accent/20"
										>
											Sign In
										</Button>
									</SignInButton>
									<Link href="/sign-up">
										<Button 
											size="sm"
											className="cursor-pointer bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
										>
											Get Started
										</Button>
									</Link>
								</div>
							</Unauthenticated>
							<Authenticated>
								<div className="flex items-center space-x-3">
									<Link href="/dashboard">
										<Button
											variant="outline"
											size="sm"
											className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-accent/20"
										>
											Dashboard
										</Button>
									</Link>
									<div className="transition-all duration-300 hover:scale-105">
										<UserButton afterSignOutUrl="/" />
									</div>
								</div>
							</Authenticated>
						</SlideIn>

						{/* Theme Toggle - Far Right */}
						<SlideIn direction="right" duration={0.6} delay={0.2}>
							<ModeToggle  />
						</SlideIn>
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden flex items-center space-x-3 ">
						<ModeToggle  />
						<Button
							variant="ghost"
							size="sm"
							onClick={toggleMobileMenu}
							className="cursor-pointer p-2 transition-all duration-300 hover:bg-accent/20"
							aria-label="Toggle mobile menu"
						>
							{isMobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>

					{/* Mobile Menu Overlay */}
					{isMobileMenuOpen && (
						<div 
							className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden"
							onClick={closeMobileMenu}
						>
							<SlideIn 
								direction="down" 
								duration={0.4}
								className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-md border-b border-border/50 shadow-lg"
							>
								<div className="px-4 py-6 space-y-4">
									<Unauthenticated>
										<div className="space-y-3">
											<SignInButton>
												<Button
													variant="outline"
													className="cursor-pointer w-full justify-center transition-all duration-300 hover:scale-[1.02]"
													onClick={closeMobileMenu}
												>
													Sign In
												</Button>
											</SignInButton>
											<Link href="/sign-up" onClick={closeMobileMenu}>
												<Button className="cursor-pointer w-full justify-center bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02]">
													Get Started
												</Button>
											</Link>
										</div>
									</Unauthenticated>
									<Authenticated>
										<div className="space-y-3">
											<Link href="/dashboard" onClick={closeMobileMenu}>
												<Button
													variant="outline"
													className="cursor-pointer w-full justify-center transition-all duration-300 hover:scale-[1.02]"
												>
													Dashboard
												</Button>
											</Link>
											<div className="flex justify-center py-2">
												<UserButton afterSignOutUrl="/" />
											</div>
										</div>
									</Authenticated>
								</div>
							</SlideIn>
						</div>
					)}
				</nav>
			</FadeIn>
		);
	}

	// Default header for other pages
	const defaultLinks = [
		{ to: "/", label: "Home" },
		{ to: "/dashboard", label: "Dashboard" },
		{ to: "/todos", label: "Todos" },
	];

	return (
		<FadeIn duration={0.6} className="border-b border-border/50">
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-3 gap-4 sm:gap-0">
				{/* Navigation Links */}
				<nav className="flex flex-wrap gap-4 sm:gap-6 text-base sm:text-lg">
					{defaultLinks.map(({ to, label }, index) => (
						<SlideIn 
							key={to} 
							direction="left" 
							duration={0.5} 
							delay={index * 0.1}
						>
							<Link 
								href={to}
								className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-105 relative group"
							>
								{label}
								<span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"></span>
							</Link>
						</SlideIn>
					))}
				</nav>

				{/* Right Side Actions */}
				<SlideIn direction="right" duration={0.6} delay={0.3}>
					<div className="flex items-center gap-3">
						<Authenticated>
							<div className="transition-all duration-300 hover:scale-105">
								<UserButton afterSignOutUrl="/" />
							</div>
						</Authenticated>
						<Unauthenticated>
							<Link href="/onboarding">
								<Button 
									variant="outline" 
									size="sm"
									className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-md hover:bg-accent/20"
								>
									Get Started
								</Button>
							</Link>
						</Unauthenticated>
					
					</div>
				</SlideIn>
			</div>
		</FadeIn>
	);
}
