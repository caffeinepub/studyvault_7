import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BookmarkIcon, LogInIcon } from "lucide-react";
import { toast } from "sonner";
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

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { t } = useLanguage();

  const { data: bookmarkIds, isLoading: loadingBookmarks } = useGetBookmarks();
  const { data: allNotes, isLoading: loadingNotes } = useListNotes();
  const { data: progressData } = useGetProgress();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();

  const isLoading = loadingBookmarks || loadingNotes;
  const bookmarkSet = new Set((bookmarkIds || []).map(String));
  const bookmarkedNotes = (allNotes || []).filter((n) =>
    bookmarkSet.has(n.id.toString()),
  );
  const progressMap = new Map(
    (progressData || []).map(([id, pct]) => [id.toString(), Number(pct)]),
  );

  const handleBookmarkToggle = async (
    noteId: bigint,
    isBookmarked: boolean,
  ) => {
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
    <div data-ocid="bookmarks.page" className="px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookmarkIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {t("bookmarks")}
          </h1>
          {identity && (
            <p className="text-sm text-muted-foreground">
              {bookmarkedNotes.length} saved notes
            </p>
          )}
        </div>
      </div>

      {!identity ? (
        <div data-ocid="bookmarks.empty_state" className="text-center py-20">
          <BookmarkIcon className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium text-foreground mb-2">
            Login to see your bookmarks
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Save notes to access them anytime
          </p>
          <Button
            data-ocid="bookmarks.login.button"
            onClick={login}
            className="gap-2"
          >
            <LogInIcon className="w-4 h-4" />
            {t("login")}
          </Button>
        </div>
      ) : isLoading ? (
        <div
          data-ocid="bookmarks.loading_state"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <Skeleton key={k} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : bookmarkedNotes.length === 0 ? (
        <div
          data-ocid="bookmarks.empty_state"
          className="text-center py-20 text-muted-foreground"
        >
          <BookmarkIcon className="w-14 h-14 mx-auto mb-4 opacity-20" />
          <p className="font-medium">{t("noBookmarks")}</p>
          <p className="text-sm mt-1">
            Browse notes and bookmark the ones you like
          </p>
          <Button
            data-ocid="bookmarks.browse.button"
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ to: "/" })}
          >
            Browse Notes
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookmarkedNotes.map((note, i) => (
            <NoteCard
              key={note.id.toString()}
              note={note}
              index={i}
              isBookmarked={true}
              progress={progressMap.get(note.id.toString())}
              isLoggedIn={true}
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
