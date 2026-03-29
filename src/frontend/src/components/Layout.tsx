import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import Sidebar from "./Sidebar";

export default function Layout() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        navigate({ to: "/search", search: { q: searchTerm.trim() } });
      }
    },
    [searchTerm, navigate],
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="flex-shrink-0 bg-card border-b border-border px-6 py-3 flex items-center gap-4">
          <div className="lg:hidden w-10" />
          {/* space for mobile menu button */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-ocid="search.search_input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="pl-9 h-9 bg-muted/50 border-border text-sm"
              />
            </div>
          </form>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
