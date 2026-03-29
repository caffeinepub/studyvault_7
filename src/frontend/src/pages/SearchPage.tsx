import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { toast } from "sonner";
import NoteCard from "../components/NoteCard";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookmark,
  useGetBookmarks,
  useGetProgress,
  useRemoveBookmark,
  useSearchNotes,
} from "../hooks/useQueries";

export default function SearchPage() {
  const { q } = useSearch({ from: "/search" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();

  const { data: notes, isLoading } = useSearchNotes(q);
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

  return (
    <div data-ocid="search.page" className="px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <SearchIcon className="w-6 h-6 text-muted-foreground" />
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Search Results
          </h1>
          {q && (
            <p className="text-sm text-muted-foreground">
              Showing results for:{" "}
              <span className="font-medium text-foreground">
                &ldquo;{q}&rdquo;
              </span>
            </p>
          )}
        </div>
      </div>

      {!q ? (
        <div
          data-ocid="search.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Enter a search term above to find notes</p>
        </div>
      ) : isLoading ? (
        <div
          data-ocid="search.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : !notes?.length ? (
        <div
          data-ocid="search.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t("noNotesFound")}</p>
          <p className="text-sm mt-1">Try different keywords</p>
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
  );
}
