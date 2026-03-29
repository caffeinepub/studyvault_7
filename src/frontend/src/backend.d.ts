import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export interface Note {
    id: bigint;
    title: string;
    subject: string;
    blob: ExternalBlob;
    createdAt: Time;
    description: string;
    category: Category;
    uploadedBy: Principal;
}
export enum Category {
    jee = "jee",
    neet = "neet",
    class10 = "class10",
    class11 = "class11",
    class12 = "class12",
    iitjee = "iitjee"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(noteId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createNote(noteData: {
        title: string;
        subject: string;
        blob: ExternalBlob;
        description: string;
        category: Category;
    }): Promise<bigint>;
    deleteNote(noteId: bigint): Promise<void>;
    filterNotesByCategory(category: Category): Promise<Array<Note>>;
    getBookmarks(): Promise<Array<bigint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getNote(noteId: bigint): Promise<Note>;
    getProgress(): Promise<Array<[bigint, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listNotes(): Promise<Array<Note>>;
    removeBookmark(noteId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchNotes(searchTerm: string): Promise<Array<Note>>;
    updateProgress(noteId: bigint, percentage: bigint): Promise<void>;
}
