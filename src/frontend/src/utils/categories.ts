import { Category } from "../backend";

export interface CategoryConfig {
  label: string;
  labelHi: string;
  emoji: string;
  bgClass: string;
  textClass: string;
  lightBgClass: string;
  borderClass: string;
  gradientClass: string;
  description: string;
}

export const CATEGORY_CONFIG: Record<Category, CategoryConfig> = {
  [Category.class10]: {
    label: "Class 10",
    labelHi: "कक्षा 10",
    emoji: "📚",
    bgClass: "bg-amber-500",
    textClass: "text-amber-700",
    lightBgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    gradientClass: "from-amber-500 to-amber-600",
    description: "CBSE & State board notes for 10th grade",
  },
  [Category.class11]: {
    label: "Class 11",
    labelHi: "कक्षा 11",
    emoji: "📖",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-700",
    lightBgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    gradientClass: "from-emerald-500 to-emerald-600",
    description: "Foundation notes for Class 11 science",
  },
  [Category.class12]: {
    label: "Class 12",
    labelHi: "कक्षा 12",
    emoji: "🎓",
    bgClass: "bg-violet-500",
    textClass: "text-violet-700",
    lightBgClass: "bg-violet-50",
    borderClass: "border-violet-200",
    gradientClass: "from-violet-500 to-violet-600",
    description: "Board exam preparation & revision",
  },
  [Category.jee]: {
    label: "JEE",
    labelHi: "JEE",
    emoji: "⚡",
    bgClass: "bg-rose-500",
    textClass: "text-rose-700",
    lightBgClass: "bg-rose-50",
    borderClass: "border-rose-200",
    gradientClass: "from-rose-500 to-rose-600",
    description: "JEE Mains & Advanced preparation",
  },
  [Category.neet]: {
    label: "NEET",
    labelHi: "NEET",
    emoji: "🔬",
    bgClass: "bg-cyan-500",
    textClass: "text-cyan-700",
    lightBgClass: "bg-cyan-50",
    borderClass: "border-cyan-200",
    gradientClass: "from-cyan-500 to-cyan-600",
    description: "Medical entrance exam study material",
  },
  [Category.iitjee]: {
    label: "IIT-JEE",
    labelHi: "IIT-JEE",
    emoji: "🏆",
    bgClass: "bg-yellow-500",
    textClass: "text-yellow-700",
    lightBgClass: "bg-yellow-50",
    borderClass: "border-yellow-200",
    gradientClass: "from-yellow-500 to-yellow-600",
    description: "Advanced IIT preparation material",
  },
};

export const ALL_CATEGORIES = Object.values(Category);
