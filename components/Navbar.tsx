"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const navLinks = [
  { label: "Tutorials", href: "/" },
  { label: "About", href: "/about" },
  { label: "How it works", href: "/how-it-works" },
];

interface NavbarProps {
  user?: {
    id: string;
    email?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full flex items-center justify-between px-4 md:px-8 py-5 backdrop-blur-lg bg-white/80 border-b border-gray-100/50 shadow-sm">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
          >
            Bouquet
          </motion.div>
        </Link>

        {/* Middle: Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="relative text-gray-700 hover:text-blue-600 transition-colors group font-medium"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition"
              >
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
              >
                Get Started
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            {/* Menu Panel */}
            <motion.div
              key="panel"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-8 pt-12 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Links */}
              <div className="flex flex-col items-center w-full gap-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      href={link.href}
                      className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}

                {user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navLinks.length * 0.08 }}
                    >
                      <Link
                        href="/dashboard"
                        className="text-2xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (navLinks.length + 1) * 0.08 }}
                      className="w-full"
                    >
                      <form action="/auth/signout" method="post" className="w-full">
                        <button
                          type="submit"
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold"
                        >
                          Sign Out
                        </button>
                      </form>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navLinks.length * 0.08 }}
                      className="flex flex-col gap-4 w-full mt-4"
                    >
                      <Link
                        href="/login"
                        className="w-full py-3 text-center border border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/signup"
                        className="w-full py-3 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold"
                        onClick={() => setMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
