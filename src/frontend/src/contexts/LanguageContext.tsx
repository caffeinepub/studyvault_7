import { type ReactNode, createContext, useContext, useState } from "react";

export type Language = "en" | "hi";

const translations = {
  en: {
    appName: "StudyVault",
    tagline: "Your Complete Study Companion for Academic Excellence",
    searchPlaceholder: "Search notes...",
    bookmarks: "Bookmarks",
    progress: "Progress",
    adminPanel: "Admin Panel",
    uploadNote: "Upload Note",
    login: "Login",
    logout: "Logout",
    allCategories: "All Categories",
    class10: "Class 10",
    class11: "Class 11",
    class12: "Class 12",
    jee: "JEE",
    neet: "NEET",
    iitjee: "IIT-JEE",
    title: "Title",
    subject: "Subject",
    description: "Description",
    category: "Category",
    uploadPdf: "Upload PDF",
    submit: "Submit",
    delete: "Delete",
    view: "View",
    bookmark: "Bookmark",
    noNotesFound: "No notes found",
    loading: "Loading...",
    home: "Home",
    categories: "Categories",
    viewAll: "View All",
    recentNotes: "Recent Notes",
    browseByCategory: "Browse by Category",
    addedToBookmarks: "Added to bookmarks",
    removedFromBookmarks: "Removed from bookmarks",
    noteUploaded: "Note uploaded successfully",
    noteDeleted: "Note deleted",
    loginToBookmark: "Please login to bookmark notes",
    loginToTrack: "Please login to track progress",
    progressUpdated: "Progress updated",
    yourProgress: "Your Progress",
    readingProgress: "Reading Progress",
    notesRead: "Notes Read",
    uploadDate: "Upload Date",
    selectCategory: "Select category",
    dragOrClick: "Drag & drop PDF or click to browse",
    uploading: "Uploading...",
    confirmDelete: "Are you sure you want to delete this note?",
    cancel: "Cancel",
    confirm: "Confirm",
    profile: "Profile",
    yourName: "Your Name",
    saveProfile: "Save Profile",
    profileSaved: "Profile saved!",
    notes: "Notes",
    manageNotes: "Manage Notes",
    noBookmarks: "No bookmarked notes yet",
    noProgress: "No progress tracked yet",
    startStudying: "Start studying to track your progress",
  },
  hi: {
    appName: "StudyVault",
    tagline: "शैक्षणिक उत्कृष्टता के लिए आपका संपूर्ण अध्ययन साथी",
    searchPlaceholder: "नोट्स खोजें...",
    bookmarks: "बुकमार्क",
    progress: "प्रगति",
    adminPanel: "एडमिन पैनल",
    uploadNote: "नोट अपलोड करें",
    login: "लॉगिन",
    logout: "लॉगआउट",
    allCategories: "सभी श्रेणियां",
    class10: "कक्षा 10",
    class11: "कक्षा 11",
    class12: "कक्षा 12",
    jee: "JEE",
    neet: "NEET",
    iitjee: "IIT-JEE",
    title: "शीर्षक",
    subject: "विषय",
    description: "विवरण",
    category: "श्रेणी",
    uploadPdf: "PDF अपलोड करें",
    submit: "जमा करें",
    delete: "हटाएं",
    view: "देखें",
    bookmark: "बुकमार्क",
    noNotesFound: "कोई नोट नहीं मिला",
    loading: "लोड हो रहा है...",
    home: "होम",
    categories: "श्रेणियां",
    viewAll: "सभी देखें",
    recentNotes: "हाल के नोट्स",
    browseByCategory: "श्रेणी के अनुसार ब्राउज़ करें",
    addedToBookmarks: "बुकमार्क में जोड़ा गया",
    removedFromBookmarks: "बुकमार्क से हटाया गया",
    noteUploaded: "नोट सफलतापूर्वक अपलोड किया गया",
    noteDeleted: "नोट हटाया गया",
    loginToBookmark: "बुकमार्क करने के लिए लॉगिन करें",
    loginToTrack: "प्रगति ट्रैक करने के लिए लॉगिन करें",
    progressUpdated: "प्रगति अपडेट की गई",
    yourProgress: "आपकी प्रगति",
    readingProgress: "पढ़ने की प्रगति",
    notesRead: "पढ़े गए नोट्स",
    uploadDate: "अपलोड तिथि",
    selectCategory: "श्रेणी चुनें",
    dragOrClick: "PDF खींचें या ब्राउज़ करने के लिए क्लिक करें",
    uploading: "अपलोड हो रहा है...",
    confirmDelete: "क्या आप इस नोट को हटाना चाहते हैं?",
    cancel: "रद्द करें",
    confirm: "पुष्टि करें",
    profile: "प्रोफ़ाइल",
    yourName: "आपका नाम",
    saveProfile: "प्रोफ़ाइल सहेजें",
    profileSaved: "प्रोफ़ाइल सहेजी गई!",
    notes: "नोट्स",
    manageNotes: "नोट्स प्रबंधित करें",
    noBookmarks: "अभी तक कोई बुकमार्क नोट नहीं",
    noProgress: "अभी तक कोई प्रगति ट्रैक नहीं की गई",
    startStudying: "अपनी प्रगति ट्रैक करने के लिए पढ़ना शुरू करें",
  },
};

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
