import { useEffect, type ReactNode } from 'react';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { cn } from '../utils/cn';

interface PageLayoutProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  title?: string;
  titleContent?: ReactNode;    // replaces the h1 when provided (e.g. title + room code badge)
  backHref?: string;           // renders an <a> back button
  onBack?: () => void;         // renders a <button> back button (use one or the other)
  extraControls?: ReactNode;   // rendered to the right of the theme toggle
  headerExtra?: ReactNode;     // extra row below the main header row (e.g. room code on mobile)
  contentClassName?: string;   // defaults to "flex-1 flex flex-col pt-8 px-4 pb-4"
  children: ReactNode;
}

export default function PageLayout({
  theme,
  toggleTheme,
  title,
  titleContent,
  backHref,
  onBack,
  extraControls,
  headerExtra,
  contentClassName,
  children,
}: PageLayoutProps) {
  const isLight = theme === 'light';

  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
    return () => {
      document.documentElement.classList.remove('theme-light');
    };
  }, [isLight]);

  const backButtonClass = cn(
    "absolute left-0 p-1.5 rounded-full transition-all flex items-center justify-center",
    isLight ? "text-gray-700 hover:text-gray-900 hover:bg-black/5" : "text-gray-400 hover:text-white hover:bg-white/10"
  );

  return (
    <div className={cn(
      "min-h-screen flex flex-col font-sans transition-colors duration-300 mx-auto max-w-xl md:max-w-5xl landscape:max-w-5xl",
      isLight ? "bg-clocktower-parchment text-clocktower-night" : "bg-clocktower-night text-clocktower-parchment"
    )}>
      <header className={cn(
        "relative flex flex-col items-center justify-center border-b pb-3 w-full pt-4",
        headerExtra && "gap-2.5",
        isLight ? "border-clocktower-blood/20" : "border-clocktower-blood"
      )}>
        <div className="relative flex justify-center items-center w-full min-h-[36px] px-4">
          {backHref && (
            <a href={backHref} className={backButtonClass} title="Back">
              <ArrowLeft size={24} />
            </a>
          )}
          {onBack && (
            <button onClick={onBack} className={backButtonClass} title="Back">
              <ArrowLeft size={24} />
            </button>
          )}

          {titleContent ?? (
            <h1 className="text-xl font-bold text-clocktower-blood tracking-wide text-center px-10">
              {title}
            </h1>
          )}

          <div className="absolute right-0 flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className={cn("p-2 transition-colors", isLight ? "text-gray-600 hover:text-gray-900" : "text-gray-500 hover:text-white")}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {extraControls}
          </div>
        </div>

        {headerExtra}
      </header>

      <div className={contentClassName ?? "flex-1 flex flex-col pt-8 px-4 pb-4"}>
        {children}
      </div>
    </div>
  );
}
