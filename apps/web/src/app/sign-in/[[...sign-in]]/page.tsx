import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
	return (
		<div
			className="flex min-h-screen flex-col items-center justify-center p-4"
			style={{ backgroundColor: "var(--color-background)" }}
		>
			{/* Header */}
			<div className="mb-8 w-full max-w-md">
				<Link href="/" className="flex items-center justify-center space-x-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kenya-green">
						<GraduationCap className="h-5 w-5 text-kenya-white" />
					</div>
					<span
						className="font-bold text-2xl"
						style={{ color: "var(--color-foreground)" }}
					>
						Masomo
					</span>
				</Link>
			</div>

			{/* Sign In Form */}
			<SignInForm />

			{/* Sign Up Link */}
			<div className="mt-6 text-center">
				<p className="text-muted-foreground text-sm">
					Don't have an account?{" "}
					<Link href="/sign-up">
						<Button variant="link" className="h-auto p-0 text-kenya-green">
							Sign up
						</Button>
					</Link>
				</p>
			</div>
		</div>
	);
}
