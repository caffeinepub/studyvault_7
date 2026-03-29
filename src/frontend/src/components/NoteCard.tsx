import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookmarkIcon, CalendarIcon, EyeIcon } from "lucide-react";
import { motion } from "motion/react";
import type { Note } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import { CATEGORY_CONFIG } from "../utils/categories";

interface NoteCardProps {
  note: Note;
  index?: number;
  isBookmarked?: boolean;
  progress?: number;
  isLoggedIn?: boolean;
  onBookmarkToggle?: (noteId: bigint, isCurrentlyBookmarked: boolean) => void;
  onView?: (noteId: bigint) => void;
}

export default function NoteCard({
  note,
  index = 0,
  isBookmarked = false,
  progress,
  isLoggedIn = false,
  onBookmarkToggle,
  onView,
}: NoteCardProps) {
  const { t } = useLanguage();
  const config = CATEGORY_CONFIG[note.category];
  const createdAt = new Date(Number(note.createdAt / 1_000_000n));
  const formattedDate = createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card
        data-ocid={`notes.item.${index + 1}`}
        className="group bg-card border border-border shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer"
        onClick={() => onView?.(note.id)}
      >
        {/* Top color strip */}
        <div
          className={`h-1.5 w-full bg-gradient-to-r ${config.gradientClass}`}
        />

        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{config.emoji}</span>
                <Badge
                  variant="outline"
                  className={`text-xs font-medium ${config.textClass} ${config.lightBgClass} ${config.borderClass}`}
                >
                  {config.label}
                </Badge>
              </div>

              <h3 className="font-display font-semibold text-foreground leading-snug line-clamp-2 text-[15px] mb-1">
                {note.title}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mb-2">
                {note.subject}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {note.description}
              </p>
            </div>

            {isLoggedIn && (
              <button
                type="button"
                data-ocid={`notes.toggle.${index + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmarkToggle?.(note.id, isBookmarked);
                }}
                className="flex-shrink-0 p-1.5 rounded-lg hover:bg-muted transition-colors"
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
              >
                <BookmarkIcon
                  className={`w-5 h-5 transition-colors ${
                    isBookmarked
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Progress bar */}
          {isLoggedIn && progress !== undefined && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground">
                  {t("readingProgress")}
                </span>
                <span className="text-xs font-semibold text-primary">
                  {progress}%
                </span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </div>
            <Button
              data-ocid={`notes.button.${index + 1}`}
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(note.id);
              }}
            >
              <EyeIcon className="w-3.5 h-3.5 mr-1" />
              {t("view")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
