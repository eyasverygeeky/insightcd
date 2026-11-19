import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type {
  BigFiveScores,
  CareerProfileAnalysis,
  RiasecScores,
  UploadedAssessmentImage,
} from '../types/profile';

interface ScoreVerificationDrawerProps {
  analysis: CareerProfileAnalysis;
  riasecImage: UploadedAssessmentImage | null;
  bigFiveImage: UploadedAssessmentImage | null;
  onUpdateRiasecScore: (key: keyof RiasecScores, val: number) => void;
  onUpdateBigFiveScore: (key: keyof BigFiveScores, val: number) => void;
}

const RIASEC_KEYS: Array<{ key: keyof RiasecScores; label: string }> = [
  { key: 'realistic', label: 'Realistic (R)' },
  { key: 'investigative', label: 'Investigative (I)' },
  { key: 'artistic', label: 'Artistic (A)' },
  { key: 'social', label: 'Social (S)' },
  { key: 'enterprising', label: 'Enterprising (E)' },
  { key: 'conventional', label: 'Conventional (C)' },
];

export function ScoreVerificationDrawer({
  analysis,
  riasecImage,
  bigFiveImage,
  onUpdateRiasecScore,
  onUpdateBigFiveScore,
}: ScoreVerificationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const bigFiveKeys: Array<{ key: keyof BigFiveScores; label: string }> = [
    { key: 'openness', label: 'Openness' },
    { key: 'conscientiousness', label: 'Conscientiousness' },
    { key: 'extraversion', label: 'Extraversion' },
    { key: 'agreeableness', label: 'Agreeableness' },
    { key: 'neuroticism', label: analysis.bigFive.neuroticismLabel },
  ];

  return (
    <div className="no-print border border-[#D8D3B8] bg-white rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-[#ECE8AF]/25 transition-colors cursor-pointer"
      >
        <div>
          <p className="text-sm font-semibold text-[#142B22]">
            Check &amp; Adjust Read Scores
          </p>
          <p className="text-xs text-[#4A5D55] mt-0.5">
            Compare your uploaded screenshots with the 0–100 numbers shown on your poster
          </p>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#186049] shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#186049] shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 pt-4 border-t border-[#EAE5CB] grid grid-cols-1 lg:grid-cols-2 gap-6 bg-[#FAF9F2]">
          {/* RIASEC Verification */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#186049] font-semibold">
                RIASEC Image Reading
              </p>
              <p className="text-xs text-[#2A4238] mt-1 leading-relaxed">
                {analysis.riasec.visualSummary}
              </p>
            </div>

            {riasecImage && (
              <div className="border border-[#D8D3B8] bg-white rounded-lg p-2">
                <img
                  src={riasecImage.previewUrl}
                  alt="Uploaded RIASEC result"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-48 object-contain"
                />
              </div>
            )}

            <div className="space-y-2.5">
              {RIASEC_KEYS.map(({ key, label }) => {
                const value = Math.round(analysis.riasec.scores[key]);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={`verify-riasec-${key}`} className="text-[#142B22] font-medium">
                        {label}
                      </label>
                      <span className="font-mono tabular-nums text-[#186049] font-semibold">
                        {value} / 100
                      </span>
                    </div>
                    <input
                      id={`verify-riasec-${key}`}
                      type="range"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => onUpdateRiasecScore(key, Number(e.target.value))}
                      className="w-full accent-[#4A943E] cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Big 5 Verification */}
          <div className="space-y-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#9E5911] font-semibold">
                Big Five Image Reading
              </p>
              <p className="text-xs text-[#2A4238] mt-1 leading-relaxed">
                {analysis.bigFive.visualSummary}
              </p>
            </div>

            {bigFiveImage && (
              <div className="border border-[#D8D3B8] bg-white rounded-lg p-2">
                <img
                  src={bigFiveImage.previewUrl}
                  alt="Uploaded Big 5 personality result"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-48 object-contain"
                />
              </div>
            )}

            <div className="space-y-2.5">
              {bigFiveKeys.map(({ key, label }) => {
                const value = Math.round(analysis.bigFive.scores[key]);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <label htmlFor={`verify-big5-${key}`} className="text-[#142B22] font-medium">
                        {label}
                      </label>
                      <span className="font-mono tabular-nums text-[#9E5911] font-semibold">
                        {value} / 100
                      </span>
                    </div>
                    <input
                      id={`verify-big5-${key}`}
                      type="range"
                      min={0}
                      max={100}
                      value={value}
                      onChange={(e) => onUpdateBigFiveScore(key, Number(e.target.value))}
                      className="w-full accent-[#D98327] cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
