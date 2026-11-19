interface TopBarProps {
  hasAnalysis: boolean;
  onExportPng: () => void;
  onScrollToInput: () => void;
  isExporting: boolean;
}

export function TopBar({
  hasAnalysis,
  onExportPng,
  onScrollToInput,
  isExporting,
}: TopBarProps) {
  return (
    <header className="no-print border-b border-[#D8D3B8] bg-[#FAF9F2]/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-8">
        <a
          href="#top"
          className="font-serif text-xl font-semibold tracking-tight text-[#186049] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#186049]"
        >
          Career Dossier Studio
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#4A5D55]">
          <a
            href="#intake-section"
            className="hover:text-[#186049] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Your Results
          </a>
          <a
            href="#poster-stage"
            className="hover:text-[#186049] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            Poster Preview
          </a>
          <a
            href="#framework-guide"
            className="hover:text-[#186049] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4"
          >
            How It Works
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          {hasAnalysis ? (
            <button
              type="button"
              onClick={onExportPng}
              disabled={isExporting}
              className="px-4 py-2 text-xs font-semibold tracking-wide text-white bg-[#186049] rounded-lg hover:bg-[#134D3A] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#186049]"
            >
              {isExporting ? 'Saving Poster...' : 'Download PNG Poster'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onScrollToInput}
              className="px-4 py-2 text-xs font-semibold tracking-wide text-white bg-[#186049] rounded-lg hover:bg-[#134D3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#186049]"
            >
              Start Your Dossier
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
