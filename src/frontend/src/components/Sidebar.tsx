import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenIcon,
  BookmarkIcon,
  GlobeIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  ShieldIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { ALL_CATEGORIES, CATEGORY_CONFIG } from "../utils/categories";

export default function Sidebar() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { t, lang, setLang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(`${path}/`);

  const navLinkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? "bg-sidebar-accent text-white"
        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
            <BookOpenIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg leading-none">
              StudyVault
            </div>
            <div className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-wider">
              Learn · Excel
            </div>
          </div>
        </Link>
      </div>

      <Separator className="bg-sidebar-border mx-4 w-auto" />

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-2">
          Navigation
        </div>

        <Link
          to="/"
          data-ocid="nav.home.link"
          className={navLinkClass("/")}
          onClick={() => setMobileOpen(false)}
        >
          <HomeIcon className="w-4 h-4 flex-shrink-0" />
          {t("home")}
        </Link>

        {identity && (
          <>
            <Link
              to="/bookmarks"
              data-ocid="nav.bookmarks.link"
              className={navLinkClass("/bookmarks")}
              onClick={() => setMobileOpen(false)}
            >
              <BookmarkIcon className="w-4 h-4 flex-shrink-0" />
              {t("bookmarks")}
            </Link>
            <Link
              to="/progress"
              data-ocid="nav.progress.link"
              className={navLinkClass("/progress")}
              onClick={() => setMobileOpen(false)}
            >
              <TrendingUpIcon className="w-4 h-4 flex-shrink-0" />
              {t("progress")}
            </Link>
          </>
        )}

        {isAdmin && (
          <Link
            to="/admin"
            data-ocid="nav.admin.link"
            className={navLinkClass("/admin")}
            onClick={() => setMobileOpen(false)}
          >
            <ShieldIcon className="w-4 h-4 flex-shrink-0" />
            {t("adminPanel")}
          </Link>
        )}

        <div className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-3 pt-4 mb-2">
          {t("categories")}
        </div>

        {ALL_CATEGORIES.map((cat) => {
          const cfg = CATEGORY_CONFIG[cat];
          return (
            <Link
              key={cat}
              to="/category/$category"
              params={{ category: cat }}
              data-ocid={`nav.${cat}.link`}
              className={navLinkClass(`/category/${cat}`)}
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-base leading-none">{cfg.emoji}</span>
              {cfg.label}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border mx-4 w-auto" />

      {/* Language toggle */}
      <div className="px-4 py-3 flex items-center gap-2">
        <GlobeIcon className="w-4 h-4 text-sidebar-foreground/50" />
        <div className="flex bg-sidebar-accent rounded-lg p-0.5">
          <button
            type="button"
            data-ocid="lang.en.toggle"
            onClick={() => setLang("en")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "en"
                ? "bg-white text-foreground shadow-sm"
                : "text-sidebar-foreground/60"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            data-ocid="lang.hi.toggle"
            onClick={() => setLang("hi")}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === "hi"
                ? "bg-white text-foreground shadow-sm"
                : "text-sidebar-foreground/60"
            }`}
          >
            हि
          </button>
        </div>
      </div>

      {/* Login/logout */}
      <div className="px-3 py-4">
        {identity ? (
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-sidebar-accent/60">
              <div className="text-[10px] text-sidebar-foreground/50 mb-0.5">
                Logged in as
              </div>
              <div className="text-xs text-sidebar-foreground font-mono truncate">
                {identity.getPrincipal().toString().slice(0, 12)}...
              </div>
            </div>
            <Button
              data-ocid="auth.logout.button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              onClick={() => {
                clear();
                setMobileOpen(false);
              }}
            >
              <LogOutIcon className="w-4 h-4" />
              {t("logout")}
            </Button>
          </div>
        ) : (
          <Button
            data-ocid="auth.login.button"
            className="w-full gap-2 bg-primary/90 hover:bg-primary text-white"
            onClick={() => {
              login();
              setMobileOpen(false);
            }}
            disabled={isLoggingIn}
          >
            <LogInIcon className="w-4 h-4" />
            {isLoggingIn ? t("loading") : t("login")}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-sidebar h-full flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? (
          <XIcon className="w-5 h-5 text-white" />
        ) : (
          <MenuIcon className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-60 bg-sidebar z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
