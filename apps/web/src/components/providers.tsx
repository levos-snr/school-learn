"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type React from "react";
import ConvexClientProvider from "./convex-client-provider";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<ConvexClientProvider>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster richColors />
				</ThemeProvider>
			</ConvexClientProvider>
		</ClerkProvider>
	);
}
