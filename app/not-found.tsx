import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyanGlow/30 flex items-center justify-center text-cyanGlow">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white">404 — Page Not Found</h1>
        <p className="text-sm text-textMuted max-w-md">
          The requested page does not exist or has been shifted.
        </p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cardBg border border-borderColor text-white text-xs font-bold hover:border-cyanGlow/40 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Universal Converter</span>
      </Link>
    </div>
  );
}
