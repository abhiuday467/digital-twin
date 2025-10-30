'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import Twin from './twin';

const STORAGE_KEY = 'twin-chat-open';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored === 'true') {
      setIsOpen(true);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    window.localStorage.setItem(STORAGE_KEY, String(isOpen));
  }, [isOpen, hasHydrated]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div
          className="relative w-[360px] max-w-[90vw] h-[520px] shadow-2xl rounded-3xl border border-[#7dded3] bg-[#d6f3ef]/95 backdrop-blur"
          role="dialog"
          aria-modal="false"
          aria-label="Christopher Clowes chat window"
        >
          <button
            type="button"
            onClick={toggle}
            className="absolute top-3 right-3 inline-flex items-center justify-center rounded-full bg-white/90 border border-[#0bb7a4]/30 p-1.5 text-[#0f3f3b] hover:bg-[#bdf0e9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0bb7a4]"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="h-full overflow-hidden rounded-3xl border border-white/40 shadow-inner">
            <Twin />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggle}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#0bb7a4] text-white shadow-lg hover:bg-[#099987] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0bb7a4]"
        aria-label={isOpen ? 'Hide chat' : 'Open chat'}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
