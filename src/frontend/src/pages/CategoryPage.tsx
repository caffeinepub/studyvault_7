import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { BookOpenIcon } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import type { Category } from "../backend";
import NoteCard from "../components/NoteCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookmark,
  useFilterNotesByCategory,
  useGetBookmarks,
  useGetProgress,
  useRemoveBookmark,
} from "../hooks/useQueries";
import { CATEGORY_CONFIG } from "../utils/categories";

export default function CategoryPage() {
  const { category } = useParams({ from: "/category/$category" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();
  const cat = category as Category;
  const config = CATEGORY_CONFIG[cat];

  const { data: notes, isLoading } = useFilterNotesByCategory(cat);
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

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Invalid category
      </div>
    );
  }

  return (
    <div data-ocid="category.page">
      {/* Category header */}
      <div className={`bg-gradient-to-r ${config.gradientClass} px-8 py-10`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4">
            <span className="text-5xl">{config.emoji}</span>
            <div>
              <h1 className="font-display font-bold text-3xl text-white">
                {config.label}
              </h1>
              <p className="text-white/80 mt-1">{config.description}</p>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5">
            <span className="text-white text-sm font-medium">
              {isLoading ? "..." : `${notes?.length ?? 0} notes`}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="px-8 py-8">
        {isLoading ? (
          <div
            data-ocid="category.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
              <Skeleton key={k} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : !notes?.length ? (
          <div
            data-ocid="category.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">{config.emoji}</div>
            <p className="font-medium text-lg">{t("noNotesFound")}</p>
            <p className="text-sm mt-2">
              Check back later for new study material
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note, i) => (
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
      </div>
    </div>
  );
}
