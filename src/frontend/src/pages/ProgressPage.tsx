import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { BookOpenIcon, LogInIcon, TrendingUpIcon } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetProgress, useListNotes } from "../hooks/useQueries";
import { CATEGORY_CONFIG } from "../utils/categories";

export default function ProgressPage() {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const { t } = useLanguage();

  const { data: progressData, isLoading: loadingProgress } = useGetProgress();
  const { data: allNotes, isLoading: loadingNotes } = useListNotes();

  const isLoading = loadingProgress || loadingNotes;
  const progressMap = new Map(
    (progressData || []).map(([id, pct]) => [id.toString(), Number(pct)]),
  );
  const notesWithProgress = (allNotes || []).filter((n) =>
    progressMap.has(n.id.toString()),
  );

  const totalProgress = notesWithProgress.length
    ? notesWithProgress.reduce(
        (sum, n) => sum + (progressMap.get(n.id.toString()) ?? 0),
        0,
      ) / notesWithProgress.length
    : 0;

  const completedCount = notesWithProgress.filter(
    (n) => (progressMap.get(n.id.toString()) ?? 0) >= 100,
  ).length;

  return (
    <div data-ocid="progress.page" className="px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <TrendingUpIcon className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {t("yourProgress")}
          </h1>
          {identity && (
            <p className="text-sm text-muted-foreground">
              {t("readingProgress")}
            </p>
          )}
        </div>
      </div>

      {!identity ? (
        <div data-ocid="progress.empty_state" className="text-center py-20">
          <TrendingUpIcon className="w-14 h-14 mx-auto mb-4 text-muted-foreground/30" />
          <p className="font-medium text-foreground mb-2">
            Login to track your progress
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Monitor how much of each note you&apos;ve read
          </p>
          <Button
            data-ocid="progress.login.button"
            onClick={login}
            className="gap-2"
          >
            <LogInIcon className="w-4 h-4" />
            {t("login")}
          </Button>
        </div>
      ) : isLoading ? (
        <div data-ocid="progress.loading_state" className="space-y-4">
          {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
            <Skeleton key={k} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="text-2xl font-bold font-display text-foreground">
                  {notesWithProgress.length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t("notesRead")}
                </div>
                <Progress
                  value={
                    (notesWithProgress.length /
                      Math.max(allNotes?.length ?? 1, 1)) *
                    100
                  }
                  className="h-1.5 mt-3"
                />
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="text-2xl font-bold font-display text-emerald-600">
                  {Math.round(totalProgress)}%
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Average Progress
                </div>
                <Progress value={totalProgress} className="h-1.5 mt-3" />
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-5">
                <div className="text-2xl font-bold font-display text-primary">
                  {completedCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Completed
                </div>
                <Progress
                  value={completedCount > 0 ? 100 : 0}
                  className="h-1.5 mt-3"
                />
              </CardContent>
            </Card>
          </div>

          {notesWithProgress.length === 0 ? (
            <div
              data-ocid="progress.empty_state"
              className="text-center py-16 text-muted-foreground"
            >
              <BookOpenIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{t("noProgress")}</p>
              <p className="text-sm mt-1">{t("startStudying")}</p>
              <Button
                data-ocid="progress.browse.button"
                variant="outline"
                className="mt-4"
                onClick={() => navigate({ to: "/" })}
              >
                Start Reading
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {notesWithProgress.map((note, i) => {
                const pct = progressMap.get(note.id.toString()) ?? 0;
                const config = CATEGORY_CONFIG[note.category];
                return (
                  <motion.div
                    key={note.id.toString()}
                    data-ocid={`progress.item.${i + 1}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card
                      className="shadow-card cursor-pointer hover:shadow-card-hover transition-all"
                      onClick={() =>
                        navigate({
                          to: "/note/$id",
                          params: { id: note.id.toString() },
                        })
                      }
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xl flex-shrink-0">
                              {config.emoji}
                            </span>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">
                                {note.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {note.subject} · {config.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-24">
                              <Progress value={pct} className="h-2" />
                            </div>
                            <span
                              className={`text-sm font-bold w-10 text-right ${
                                pct >= 100 ? "text-emerald-600" : "text-primary"
                              }`}
                            >
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
