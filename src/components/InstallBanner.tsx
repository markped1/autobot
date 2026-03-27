import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferredPrompt(null);
  };

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (!showBanner && !isIOS) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] flex items-center justify-between gap-4 glass rounded-2xl px-5 py-4 border border-primary/30 shadow-2xl shadow-primary/10">
      <div className="flex items-center gap-3">
        <img src="/logo.png" className="w-10 h-10 object-contain" style={{ mixBlendMode: 'screen' }} />
        <div>
          <p className="font-bold text-sm">Install TomAutoBot</p>
          <p className="text-[11px] text-white/50">
            {isIOS
              ? 'Tap Share → "Add to Home Screen" in Safari'
              : 'Install as an app for offline access'}
          </p>
        </div>
      </div>
      {!isIOS && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
          >
            <Download size={14} />
            Install
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-white/30 hover:text-white text-xl px-1"
          >×</button>
        </div>
      )}
    </div>
  );
}
