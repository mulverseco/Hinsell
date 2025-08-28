"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { useActiveSection } from "@/hooks/use-active-section";
import { NavLink } from "./nav-link";
import { ItemGroup, StoreGroup } from "@/core/generated/schemas";
import { useItemGroupsList } from "@/core/generated/hooks/itemGroups";
import { useStoreGroupsList } from "@/core/generated/hooks/storeGroups";
import { Badge } from "../ui/badge";


interface HeaderProps {
  initialItemGroups?: ItemGroup[]
  initialStoreGroups?: StoreGroup[]
}

export function Header({ initialItemGroups = [], initialStoreGroups = [] }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = ["Home", "Features", "Pricing", "Testimonials"];
  const { activeHash } = useActiveSection(navItems);

  const { data: itemGroups } = useItemGroupsList(undefined, undefined, {
    initialData: initialItemGroups,
  })

  const { data: storeGroups } = useStoreGroupsList(undefined, undefined, {
    initialData: initialStoreGroups,
  })
  return (
    <>
      <header className="fixed inset-x-0 top-4 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-background/90 border-border/30 relative rounded-full border shadow-lg backdrop-blur-xl">
            <nav
              className="flex h-16 items-center justify-between px-4 sm:px-6"
              aria-label="Main navigation"
            >
              <Link
                href="/"
                className="group flex items-center gap-2.5"
                aria-label="Piper homepage"
              >
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                    <Zap className="text-primary h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="text-lg font-bold tracking-tight">
                    Hinsell
                  </span>
                </div>
              </Link>

              <div className="hidden items-center gap-1 md:flex">
                {itemGroups?.slice(0, 8).map((group: any) => {
                  const item = group.name ?? group.slug ?? group.code ?? "Item";
                  return (
                    <NavLink key={group.id} href={`/category/plp/${group.id}`}>
                      {item}
                    </NavLink>
                  );
                })}
              </div>

              <div className="hidden items-center gap-3 md:flex">
              <Button variant="ghost" size="sm" className="relative gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden lg:inline">$245  </span>
                  <Badge variant={"outline"} className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs">
                    2
                  </Badge>
              </Button>
                <Button variant="ghost" className="font-medium tracking-wide">
                  Sign in
                </Button>
                <ModeToggle />
                {/* <LanguageSwitcher/> */}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="hover:bg-background/80 rounded-full p-2 transition-colors md:hidden"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <Menu
                  className="text-muted-foreground h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-background/80 fixed inset-0 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="bg-background/95 border-border/50 fixed inset-x-0 top-0 border-b p-6">
            <div className="mt-20 flex flex-col gap-2 space-y-1">
                {itemGroups?.slice(0, 8).map((group: any) => {
                  const item = group.name ?? group.slug ?? group.code ?? "Item";
                  return (
                    <NavLink key={group.id} href={`/category/plp/${group.id}`} onClick={() => setIsMenuOpen(false)}>
                      {item}
                    </NavLink>
                  );
                })}
              <div className="border-border/50 mt-6 grid grid-cols-2 gap-3 border-t pt-6">
                <Button
                  variant="outline"
                  className="w-full font-medium tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign in
                </Button>
              </div>
              <div className="flex items-center justify-end pt-6">
                <ModeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
