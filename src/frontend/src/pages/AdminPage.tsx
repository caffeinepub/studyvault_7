import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircleIcon,
  FileTextIcon,
  Loader2Icon,
  LogInIcon,
  ShieldIcon,
  TrashIcon,
  UploadIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Category } from "../backend";
import { useLanguage } from "../contexts/LanguageContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateNote,
  useDeleteNote,
  useIsAdmin,
  useListNotes,
} from "../hooks/useQueries";
import { ALL_CATEGORIES, CATEGORY_CONFIG } from "../utils/categories";

export default function AdminPage() {
  const { identity, login } = useInternetIdentity();
  const { t } = useLanguage();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: notes, isLoading: loadingNotes } = useListNotes();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    description: "",
    category: "" as Category | "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please select a PDF file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a PDF");
      return;
    }
    if (!form.title || !form.subject || !form.category) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      setUploadProgress(0);
      await createNote.mutateAsync({
        title: form.title,
        subject: form.subject,
        description: form.description,
        category: form.category as Category,
        file: selectedFile,
        onProgress: setUploadProgress,
      });
      toast.success(t("noteUploaded"));
      setForm({ title: "", subject: "", description: "", category: "" });
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleDelete = async (noteId: bigint) => {
    try {
      await deleteNote.mutateAsync(noteId);
      toast.success(t("noteDeleted"));
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!identity) {
    return (
      <div
        data-ocid="admin.page"
        className="flex flex-col items-center justify-center py-24 px-8"
      >
        <ShieldIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          {t("adminPanel")}
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Please login to access the admin panel
        </p>
        <Button
          data-ocid="admin.login.button"
          onClick={login}
          className="gap-2"
        >
          <LogInIcon className="w-4 h-4" />
          {t("login")}
        </Button>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="flex items-center justify-center py-24"
      >
        <Loader2Icon className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        data-ocid="admin.page"
        className="flex flex-col items-center justify-center py-24 px-8"
      >
        <ShieldIcon className="w-16 h-16 text-destructive/30 mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm">
          You don&apos;t have admin privileges
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="admin.page" className="px-8 py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShieldIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {t("adminPanel")}
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage study notes and content
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload form */}
        <Card data-ocid="admin.upload.card" className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-display">
              <UploadIcon className="w-5 h-5 text-primary" />
              {t("uploadNote")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium">
                  {t("title")} *
                </Label>
                <Input
                  data-ocid="admin.title.input"
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="e.g. Thermodynamics Chapter 1"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm font-medium">
                  {t("subject")} *
                </Label>
                <Input
                  data-ocid="admin.subject.input"
                  id="subject"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  placeholder="e.g. Physics, Chemistry, Maths"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-sm font-medium">
                  {t("category")} *
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, category: v as Category }))
                  }
                >
                  <SelectTrigger
                    data-ocid="admin.category.select"
                    id="category"
                  >
                    <SelectValue placeholder={t("selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CATEGORIES.map((cat) => {
                      const cfg = CATEGORY_CONFIG[cat];
                      return (
                        <SelectItem key={cat} value={cat}>
                          {cfg.emoji} {cfg.label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium">
                  {t("description")}
                </Label>
                <Textarea
                  data-ocid="admin.description.textarea"
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this note..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {t("uploadPdf")} *
                </Label>
                <button
                  type="button"
                  data-ocid="admin.pdf.dropzone"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-primary">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {selectedFile.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <FileTextIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        {t("dragOrClick")}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        PDF files only
                      </p>
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  data-ocid="admin.pdf.upload_button"
                />
              </div>

              {createNote.isPending && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("uploading")}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <Button
                data-ocid="admin.submit.button"
                type="submit"
                className="w-full gap-2"
                disabled={createNote.isPending}
              >
                {createNote.isPending ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    {t("uploading")}
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    {t("submit")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notes list */}
        <div>
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-muted-foreground" />
            {t("manageNotes")}
            {notes && <Badge variant="secondary">{notes.length}</Badge>}
          </h2>

          {loadingNotes ? (
            <div data-ocid="admin.loading_state" className="space-y-3">
              {["sk0", "sk1", "sk2", "sk3", "sk4", "sk5"].map((k) => (
                <Skeleton key={k} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : !notes?.length ? (
            <div
              data-ocid="admin.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <FileTextIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No notes uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {notes.map((note, i) => {
                const config = CATEGORY_CONFIG[note.category];
                return (
                  <motion.div
                    key={note.id.toString()}
                    data-ocid={`admin.notes.item.${i + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:shadow-card transition-shadow"
                  >
                    <span className="text-xl flex-shrink-0">
                      {config.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {note.subject} · {config.label}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          data-ocid={`admin.notes.delete_button.${i + 1}`}
                          variant="ghost"
                          size="sm"
                          className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="admin.delete.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("confirmDelete")} &quot;{note.title}&quot;
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="admin.delete.cancel_button">
                            {t("cancel")}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            data-ocid="admin.delete.confirm_button"
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(note.id)}
                          >
                            {t("delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
