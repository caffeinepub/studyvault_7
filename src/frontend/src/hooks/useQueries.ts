import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Category, ExternalBlob } from "../backend";
import type { Note } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useListNotes() {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listNotes();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useFilterNotesByCategory(category: Category) {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.filterNotesByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchNotes(term: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Note[]>({
    queryKey: ["notes", "search", term],
    queryFn: async () => {
      if (!actor || !term.trim()) return [];
      return actor.searchNotes(term);
    },
    enabled: !!actor && !isFetching && term.trim().length > 0,
  });
}

export function useGetNote(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Note>({
    queryKey: ["note", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getNote(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBookmarks() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<bigint[]>({
    queryKey: ["bookmarks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookmarks();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetProgress() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Array<[bigint, bigint]>>({
    queryKey: ["progress"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProgress();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
    staleTime: 60_000,
  });
}

export function useGetRole() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["role"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetCallerProfile() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useAddBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.addBookmark(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useRemoveBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.removeBookmark(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}

export function useUpdateProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      noteId,
      percentage,
    }: { noteId: bigint; percentage: number }) => {
      if (!actor) throw new Error("Not connected");
      await actor.updateProgress(noteId, BigInt(Math.round(percentage)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function useCreateNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      title: string;
      subject: string;
      description: string;
      category: Category;
      file: File;
      onProgress?: (p: number) => void;
    }) => {
      if (!actor) throw new Error("Not connected");
      const bytes = new Uint8Array(await data.file.arrayBuffer());
      let blob = ExternalBlob.fromBytes(bytes);
      if (data.onProgress) {
        blob = blob.withUploadProgress(data.onProgress);
      }
      return actor.createNote({
        title: data.title,
        subject: data.subject,
        description: data.description,
        category: data.category,
        blob,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: bigint) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteNote(noteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
    },
  });
}
