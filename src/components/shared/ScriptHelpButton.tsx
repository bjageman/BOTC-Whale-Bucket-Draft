import { useState } from 'react';
import { HelpCircle, FileEdit, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '../../utils/cn';
import DialogModal from './DialogModal';

interface ScriptHelpButtonProps {
  isLightModeActive: boolean;
}

export default function ScriptHelpButton({ isLightModeActive }: ScriptHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        id="script-upload-help-button"
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
          isLightModeActive
            ? "bg-white/80 border-gray-300 text-gray-500 hover:text-clocktower-blood hover:border-clocktower-blood/40"
            : "bg-gray-900/80 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500"
        )}
        title="What is this?"
      >
        <HelpCircle size={13} />
      </button>
      <DialogModal
        isOpen={isOpen}
        type="alert"
        title="How to Upload a Script"
        message={
          <div className="space-y-4">
            <p>
              If you're playing with a script, you'll need to upload a JSON version of it to view it on this app.
            </p>
            <div className="space-y-2 text-left">
              <a
                href="https://script.bloodontheclocktower.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                  isLightModeActive
                    ? "bg-gray-50 border-gray-200 text-gray-800 hover:border-clocktower-blood/50 hover:bg-gray-100"
                    : "bg-gray-955 border-gray-800 text-gray-200 hover:border-clocktower-blood hover:bg-gray-900"
                )}
              >
                <FileEdit size={14} className="text-clocktower-blood shrink-0" />
                <span>
                   <span className="text-clocktower-blood">BOTC Script Editor</span>
                </span>
                <ExternalLink size={12} className="ml-auto shrink-0 text-gray-500" />
              </a>
              <a
                href="https://www.botcscripts.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold transition-colors",
                  isLightModeActive
                    ? "bg-gray-50 border-gray-200 text-gray-800 hover:border-clocktower-blood/50 hover:bg-gray-100"
                    : "bg-gray-955 border-gray-800 text-gray-200 hover:border-clocktower-blood hover:bg-gray-900"
                )}
              >
                <BookOpen size={14} className="text-clocktower-blood shrink-0" />
                <span>
                  <span className="text-clocktower-blood">BOTC Scripts Repository</span>
                </span>
                <ExternalLink size={12} className="ml-auto shrink-0 text-gray-500" />
              </a>
            </div>
          </div>
        }
        confirmLabel="Got it"
        cancelLabel="Close"
        onConfirm={() => setIsOpen(false)}
        onCancel={() => setIsOpen(false)}
        isLightModeActive={isLightModeActive}
      />
    </>
  );
}
