import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  ExternalLinkIcon,
  Loader2Icon,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookmark,
  useGetBookmarks,
  useGetNote,
  useGetProgress,
  useRemoveBookmark,
  useUpdateProgress,
} from "../hooks/useQueries";
import { CATEGORY_CONFIG } from "../utils/categories";

export default function NoteViewerPage() {
  const { id } = useParams({ from: "/note/$id" });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { t } = useLanguage();

  const noteId = BigInt(id);
  const { data: note, isLoading } = useGetNote(noteId);
  const { data: bookmarkIds } = useGetBookmarks();
  const { data: progressData } = useGetProgress();
  const addBookmark = useAddBookmark();
  const removeBookmark = useRemoveBookmark();
  const updateProgress = useUpdateProgress();

  const isBookmarked = (bookmarkIds || []).some((bid) => bid.toString() === id);
  const currentProgress = (progressData || []).find(
    ([pid]) => pid.toString() === id,
  )?.[1];
  const [localProgress, setLocalProgress] = useState<number>(
    Number(currentProgress ?? 0),
  );

  useEffect(() => {
    if (currentProgress !== undefined) {
      setLocalProgress(Number(currentProgress));
    }
  }, [currentProgress]);

  const handleBookmarkToggle = async () => {
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

  const handleProgressChange = (value: number[]) => {
    setLocalProgress(value[0]);
  };

  const handleProgressCommit = async (value: number[]) => {
    if (!identity) {
      toast.error(t("loginToTrack"));
      return;
    }
    try {
      await updateProgress.mutateAsync({ noteId, percentage: value[0] });
      toast.success(t("progressUpdated"));
    } catch {
      toast.error("Failed to update progress");
    }
  };

  const config = note ? CATEGORY_CONFIG[note.category] : null;

  return (
    <div data-ocid="note.page" className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 bg-card border-b border-border">
        <Button
          data-ocid="note.back.button"
          variant="ghost"
          size="sm"
          className="gap-2 mb-3"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </Button>

        {isLoading ? (
          <div data-ocid="note.loading_state" className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : note && config ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{config.emoji}</span>
                <Badge
                  variant="outline"
                  className={`${config.textClass} ${config.lightBgClass} ${config.borderClass}`}
                >
                  {config.label}
                </Badge>
              </div>
              <h1 className="font-display font-bold text-2xl text-foreground">
                {note.title}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {note.subject}
              </p>
              {note.description && (
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
                  {note.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {identity && (
                <Button
                  data-ocid="note.bookmark.button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleBookmarkToggle}
                  disabled={addBookmark.isPending || removeBookmark.isPending}
                >
                  <BookmarkIcon
                    className={`w-4 h-4 ${isBookmarked ? "fill-primary text-primary" : ""}`}
                  />
                  {t("bookmark")}
                </Button>
              )}
              <Button
                data-ocid="note.open_external.button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() =>
                  note && window.open(note.blob.getDirectURL(), "_blank")
                }
              >
                <ExternalLinkIcon className="w-4 h-4" />
                Open
              </Button>
            </div>
          </motion.div>
        ) : null}

        {/* Progress controls */}
        {identity && note && (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {t("readingProgress")}
            </span>
            <div className="flex-1 max-w-xs">
              <Slider
                data-ocid="note.progress.slider"
                value={[localProgress]}
                min={0}
                max={100}
                step={5}
                onValueChange={handleProgressChange}
                onValueCommit={handleProgressCommit}
                className="w-full"
              />
            </div>
            <span className="text-xs font-bold text-primary w-10">
              {localProgress}%
            </span>
            {updateProgress.isPending && (
              <Loader2Icon className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        )}

        {!identity && (
          <p className="mt-3 text-xs text-muted-foreground">
            🔒 {t("loginToBookmark")} and {t("loginToTrack").toLowerCase()}
          </p>
        )}
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 min-h-0 bg-muted/30">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : note ? (
          <iframe
            src={note.blob.getDirectURL()}
            className="w-full h-full border-0"
            title={note.title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Note not found
          </div>
        )}
      </div>
    </div>
  );
}
