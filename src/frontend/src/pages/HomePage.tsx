import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  BookOpenIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Category } from "../backend";
import NoteCard from "../components/NoteCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookmark,
  useGetBookmarks,
  useGetProgress,
  useListNotes,
  useRemoveBookmark,
} from "../hooks/useQueries";
import { ALL_CATEGORIES, CATEGORY_CONFIG } from "../utils/categories";

export default function HomePage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();
  const { data: notes, isLoading } = useListNotes();
  const { data: bookmarkIds } = useGetBookmarks();
  const { data: progressData } = useGetProgress();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const progressMap = new Map(
    (progressData || []).map(([id, pct]) => [id.toString(), Number(pct)]),
  );
  const bookmarkSet = new Set((bookmarkIds || []).map(String));

  const handleBookmarkToggle = async (
    noteId: bigint,
    isBookmarked: boolean,
  ) => {
    if (!identity) {
      toast.error(t("loginToBookmark"));
      return;
    }
    try {
      if (isBookmarked) {
        await removeBookmark.mutateAsync(noteId);
        toast.success(t("removedFromBookmarks"));
      } else {
        await addBookmark.mutateAsync(noteId);
        toast.success(t("addedToBookmarks"));
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const recentNotes = (notes || []).slice(0, 6);

  return (
    <div data-ocid="home.page">
      {/* Hero */}
      <section
        className="relative bg-sidebar text-white overflow-hidden"
        style={{
          backgroundImage:
            "url(/assets/generated/hero-studyvault.dim_1200x400.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-sidebar/80" />
        <div className="relative px-8 py-14">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <BookOpenIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-display font-bold text-4xl text-white tracking-tight">
                StudyVault
              </h1>
            </div>
            <p className="text-white/80 text-lg max-w-xl leading-relaxed mb-6">
              {t("tagline")}
            </p>
            <div className="flex flex-wrap gap-3">
              {[Category.jee, Category.neet, Category.iitjee].map((cat) => {
                const cfg = CATEGORY_CONFIG[cat];
                return (
                  <button
                    type="button"
                    key={cat}
                    data-ocid={`hero.${cat}.button`}
                    onClick={() =>
                      navigate({
                        to: "/category/$category",
                        params: { category: cat },
                      })
                    }
                    className="px-4 py-2 rounded-full bg-white/15 backdrop-blur text-sm font-medium text-white hover:bg-white/25 transition-colors border border-white/20"
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-wrap gap-6"
          >
            {[
              {
                icon: BookOpenIcon,
                label: "Study Notes",
                value: notes?.length ?? "...",
              },
              { icon: UsersIcon, label: "Categories", value: 6 },
              { icon: TrendingUpIcon, label: "Subjects", value: "All Boards" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 bg-white/10 backdrop-blur rounded-xl px-4 py-3"
              >
                <Icon className="w-5 h-5 text-white/70" />
                <div>
                  <div className="font-bold text-white text-lg leading-none">
                    {value}
                  </div>
                  <div className="text-white/60 text-xs mt-0.5">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="px-8 py-8">
        {/* Browse by category */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-foreground">
              {t("browseByCategory")}
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ALL_CATEGORIES.map((cat, i) => {
              const cfg = CATEGORY_CONFIG[cat];
              return (
                <motion.button
                  key={cat}
                  type="button"
                  data-ocid={`category.${cat}.card`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.07 }}
                  onClick={() =>
                    navigate({
                      to: "/category/$category",
                      params: { category: cat },
                    })
                  }
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 ${cfg.lightBgClass} ${cfg.borderClass} hover:shadow-md transition-all duration-200 hover:-translate-y-1 group`}
                >
                  <span className="text-3xl">{cfg.emoji}</span>
                  <span
                    className={`text-xs font-bold ${cfg.textClass} text-center`}
                  >
                    {cfg.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Recent notes */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-xl text-foreground">
              {t("recentNotes")}
            </h2>
            <Button
              data-ocid="home.view_all.button"
              variant="ghost"
              size="sm"
              className="gap-1 text-primary"
              onClick={() =>
                navigate({
                  to: "/category/$category",
                  params: { category: Category.class10 },
                })
              }
            >
              {t("viewAll")} <ArrowRightIcon className="w-3.5 h-3.5" />
            </Button>
          </div>

          {isLoading ? (
            <div
              data-ocid="home.loading_state"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
                <Skeleton key={k} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : recentNotes.length === 0 ? (
            <div
              data-ocid="home.empty_state"
              className="text-center py-16 text-muted-foreground"
            >
              <BookOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t("noNotesFound")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentNotes.map((note, i) => (
                <NoteCard
                  key={note.id.toString()}
                  note={note}
                  index={i}
                  isBookmarked={bookmarkSet.has(note.id.toString())}
                  progress={progressMap.get(note.id.toString())}
                  isLoggedIn={!!identity}
                  onBookmarkToggle={handleBookmarkToggle}
                  onView={(id) =>
                    navigate({ to: "/note/$id", params: { id: id.toString() } })
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-8 px-8 py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}. Built with{" "}
        <span className="text-rose-500">♥</span> using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
