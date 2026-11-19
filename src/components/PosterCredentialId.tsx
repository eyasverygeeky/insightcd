import React from 'react';
import type { CareerProfileAnalysis } from '../types/profile';

interface PosterCredentialIdProps {
  posterRef: React.RefObject<HTMLDivElement | null>;
  analysis: CareerProfileAnalysis;
  learnerName: string;
  learnerTrack: string;
  portraitUrl: string | null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatIssueDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '2026';
  }
}

export function PosterCredentialId({
  posterRef,
  analysis,
  learnerName,
  learnerTrack,
  portraitUrl,
}: PosterCredentialIdProps) {
  const displayName = learnerName.trim() || 'Student Profile';
  const displayTrack = learnerTrack.trim() || 'Student Career Exploration';
  const issueDate = formatIssueDate(analysis.generatedAt);

  const riasecBars = [
    { code: 'R', label: 'Realistic', val: analysis.riasec.scores.realistic },
    { code: 'I', label: 'Investigative', val: analysis.riasec.scores.investigative },
    { code: 'A', label: 'Artistic', val: analysis.riasec.scores.artistic },
    { code: 'S', label: 'Social', val: analysis.riasec.scores.social },
    { code: 'E', label: 'Enterprising', val: analysis.riasec.scores.enterprising },
    { code: 'C', label: 'Conventional', val: analysis.riasec.scores.conventional },
  ];

  const barcodeWidths = [2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1];

  return (
    <article
      ref={posterRef}
      className="print-poster w-full max-w-[560px] mx-auto bg-white text-[#142B22] border border-[#C9C3A3] rounded-xl shadow-[0_18px_44px_-18px_rgba(24,96,73,0.22)] overflow-hidden"
    >
      {/* Top Student ID Band */}
      <header className="bg-[#186049] text-white px-6 py-4 flex items-center justify-between gap-4 border-b-2 border-[#D98327]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#ECE8AF]">
            Student Career Profile ID
          </p>
          <p className="font-serif text-lg font-semibold tracking-tight mt-0.5">
            Career Dossier Studio
          </p>
        </div>
        <div className="text-right font-mono text-[11px] tabular-nums">
          <p className="text-[#ECE8AF] uppercase tracking-wider">ID NO.</p>
          <p className="font-semibold tracking-wider">{analysis.dossierId}</p>
        </div>
      </header>

      {/* Main ID Subject Card */}
      <div className="p-6 space-y-5 bg-[#FAF9F2]">
        <div className="flex items-stretch gap-5 pb-5 border-b border-[#DDD7B8]">
          {/* Portrait Frame */}
          <div className="w-[104px] min-h-[126px] rounded-lg border border-[#C9C3A3] bg-white shrink-0 overflow-hidden flex flex-col items-center justify-center p-1">
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <div className="w-full h-full rounded bg-[#ECE8AF]/55 flex flex-col items-center justify-center">
                <span className="font-serif text-3xl font-semibold text-[#186049]">
                  {getInitials(displayName)}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#4A5D55] mt-1.5">
                  Student ID
                </span>
              </div>
            )}
          </div>

          {/* Identity Fields */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#4A5D55]">
                Student Name
              </p>
              <h3 className="font-serif text-2xl font-semibold text-[#142B22] leading-tight mt-0.5">
                {displayName}
              </h3>
              <p className="text-xs text-[#4A5D55] mt-1">{displayTrack}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2DDC3] mt-3">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A5D55]">
                  Holland Code
                </p>
                <p className="font-mono text-lg font-semibold text-[#186049] tracking-[0.16em] tabular-nums">
                  {analysis.riasec.extractedCode}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A5D55]">
                  Career Archetype
                </p>
                <p className="text-xs font-semibold text-[#142B22] leading-snug mt-0.5">
                  {analysis.profileSynthesis.archetypeTitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary & Interpretation */}
        <div className="space-y-2 pb-5 border-b border-[#DDD7B8]">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
              Profile Summary &amp; Interpretation
            </p>
            <span className="text-[10px] font-mono text-[#4A5D55] tabular-nums">
              Issued {issueDate}
            </span>
          </div>
          <p className="font-serif text-[15px] leading-relaxed text-[#142B22]">
            {analysis.profileSynthesis.shortSummary}
          </p>
          <p className="text-xs leading-relaxed text-[#2A4238]">
            {analysis.profileSynthesis.interpretation}
          </p>
        </div>

        {/* Dual Score Strip: RIASEC + Big 5 */}
        <div className="grid grid-cols-2 gap-5 pb-5 border-b border-[#DDD7B8]">
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
              RIASEC Scores
            </p>
            <div className="space-y-1.5">
              {riasecBars.map((bar) => {
                const isTop = analysis.riasec.extractedCode.toUpperCase().includes(bar.code);
                return (
                  <div key={bar.code} className="flex items-center gap-2 text-[11px]">
                    <span
                      className={`w-3.5 font-mono font-semibold ${
                        isTop ? 'text-[#186049]' : 'text-[#6E7F77]'
                      }`}
                    >
                      {bar.code}
                    </span>
                    <div className="flex-1 h-1.5 bg-[#ECE8AF]/65 rounded-sm">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.max(0, Math.min(100, bar.val))}%`,
                          backgroundColor: isTop ? '#4A943E' : '#8CA096',
                        }}
                      />
                    </div>
                    <span className="w-6 text-right font-mono tabular-nums text-[#142B22]">
                      {Math.round(bar.val)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#9E5911] font-semibold">
              Big 5 (OCEAN)
            </p>
            <div className="space-y-1.5">
              {analysis.bigFive.traitHighlights.map((item) => (
                <div key={item.trait} className="flex items-center gap-2 text-[11px]">
                  <span className="w-16 truncate text-[#142B22]" title={item.trait}>
                    {item.trait.split(' ')[0]}
                  </span>
                  <div className="flex-1 h-1.5 bg-[#ECE8AF]/65 rounded-sm">
                    <div
                      className="h-full bg-[#D98327] rounded-sm"
                      style={{ width: `${Math.max(0, Math.min(100, item.score))}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono tabular-nums text-[#142B22]">
                    {Math.round(item.score)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ranked Top 3 Career Choices */}
        <div className="space-y-2 pb-4 border-b border-[#DDD7B8]">
          <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
            Top Three Career Choices
          </p>
          <div className="divide-y divide-[#E2DDC3] border-t border-b border-[#E2DDC3] bg-white px-3">
            {analysis.careerAlignment.map((choice) => (
              <div
                key={choice.choiceRank}
                className="py-2.5 flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#142B22]">
                    <span className="font-mono text-[#4A5D55] mr-1.5 tabular-nums">
                      0{choice.choiceRank}
                    </span>
                    {choice.careerTitle}
                  </p>
                  <p className="text-[11px] text-[#4A5D55] leading-snug mt-0.5">
                    {choice.synergyAnalysis}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider font-semibold whitespace-nowrap shrink-0 mt-0.5 ${
                    choice.fitRating === 'Strong Fit'
                      ? 'text-[#186049]'
                      : choice.fitRating === 'Aligned'
                      ? 'text-[#2F6E26]'
                      : 'text-[#9E5911]'
                  }`}
                >
                  {choice.fitRating}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Credential Specimen Footer */}
        <footer className="flex items-center justify-between gap-4 pt-1">
          <div className="min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-wider text-[#4A5D55]">
              Key Strengths
            </p>
            <p className="text-[11px] font-medium text-[#142B22] truncate">
              {analysis.profileSynthesis.keyStrengths.join(' · ')}
            </p>
          </div>

          <div className="flex items-end gap-[2px] h-7 shrink-0" aria-hidden="true">
            {barcodeWidths.map((w, idx) => (
              <span
                key={idx}
                className="bg-[#186049] block h-full"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}
