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
				{links.map((link) => (
					<FooterLink key={link.href} href={link.href}>
						{link.label}
					</FooterLink>
				))}
			</ul>
		</div>
	);
}

export function Footer() {
	const currentYear = new Date().getFullYear();
	const footerSections = [
		{
			title: "Platform",
			links: [
				{ href: "#", label: "Courses" },
				{ href: "#", label: "Practice Tests" },
				{ href: "#", label: "Past Papers" },
				{ href: "#", label: "Virtual Labs" },
			],
			delay: "float-block-delay-1",
		},
		{
			title: "Support",
			links: [
				{ href: "#", label: "Help Center" },
				{ href: "#", label: "Contact Us" },
				{ href: "#", label: "Community" },
				{ href: "#", label: "Status" },
			],
			delay: "float-block-delay-2",
		},
		{
			title: "Company",
			links: [
				{ href: "#", label: "About" },
				{ href: "#", label: "Careers" },
				{ href: "#", label: "Privacy" },
				{ href: "#", label: "Terms" },
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
					<p>
						&copy; {currentYear} Masomo. All rights reserved. Made with ❤️ in
						Kenya.
					</p>
				</div>
			</div>
		</footer>
	);
}
