"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Building2,
  Heart,
  Menu,
  Search,
  User,
  X,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";

function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Listings", href: "/listings" },
    { name: "Rent", href: "/rent" },
    { name: "Buy", href: "/buy" },
    { name: "Sell", href: "/sell" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const visibleNavItems = navItems;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/75 backdrop-blur-xl">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-18">
          <div className="shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <Building2 className="w-5 h-5 text-primary-500" />
              <span className="text-lg sm:text-xl">
                Ma<span className="text-primary-500">kaan</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {visibleNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                  pathname === item.href
                    ? "bg-primary-500 text-white"
                    : "text-slate-600 dark:text-slate-200 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <ThemeSwitcher />
            <Link
              href="/listings"
              className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
            <Link
              href="/likes"
              className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Heart className="w-4 h-4" />
            </Link>
            {isLoaded && isSignedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/listings"
                  className="p-2 rounded-full text-slate-600 dark:text-slate-200 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="My Listings"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Link>
                <UserButton />
              </div>
            ) : (
              <SignInButton mode="redirect" forceRedirectUrl="/">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              </SignInButton>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200/70 dark:border-slate-700/60">
            <div className="pt-3 flex flex-col gap-2">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl transition-colors ${
                    pathname === item.href
                      ? "bg-primary-500 text-white"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isLoaded && isSignedIn ? (
                <>
                  <Link
                    href="/dashboard/listings"
                    className="px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    My Listings
                  </Link>
                  <div className="mt-2 px-4">
                    <UserButton />
                  </div>
                </>
              ) : null}
              <div className="pt-3 px-1">
                <ThemeSwitcher />
              </div>
              {!isLoaded || !isSignedIn ? (
                <SignInButton mode="redirect" forceRedirectUrl="/">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(false)}
                    className="mt-2 flex w-full items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Sign In</span>
                  </button>
                </SignInButton>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
