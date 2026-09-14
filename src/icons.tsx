import type { JSX, SVGProps } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowReloadHorizontalIcon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BadgeAlertIcon,
  Book04Icon,
  BookOpen02Icon,
  Briefcase02Icon,
  BubbleChatIcon,
  Cancel01Icon,
  ChartBarIncreasingIcon,
  CheckmarkCircle02Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleIcon,
  ClipboardIcon,
  Clock04Icon,
  CloudCheckIcon,
  CodeIcon,
  Comment01Icon,
  Compass01Icon,
  Copy01Icon,
  CpuIcon,
  Download04Icon,
  Dumbbell02Icon,
  File02Icon,
  FireIcon,
  GitCompareIcon,
  Globe02Icon,
  GraduationCapIcon,
  Home05Icon,
  Image01Icon,
  Login03Icon,
  Logout03Icon,
  MagicWand01Icon,
  Mic02Icon,
  Moon02Icon,
  MoreHorizontalIcon,
  Notification03Icon,
  PaintBoardIcon,
  PaperclipIcon,
  PencilEdit02Icon,
  PlusSignIcon,
  PlusSignSquareIcon,
  ReloadIcon,
  Search01Icon,
  SentIcon,
  Settings02Icon,
  Share08Icon,
  ShieldCheckIcon,
  ShuffleIcon,
  SmartPhone01Icon,
  SparklesIcon,
  SquareLock02Icon,
  StopIcon,
  Sun03Icon,
  Target01Icon,
  Tick02Icon,
  TrashIcon,
  TrophyIcon,
  Upload04Icon,
  UserIcon,
  VolumeHighIcon,
  VolumeMute01Icon,
  WorkflowSquare10Icon,
} from "@hugeicons/core-free-icons";

/** Hugeicons stroke-rounded (free). Same names the rest of the app already imports. */

export type IconProps = SVGProps<SVGSVGElement> & { weight?: string };
export type AppIcon = (props: IconProps) => JSX.Element;
export type Icon = AppIcon;

function wrap(data: IconSvgElement): AppIcon {
  function Icon({ className, weight = "regular", strokeWidth: _strokeWidth, ...props }: IconProps) {
    const strokeWidth = weight === "bold" ? 2.4 : weight === "fill" ? 2 : 1.5;
    return (
      <HugeiconsIcon
        {...props}
        icon={data}
        strokeWidth={strokeWidth}
        absoluteStrokeWidth
        color="currentColor"
        aria-hidden
        className={["shrink-0", className].filter(Boolean).join(" ")}
      />
    );
  }
  return Icon;
}

export const House = wrap(Home05Icon);
export const Compass = wrap(Compass01Icon);
export const ChatCircle = wrap(BubbleChatIcon);
export const ChatCircleText = wrap(Comment01Icon);
export const GitDiff = wrap(GitCompareIcon);
export const Books = wrap(Book04Icon);
export const FlowArrow = wrap(WorkflowSquare10Icon);
export const BookOpen = wrap(BookOpen02Icon);
export const ChartBar = wrap(ChartBarIncreasingIcon);
export const GraduationCap = wrap(GraduationCapIcon);
export const Target = wrap(Target01Icon);
export const Barbell = wrap(Dumbbell02Icon);
export const DotsThree = wrap(MoreHorizontalIcon);
export const CaretRight = wrap(ChevronRightIcon);
export const CaretLeft = wrap(ChevronLeftIcon);
export const CaretDown = wrap(ChevronDownIcon);
export const User = wrap(UserIcon);
export const Globe = wrap(Globe02Icon);
export const Bell = wrap(Notification03Icon);
export const ArrowRight = wrap(ArrowRight01Icon);
export const Sparkle = wrap(SparklesIcon);
export const Fire = wrap(FireIcon);
export const Code = wrap(CodeIcon);
export const Sun = wrap(Sun03Icon);
export const Moon = wrap(Moon02Icon);
export const Palette = wrap(PaintBoardIcon);
export const Pen = wrap(PencilEdit02Icon);
export const MagnifyingGlass = wrap(Search01Icon);
export const Briefcase = wrap(Briefcase02Icon);
export const CheckCircle = wrap(CheckmarkCircle02Icon);
export const Check = wrap(Tick02Icon);
export const ArrowCounterClockwise = wrap(ArrowReloadHorizontalIcon);
export const Warning = wrap(BadgeAlertIcon);
export const Trophy = wrap(TrophyIcon);
export const SignOut = wrap(Logout03Icon);
export const SignIn = wrap(Login03Icon);
export const Shuffle = wrap(ShuffleIcon);
export const UploadSimple = wrap(Upload04Icon);
export const Copy = wrap(Copy01Icon);
export const Plus = wrap(PlusSignIcon);
export const PencilSimple = wrap(PencilEdit02Icon);
export const Trash = wrap(TrashIcon);
export const X = wrap(Cancel01Icon);
export const MagicWand = wrap(MagicWand01Icon);
export const Circle = wrap(CircleIcon);
export const ShieldCheck = wrap(ShieldCheckIcon);
export const Cpu = wrap(CpuIcon);
export const Gear = wrap(Settings02Icon);
export const Lock = wrap(SquareLock02Icon);
export const DownloadSimple = wrap(Download04Icon);
export const ShareNetwork = wrap(Share08Icon);
export const PlusSquare = wrap(PlusSignSquareIcon);
export const ClockCounterClockwise = wrap(Clock04Icon);
export const CloudCheck = wrap(CloudCheckIcon);
export const DeviceMobile = wrap(SmartPhone01Icon);
export const ArrowUp = wrap(ArrowUp01Icon);
export const Microphone = wrap(Mic02Icon);
export const Paperclip = wrap(PaperclipIcon);
export const FileText = wrap(File02Icon);
export const ImageSquare = wrap(Image01Icon);
export const ArrowsClockwise = wrap(ReloadIcon);
export const SpeakerHigh = wrap(VolumeHighIcon);
export const SpeakerX = wrap(VolumeMute01Icon);
export const PaperPlaneTilt = wrap(SentIcon);
export const ClipboardText = wrap(ClipboardIcon);
export const Stop = wrap(StopIcon);

export function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
