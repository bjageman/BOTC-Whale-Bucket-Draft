import { useState } from 'react';
import { useScrollLock } from '../hooks/useScrollLock';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import { cn } from '../utils/cn';

interface RoomCodeModalProps {
  gameCode: string;
  joinUrl: string;
  onClose: () => void;
  isLightModeActive: boolean;
}

export default function RoomCodeModal({ gameCode, joinUrl, onClose, isLightModeActive }: RoomCodeModalProps) {
  useScrollLock();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copy = (text: string, which: 'url' | 'code') => {
    navigator.clipboard.writeText(text);
    if (which === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full max-w-xs rounded-xl shadow-2xl p-5 space-y-4',
          isLightModeActive
            ? 'bg-white border border-clocktower-blood/20 text-gray-800'
            : 'bg-gray-900 border border-gray-800 text-gray-100'
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <p className={cn('text-xs font-semibold uppercase tracking-widest mb-0.5', isLightModeActive ? 'text-gray-400' : 'text-gray-500')}>
            Room Code
          </p>
          <p className="text-3xl font-mono font-bold tracking-widest text-clocktower-blood">
            {gameCode}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="bg-white p-3 rounded-lg">
            <QRCode value={joinUrl} size={160} />
          </div>
        </div>

        {/* Copy buttons */}
        <div className="space-y-2">
          <button
            onClick={() => copy(joinUrl, 'url')}
            className={cn(
              'w-full px-3 py-2 rounded-md text-sm font-semibold border transition-colors',
              isLightModeActive
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            )}
          >
            {copiedUrl ? '✓ Copied!' : 'Copy Join URL'}
          </button>
          <button
            onClick={() => copy(gameCode, 'code')}
            className={cn(
              'w-full px-3 py-2 rounded-md text-sm font-semibold border transition-colors',
              isLightModeActive
                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
            )}
          >
            {copiedCode ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
