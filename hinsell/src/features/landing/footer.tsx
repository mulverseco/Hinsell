"use client";

// External imports
import Link from "next/link";
import { Zap } from "lucide-react";

// Internal imports
import { XIcon, GitHubIcon, LinkedInIcon } from "@/components/icons";
import { useItemGroupsList } from "@/core/generated/hooks/itemGroups";
import { useStoreGroupsList } from "@/core/generated/hooks/storeGroups";
import { ItemGroup, StoreGroup } from "@/core/generated/schemas";

/**
 * FooterHeading component for consistent section headings
 */
const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-foreground text-sm font-semibold tracking-wide uppercase">
    {children}
  </h3>
);

/**
 * FooterLink component for consistent link styling
 */
const FooterLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
  >
    {children}
  </Link>
);

/**
 * Navigation data for footer links
 */
const navigation = {
  company: [
    { name: "About", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press", href: "#" },
  ],
  support: [
    { name: "Documentation", href: "#" },
    { name: "Guides", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Contact", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
    { name: "Security", href: "#" },
  ],
  social: [
    {
      name: "X",
      href: "https://x.com/mulverseco",
      openInNewTab: true,
      icon: XIcon,
    },
    {
      name: "GitHub",
      href: "https://github.com/mulverseco",
      openInNewTab: true,
      icon: GitHubIcon,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/mulverse-software-813943379",
      openInNewTab: true,
      icon: LinkedInIcon,
    },
  ],
};

interface HeaderProps {
  initialItemGroups?: ItemGroup[]
  initialStoreGroups?: StoreGroup[]
}

export function Footer({ initialItemGroups = [], initialStoreGroups = [] }: HeaderProps) {

    const { data: itemGroups } = useItemGroupsList(undefined, undefined, {
      initialData: initialItemGroups,
    })
  
    const { data: storeGroups } = useStoreGroupsList(undefined, undefined, {
      initialData: initialStoreGroups,
    })
  return (
    <footer
      className="border-border/50 relative border-t"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] opacity-50"
        aria-hidden="true"
      ></div>
      <div
        className="bg-primary/10 absolute top-1/4 right-1/4 -z-10 h-64 w-64 rounded-full blur-3xl"
        aria-hidden="true"
      ></div>
      <div
        className="absolute bottom-1/4 left-1/4 -z-10 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl"
        aria-hidden="true"
      ></div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="xl:grid xl:grid-cols-3 xl:gap-12">
          <div className="space-y-8">
            <div className="flex items-center">
              <div
                className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg"
                aria-hidden="true"
              >
                <Zap className="text-primary h-6 w-6" />
              </div>
              <span className="ml-4 text-xl font-bold tracking-tight">
                Hinsell
              </span>
            </div>
            <p className="text-muted-foreground text-base">
              Making customer relationships smarter, faster, and more human.
            </p>
            <div className="flex space-x-5">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  aria-label={item.name}
                  target={item.openInNewTab ? "_blank" : "_self"}
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <FooterHeading>Product</FooterHeading>
                <ul role="list" className="mt-4 space-y-3">
                  {itemGroups?.slice(0, 8).map((group: any) => {
                    const item = group.name ?? group.slug ?? group.code ?? "Item";
                    return (
                      <li key={item}>
                        <FooterLink href={`/category/plp/${group.id}`}>{item}</FooterLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <FooterHeading>Company</FooterHeading>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <FooterLink href={item.href}>{item.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <FooterHeading>Support</FooterHeading>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.support.map((item) => (
                    <li key={item.name}>
                      <FooterLink href={item.href}>{item.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <FooterHeading>Legal</FooterHeading>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.legal.map((item) => (
                    <li key={item.name}>
                      <FooterLink href={item.href}>{item.name}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="border-border/50 mt-12 border-t pt-8">
          <p className="text-muted-foreground text-center text-sm">
            &copy; {new Date().getFullYear()} Mulverse, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
