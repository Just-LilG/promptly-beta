import { House, Compass, ChatCircle, GitDiff, Books, FlowArrow, BookOpen, ChartBar, GraduationCap, Target, Barbell, User, Briefcase } from "@/icons";
import type { Icon } from "@/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: Icon;
  blurb?: string;
  // Shown in the mobile bottom bar. Keep this to 4 for iOS-style tab bars.
  primary?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: House, primary: true },
  { href: "/learn", label: "Learn", icon: GraduationCap, primary: true },
  { href: "/sandbox", label: "Sandbox", icon: ChatCircle, primary: true },
  { href: "/account", label: "Account", icon: User, primary: true },
  {
    href: "/tracks",
    label: "Tracks",
    icon: Compass,
    blurb: "Practice by domain: writing, coding, everyday work.",
  },
  {
    href: "/progress",
    label: "Progress",
    icon: ChartBar,
    blurb: "Scores, streaks, and what you have finished.",
  },
  {
    href: "/task-coach",
    label: "Bring your own task",
    icon: Target,
    blurb: "Paste a real prompt and get it coached.",
  },
  {
    href: "/library",
    label: "Prompt library",
    icon: Books,
    blurb: "Copy a template and fill in the blanks.",
  },
  {
    href: "/practice",
    label: "Quick challenges",
    icon: Barbell,
    blurb: "Extra drills outside the domain tracks.",
  },
  {
    href: "/compare",
    label: "Compare",
    icon: GitDiff,
    blurb: "See two prompt versions side by side.",
  },
  {
    href: "/reference",
    label: "Reference",
    icon: BookOpen,
    blurb: "A pocket guide to prompting terms.",
  },
  {
    href: "/workflows",
    label: "My workflows",
    icon: FlowArrow,
    blurb: "Save prompts you want to reuse.",
  },
  {
    href: "/tools",
    label: "Tools",
    icon: Briefcase,
    blurb: "Library, drills, compare, and saved prompts.",
  },
];

export const primaryNavItems = navItems.filter((item) => item.primary);

const SIDEBAR_HREFS = ["/", "/learn", "/tracks", "/sandbox", "/progress", "/library", "/task-coach", "/tools"];
export const sidebarNavItems = SIDEBAR_HREFS.map(
  (href) => navItems.find((item) => item.href === href)!
);

const TOOL_HREFS = ["/library", "/practice", "/compare", "/reference", "/workflows"];
export const toolItems = TOOL_HREFS.map(
  (href) => navItems.find((item) => item.href === href)!
);
export const homeToolPreviewItems = toolItems.slice(0, 4);
