"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
	return (
		<section
			className="py-20 text-kenya-white"
			style={{
				background:
					"linear-gradient(to right, var(--kenya-red), var(--kenya-green))",
			}}
		>
			<div className="mx-auto max-w-4xl px-6 text-center">
				<h2 className="float-block mb-6 font-bold text-4xl">
					Ready to transform your learning?
				</h2>
				<p className="float-block-delay-1 mb-8 text-xl opacity-90">
					Join thousands of Kenyan students who are already excelling with
					Masomo. Start your journey today.
				</p>
				<div className="flex flex-col justify-center gap-4 sm:flex-row">
					<Link href="/onboarding">
						<Button
							size="lg"
							className="floating-button-block float-block-delay-2"
							style={{
								backgroundColor: "var(--kenya-white)",
								color: "var(--kenya-black)",
							}}
						>
							Start Free Trial
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
					<Button
						size="lg"
						variant="outline"
						className="floating-button-block float-block-delay-3 bg-transparent"
						style={{
							borderColor: "var(--kenya-white)",
							color: "var(--kenya-white)",
						}}
					>
						Contact Sales
					</Button>
				</div>
			</div>
		</section>
	);
}
