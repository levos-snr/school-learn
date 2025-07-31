"use client";

import { GraduationCap } from "lucide-react";

import Link from "next/link";
import type React from "react";

interface FooterLinkProps {
	href: string;
	children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
	return (
		<li>
			<Link href={href} className="transition-colors hover:text-kenya-white">
				{children}
			</Link>
		</li>
	);
}

interface FooterSectionProps {
	title: string;
	links: Array<{ href: string; label: string }>;
	delay?: string;
}

function FooterSection({ title, links, delay = "" }: FooterSectionProps) {
	return (
		<div className={delay}>
			<h3 className="mb-4 font-semibold">{title}</h3>
			<ul className="space-y-2 text-gray-400">
				{links.map((link, index) => (
					<FooterLink key={`${title}-${link.label}-${index}`} href={link.href}>
						{link.label}
					</FooterLink>
				))}
			</ul>
		</div>
	);
}

export function Footer() {
	const footerSections = [
		{
			title: "Platform",
			links: [
				{ href: "/onboarding", label: "Courses" },
				{ href: "/onboarding", label: "Practice Tests" },
				{ href: "/onboarding", label: "Past Papers" },
				{ href: "/onboarding", label: "Virtual Labs" },
			],
			delay: "float-block-delay-1",
		},
		{
			title: "Support",
			links: [
				{ href: "/support", label: "Help Center" },
				{ href: "/contact", label: "Contact Us" },
				{ href: "/community", label: "Community" },
				{ href: "/status", label: "Status" },
			],
			delay: "float-block-delay-2",
		},
		{
			title: "Company",
			links: [
				{ href: "/about", label: "About" },
				{ href: "/careers", label: "Careers" },
				{ href: "/privacy", label: "Privacy" },
				{ href: "/terms", label: "Terms" },
			],
			delay: "float-block-delay-3",
		},
	];

	return (
		<footer className="bg-kenya-black py-16 text-kenya-white">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid gap-8 md:grid-cols-4">
					<div className="float-block">
						<div className="mb-4 flex items-center space-x-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-kenya-green">
								<GraduationCap className="h-5 w-5 text-kenya-white" />
							</div>
							<span className="font-bold text-2xl">Masomo</span>
						</div>
						<p className="text-gray-400">
							Empowering Kenyan students with knowledge and skills for academic
							excellence.
						</p>
					</div>
					{footerSections.map((section) => (
						<FooterSection key={section.title} {...section} />
					))}
				</div>
				<div className="float-block mt-12 border-gray-800 border-t pt-8 text-center text-gray-400">
					<p>&copy; 2024 Masomo. All rights reserved. Made with ❤️ in Kenya.</p>
				</div>
			</div>
		</footer>
	);
}
