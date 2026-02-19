import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              QV
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Shravya</p>
              <p className="text-xs text-slate-500">National Language Translation Mission</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <a href="#" className="hover:text-slate-900">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-900">
              Terms
            </a>
            <a href="#" className="hover:text-slate-900">
              Accessibility
            </a>
            <a href="#" className="hover:text-slate-900">
              Contact
            </a>
          </div>

          <div className="text-xs text-slate-500 md:text-right">
            <p>© {new Date().getFullYear()} National Language Translation Mission</p>
            <p className="mt-1">WCAG AA compliant</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;