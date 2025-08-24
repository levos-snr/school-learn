"use client"

import type React from "react"

import { GraduationCap } from "lucide-react"
import Link from "next/link"
import { FadeIn } from "@/components/motion/fade-in"
import { StaggerContainer } from "@/components/motion/stagger-container"

interface FooterLinkProps {
  href: string
  children: React.ReactNode
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <li>
      <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
        {children}
      </Link>
    </li>
  )
}

interface FooterSectionProps {
  title: string
  links: Array<{ href: string; label: string }>
}

function FooterSection({ title, links }: FooterSectionProps) {
  return (
    <FadeIn>
      <div>
        <h3 className="mb-4 text-sm font-semibold">{title}</h3>
        <ul className="space-y-2">
          {links.map((link) => (
            <FooterLink key={link.label} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
        </ul>
      </div>
    </FadeIn>
  )
}

export function Footer() {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { href: "/courses", label: "Courses" },
        { href: "/practice", label: "Practice Tests" },
        { href: "/past-papers", label: "Past Papers" },
        { href: "/virtual-labs", label: "Virtual Labs" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/help", label: "Help Center" },
        { href: "/contact", label: "Contact Us" },
        { href: "/community", label: "Community" },
        { href: "/status", label: "Status" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About" },
        { href: "/careers", label: "Careers" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
  ]

  return (
    <footer className="border-t bg-background py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <FadeIn>
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Masomo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering Kenyan students with knowledge and skills for academic excellence.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="md:col-span-3 grid gap-8 sm:grid-cols-3">
            {footerSections.map((section) => (
              <FooterSection key={section.title} {...section} />
            ))}
          </StaggerContainer>
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-12 border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2025 Masomo. All rights reserved. Made with ❤️ in Kenya.
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  )
}

