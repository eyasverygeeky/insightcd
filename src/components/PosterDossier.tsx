import React from 'react';
import type { CareerProfileAnalysis } from '../types/profile';
import { RiasecHexagonChart } from './RiasecHexagonChart';

interface PosterDossierProps {
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

export function PosterDossier({
  posterRef,
  analysis,
  learnerName,
  learnerTrack,
  portraitUrl,
}: PosterDossierProps) {
  const displayName = learnerName.trim() || 'Student Profile';
  const displayTrack = learnerTrack.trim() || 'Student Career Exploration';
  const issueDate = formatIssueDate(analysis.generatedAt);

  const riasecRows = [
    { code: 'R', label: 'Realistic', score: analysis.riasec.scores.realistic },
    { code: 'I', label: 'Investigative', score: analysis.riasec.scores.investigative },
    { code: 'A', label: 'Artistic', score: analysis.riasec.scores.artistic },
    { code: 'S', label: 'Social', score: analysis.riasec.scores.social },
    { code: 'E', label: 'Enterprising', score: analysis.riasec.scores.enterprising },
    { code: 'C', label: 'Conventional', score: analysis.riasec.scores.conventional },
  ];

  return (
    <article
      ref={posterRef}
      className="print-poster w-full max-w-[820px] mx-auto bg-[#FAF9F2] text-[#142B22] border border-[#C9C3A3] shadow-[0_14px_40px_-18px_rgba(24,96,73,0.18)] overflow-hidden"
    >
      {/* Campus Evergreen Top Trim */}
      <div className="bg-[#186049] text-white px-7 sm:px-10 py-3.5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.14em]">
        <span>Student Career Interest &amp; Personality Dossier</span>
        <span className="tabular-nums text-[#ECE8AF]">
          {analysis.dossierId} · {issueDate}
        </span>
      </div>

      <div className="p-7 sm:p-10">
        {/* Subject Identification Banner */}
        <div className="pb-6 border-b border-[#DDD7B8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5 min-w-0">
            <div className="w-[74px] h-[90px] rounded-lg border border-[#C9C3A3] bg-[#ECE8AF]/55 shrink-0 overflow-hidden flex flex-col items-center justify-center">
              {portraitUrl ? (
                <img
                  src={portraitUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <span className="font-serif text-2xl font-semibold text-[#186049] tracking-tight">
                    {getInitials(displayName)}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#4A5D55] mt-1">
                    {analysis.riasec.extractedCode}
                  </span>
                </>
              )}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-[#4A5D55] tracking-wide">
                {displayTrack}
              </p>
              <h3 className="font-serif text-2xl sm:text-[30px] font-semibold text-[#142B22] leading-tight mt-0.5 text-balance">
                {displayName}
              </h3>
              <p className="text-sm font-semibold text-[#186049] mt-1">
                {analysis.profileSynthesis.archetypeTitle}
              </p>
            </div>
          </div>

          {/* Holland Code Stamp */}
          <div className="border border-[#186049]/35 bg-[#ECE8AF]/45 rounded-lg px-4 py-3 shrink-0 self-start sm:self-center">
            <p className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#4A5D55]">
              Holland Code
            </p>
            <p className="font-mono text-2xl font-semibold tracking-[0.2em] text-[#186049] mt-0.5 tabular-nums">
              {analysis.riasec.extractedCode}
            </p>
          </div>
        </div>

        {/* Section 01: Executive Summary & Interpretation */}
        <section className="py-6 border-b border-[#DDD7B8] space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
              01. Profile Summary &amp; Interpretation
            </h4>
            <span className="text-xs font-medium text-[#9E5911]">
              {analysis.profileSynthesis.keyStrengths.join(' · ')}
            </span>
          </div>

          <p className="font-serif text-lg leading-relaxed text-[#142B22]">
            {analysis.profileSynthesis.shortSummary}
          </p>

          <p className="text-sm leading-relaxed text-[#2A4238]">
            {analysis.profileSynthesis.interpretation}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div className="bg-[#ECE8AF]/35 border-t-2 border-[#4A943E] p-3.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#186049] font-semibold">
                Best-Fit Learning &amp; Work Setting
              </p>
              <p className="text-xs leading-relaxed text-[#2A4238] mt-1">
                {analysis.profileSynthesis.workEnvironmentIdeal}
              </p>
            </div>
            <div className="bg-[#ECE8AF]/35 border-t-2 border-[#D98327] p-3.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-[#9E5911] font-semibold">
                Next Exploration Step
              </p>
              <p className="text-xs leading-relaxed text-[#2A4238] mt-1">
                {analysis.profileSynthesis.recommendedNextStep}
              </p>
            </div>
          </div>
        </section>

        {/* Section 02: Psychometric Matrix (RIASEC + Big 5) */}
        <section className="py-6 border-b border-[#DDD7B8] grid grid-cols-1 md:grid-cols-12 gap-7">
          {/* RIASEC Column */}
          <div className="md:col-span-6 space-y-4 md:border-r md:border-[#E5DFC5] md:pr-6">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
                02A. RIASEC Interest Profile
              </h4>
              <span className="text-[11px] font-mono text-[#4A5D55] tabular-nums">
                Scale 0–100
              </span>
            </div>

            <div className="bg-white border border-[#E2DDC3] rounded-lg py-3 px-2">
              <RiasecHexagonChart scores={analysis.riasec.scores} size={204} accentColor="#186049" />
            </div>

            <div className="space-y-1.5">
              {riasecRows.map((item) => {
                const isTop = analysis.riasec.extractedCode.toUpperCase().includes(item.code);
                return (
                  <div key={item.code} className="flex items-center gap-2.5 text-xs">
                    <span
                      className={`w-4 font-mono font-semibold ${
                        isTop ? 'text-[#186049]' : 'text-[#6E7F77]'
                      }`}
                    >
                      {item.code}
                    </span>
                    <span className="w-24 text-[#142B22] shrink-0">{item.label}</span>
                    <div className="flex-1 h-2 bg-[#ECE8AF]/55 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${Math.max(0, Math.min(100, item.score))}%`,
                          backgroundColor: isTop ? '#4A943E' : '#8CA096',
                        }}
                      />
                    </div>
                    <span className="w-8 text-right font-mono tabular-nums text-[#142B22]">
                      {Math.round(item.score)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Big 5 Column */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#9E5911] font-semibold">
                02B. Big Five Personality (OCEAN)
              </h4>
              <span className="text-[11px] font-mono text-[#4A5D55] tabular-nums">
                {analysis.bigFive.rawUnit}
              </span>
            </div>

            <div className="space-y-3.5">
              {analysis.bigFive.traitHighlights.map((item) => {
                const clamped = Math.max(0, Math.min(100, item.score));
                return (
                  <div key={item.trait} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold text-[#142B22]">{item.trait}</span>
                      <span className="font-mono text-[#4A5D55] tabular-nums">
                        {Math.round(clamped)} · {item.level}
                      </span>
                    </div>
                    <div className="h-2 bg-[#ECE8AF]/55 rounded-sm overflow-hidden">
                      <div
                        className="h-full bg-[#D98327] rounded-sm"
                        style={{ width: `${clamped}%` }}
                      />
                    </div>
                    <p className="text-[11px] leading-snug text-[#4A5D55]">
                      {item.interpretation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 03: Top Three Career Choices Alignment */}
        <section className="py-6 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h4 className="text-xs font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
              03. Top Three Career Choices Check-In
            </h4>
            <span className="text-xs text-[#4A5D55]">Matched against RIASEC &amp; Big 5 traits</span>
          </div>

          <div className="divide-y divide-[#E2DDC3] border-t border-b border-[#E2DDC3]">
            {analysis.careerAlignment.map((choice) => (
              <div key={choice.choiceRank} className="py-3.5 grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-xs font-semibold text-[#4A5D55] tabular-nums">
                      0{choice.choiceRank}
                    </span>
                    <h5 className="font-serif text-base font-semibold text-[#142B22]">
                      {choice.careerTitle}
                    </h5>
                  </div>
                  <p
                    className={`text-[11px] font-mono uppercase tracking-wider mt-1 font-semibold ${
                      choice.fitRating === 'Strong Fit'
                        ? 'text-[#186049]'
                        : choice.fitRating === 'Aligned'
                        ? 'text-[#2F6E26]'
                        : 'text-[#9E5911]'
                    }`}
                  >
                    {choice.fitRating}
                  </p>
                </div>

                <div className="sm:col-span-8 space-y-1">
                  <p className="text-xs leading-relaxed text-[#2A4238]">
                    {choice.synergyAnalysis}
                  </p>
                  <p className="text-[11px] text-[#4A5D55]">
                    <span className="font-semibold text-[#142B22]">Skill to build:</span>{' '}
                    {choice.growthEdge}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer Seal & Citation */}
        <footer className="pt-4 border-t border-[#186049]/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg
              width="34"
              height="34"
              viewBox="0 0 36 36"
              aria-hidden="true"
              className="text-[#186049] shrink-0"
            >
              <circle cx="18" cy="18" r="16" fill="#ECE8AF" fillOpacity="0.45" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="18" cy="18" r="12.5" fill="none" stroke="#4A943E" strokeWidth="0.9" strokeDasharray="2 2" />
              <polygon points="18,7 27.5,12.5 27.5,23.5 18,29 8.5,23.5 8.5,12.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
              <circle cx="18" cy="18" r="2.2" fill="#D98327" />
            </svg>
            <div>
              <p className="text-[11px] font-semibold text-[#142B22]">
                Career Dossier Studio · Student Guidance Record
              </p>
              <p className="text-[10px] text-[#4A5D55]">
                RIASEC Interest Inventory · Big Five Personality Profile · Student Career Choices
              </p>
            </div>
          </div>

          <p className="text-[10px] font-mono uppercase tracking-widest text-[#4A5D55] tabular-nums">
            REF {analysis.dossierId}
          </p>
        </footer>
      </div>
    </article>
  );
}
