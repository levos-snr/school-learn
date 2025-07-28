"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import type React from "react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

// Create the Convex client with proper error handling
const getConvexUrl = () => {
	const url = process.env.NEXT_PUBLIC_CONVEX_URL;
	if (!url) {
		console.warn(
			"NEXT_PUBLIC_CONVEX_URL is not set. Convex features will not work.",
		);
		return "https://placeholder.convex.cloud"; // Placeholder URL to prevent build errors
	}
	return url;
};

const convex = new ConvexReactClient(getConvexUrl());

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ConvexProvider client={convex}>{children}</ConvexProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
