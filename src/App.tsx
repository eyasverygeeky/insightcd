import React, { useRef, useState } from 'react';
import { Download, Printer, FileText, IdCard, Loader2 } from 'lucide-react';
import type {
  BigFiveScores,
  CareerProfileAnalysis,
  PosterFormat,
  RiasecScores,
  UploadedAssessmentImage,
} from './types/profile';
import { TopBar } from './components/TopBar';
import { IntakeDeck } from './components/IntakeDeck';
import { PosterDossier } from './components/PosterDossier';
import { PosterCredentialId } from './components/PosterCredentialId';
import { ScoreVerificationDrawer } from './components/ScoreVerificationDrawer';
import { FrameworkGuide } from './components/FrameworkGuide';
import { createSampleBigFiveImage, createSampleRiasecImage } from './utils/sampleCharts';
import { exportPosterToPng } from './utils/exportPoster';

function computeHollandCode(scores: RiasecScores): string {
  const entries: Array<[string, number]> = [
    ['R', scores.realistic],
    ['I', scores.investigative],
    ['A', scores.artistic],
    ['S', scores.social],
    ['E', scores.enterprising],
    ['C', scores.conventional],
  ];
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((item) => item[0])
    .join('');
}

function deriveLevel(score: number): 'High' | 'Moderate' | 'Low' {
  if (score >= 65) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

export default function App() {
  const posterRef = useRef<HTMLDivElement>(null);

  const [learnerName, setLearnerName] = useState('');
  const [learnerTrack, setLearnerTrack] = useState('');
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [riasecImage, setRiasecImage] = useState<UploadedAssessmentImage | null>(null);
  const [bigFiveImage, setBigFiveImage] = useState<UploadedAssessmentImage | null>(null);
  const [careerChoices, setCareerChoices] = useState<[string, string, string]>(['', '', '']);

  const [posterFormat, setPosterFormat] = useState<PosterFormat>('dossier');
  const [analysis, setAnalysis] = useState<CareerProfileAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCareerChoiceChange = (index: 0 | 1 | 2, val: string) => {
    setCareerChoices((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = val;
      return next;
    });
  };

  const handleLoadSamples = () => {
    try {
      setErrorMessage(null);
      setLearnerName('Maya Elena Santos');
      setLearnerTrack('Grade 12 STEM · Class of 2026');
      setRiasecImage(createSampleRiasecImage());
      setBigFiveImage(createSampleBigFiveImage());
      setCareerChoices([
        'UX Researcher',
        'Environmental Data Analyst',
        'Science Curriculum Designer',
      ]);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to generate sample chart images.'
      );
    }
  };

  const handleReset = () => {
    setLearnerName('');
    setLearnerTrack('');
    setPortraitUrl(null);
    setRiasecImage(null);
    setBigFiveImage(null);
    setCareerChoices(['', '', '']);
    setAnalysis(null);
    setErrorMessage(null);
  };

  const handleAnalyzeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riasecImage || !bigFiveImage) {
      setErrorMessage('Please upload both your RIASEC and Big 5 test result images.');
      return;
    }
    if (careerChoices.some((c) => c.trim().length === 0)) {
      setErrorMessage('Please enter all three career choices.');
      return;
    }

    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learnerName,
          learnerTrack,
          riasecImage: {
            mimeType: riasecImage.mimeType,
            data: riasecImage.base64Data,
          },
          bigFiveImage: {
            mimeType: bigFiveImage.mimeType,
            data: bigFiveImage.base64Data,
          },
          careerChoices,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to interpret assessment images.');
      }

      setAnalysis(payload as CareerProfileAnalysis);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to analyze profile. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateRiasecScore = (key: keyof RiasecScores, val: number) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const nextScores: RiasecScores = { ...prev.riasec.scores, [key]: val };
      return {
        ...prev,
        riasec: {
          ...prev.riasec,
          scores: nextScores,
          extractedCode: computeHollandCode(nextScores),
        },
      };
    });
  };

  const handleUpdateBigFiveScore = (key: keyof BigFiveScores, val: number) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const nextScores: BigFiveScores = { ...prev.bigFive.scores, [key]: val };
      const keyLabelMap: Record<keyof BigFiveScores, string> = {
        openness: 'openness',
        conscientiousness: 'conscientiousness',
        extraversion: 'extraversion',
        agreeableness: 'agreeableness',
        neuroticism: prev.bigFive.neuroticismLabel.toLowerCase(),
      };
      const targetMatch = keyLabelMap[key];
      const nextHighlights = prev.bigFive.traitHighlights.map((item) => {
        const lower = item.trait.toLowerCase();
        const matches =
          lower.includes(targetMatch) ||
          (key === 'neuroticism' &&
            (lower.includes('neuroticism') || lower.includes('emotional stability')));
        if (!matches) return item;
        return {
          ...item,
          score: val,
          level: deriveLevel(val),
        };
      });

      return {
        ...prev,
        bigFive: {
          ...prev.bigFive,
          scores: nextScores,
          traitHighlights: nextHighlights,
        },
      };
    });
  };

  const handleExportPng = async () => {
    if (!posterRef.current || !analysis) return;
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const dataUrl = await exportPosterToPng(
        posterRef.current,
        posterFormat === 'dossier' ? '#FAF9F2' : '#FFFFFF'
      );
      const safeName = (learnerName.trim() || 'student-profile')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      const link = document.createElement('a');
      link.download = `${safeName}-${posterFormat}-${analysis.riasec.extractedCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Unable to export PNG image. Try Print / Save PDF.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPoster = () => {
    window.print();
  };

  const scrollToInput = () => {
    document.getElementById('intake-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div id="top" className="min-h-screen flex flex-col bg-[#FAF9F2] text-[#142B22]">
      <TopBar
        hasAnalysis={Boolean(analysis)}
        onExportPng={() => void handleExportPng()}
        onScrollToInput={scrollToInput}
        isExporting={isExporting}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-10 pt-8 pb-12">
        {/* Student-Friendly Campus Hero Strip */}
        <section className="no-print mb-8 pb-7 border-b border-[#D8D3B8] flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
              Student Career Guidance &amp; Portfolio Studio
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#142B22] tracking-tight mt-1.5 text-balance">
              Your test results, opened as a dossier.
            </h1>
            <p className="text-sm sm:text-base text-[#4A5D55] leading-relaxed mt-2.5">
              Upload screenshots of your RIASEC and Big 5 quiz results, type in your top three
              career ideas, and get a student-friendly summary and printable Dossier or ID poster.
            </p>
          </div>

          <div className="flex items-center gap-5 bg-[#ECE8AF]/45 border border-[#D8D3B8] rounded-xl px-5 py-3 text-xs text-[#2A4238] shrink-0">
            <div>
              <p className="font-mono uppercase tracking-wider text-[#186049] font-semibold">Step 1</p>
              <p className="font-medium text-[#142B22] mt-0.5">RIASEC Image</p>
            </div>
            <span aria-hidden="true" className="text-[#9E5911] font-semibold">/</span>
            <div>
              <p className="font-mono uppercase tracking-wider text-[#186049] font-semibold">Step 2</p>
              <p className="font-medium text-[#142B22] mt-0.5">Big 5 Image</p>
            </div>
            <span aria-hidden="true" className="text-[#9E5911] font-semibold">/</span>
            <div>
              <p className="font-mono uppercase tracking-wider text-[#186049] font-semibold">Step 3</p>
              <p className="font-medium text-[#142B22] mt-0.5">Top 3 Careers</p>
            </div>
          </div>
        </section>

        {/* Two-Column Studio Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Intake Deck */}
          <div className="lg:col-span-5">
            <IntakeDeck
              learnerName={learnerName}
              onLearnerNameChange={setLearnerName}
              learnerTrack={learnerTrack}
              onLearnerTrackChange={setLearnerTrack}
              portraitUrl={portraitUrl}
              onPortraitChange={setPortraitUrl}
              riasecImage={riasecImage}
              onRiasecImageChange={setRiasecImage}
              bigFiveImage={bigFiveImage}
              onBigFiveImageChange={setBigFiveImage}
              careerChoices={careerChoices}
              onCareerChoiceChange={handleCareerChoiceChange}
              onSubmit={(e) => void handleAnalyzeSubmit(e)}
              onLoadSamples={handleLoadSamples}
              onReset={handleReset}
              isAnalyzing={isAnalyzing}
              errorMessage={errorMessage}
            />
          </div>

          {/* Right Column: Live Poster Studio */}
          <div id="poster-stage" className="lg:col-span-7 space-y-5">
            {/* Poster Toolbar */}
            <div className="no-print bg-white border border-[#D8D3B8] rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Poster format selector"
                className="flex items-center gap-1 p-1 bg-[#ECE8AF]/55 rounded-lg"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={posterFormat === 'dossier'}
                  onClick={() => setPosterFormat('dossier')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    posterFormat === 'dossier'
                      ? 'bg-[#186049] text-white shadow-sm'
                      : 'text-[#142B22] hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dossier Poster</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={posterFormat === 'id-card'}
                  onClick={() => setPosterFormat('id-card')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    posterFormat === 'id-card'
                      ? 'bg-[#186049] text-white shadow-sm'
                      : 'text-[#142B22] hover:bg-white/60'
                  }`}
                >
                  <IdCard className="w-3.5 h-3.5" />
                  <span>Student ID Poster</span>
                </button>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => void handleExportPng()}
                  disabled={!analysis || isExporting}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#4A943E] rounded-lg hover:bg-[#3B7C31] disabled:bg-[#B2B8B0] disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Saving...' : 'Download PNG'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintPoster}
                  disabled={!analysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#186049] bg-[#ECE8AF]/45 border border-[#D8D3B8] rounded-lg hover:bg-[#ECE8AF]/75 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Poster Canvas */}
            <div className="print-stage bg-[#ECE8AF]/40 border border-[#D8D3B8] rounded-2xl p-5 sm:p-8 min-h-[620px] flex flex-col justify-center">
              {isAnalyzing ? (
                <div className="max-w-md mx-auto text-center py-16 space-y-4">
                  <Loader2 className="w-8 h-8 text-[#186049] animate-spin mx-auto" />
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xl font-semibold text-[#142B22]">
                      Reading Your Quiz Results
                    </h3>
                    <p className="text-sm text-[#4A5D55] leading-relaxed">
                      Pulling your RIASEC interest scores and Big 5 traits from both images, then
                      matching them with your top three career choices.
                    </p>
                  </div>
                </div>
              ) : analysis ? (
                posterFormat === 'dossier' ? (
                  <PosterDossier
                    posterRef={posterRef}
                    analysis={analysis}
                    learnerName={learnerName}
                    learnerTrack={learnerTrack}
                    portraitUrl={portraitUrl}
                  />
                ) : (
                  <PosterCredentialId
                    posterRef={posterRef}
                    analysis={analysis}
                    learnerName={learnerName}
                    learnerTrack={learnerTrack}
                    portraitUrl={portraitUrl}
                  />
                )
              ) : (
                /* Student-Friendly Blueprint Preview State */
                <div className="w-full max-w-[680px] mx-auto bg-[#FAF9F2] border border-dashed border-[#4A943E]/55 rounded-xl p-7 sm:p-9 space-y-6">
                  <div className="border-b border-[#DDD7B8] pb-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
                    <span>
                      {posterFormat === 'dossier'
                        ? 'Dossier Poster Preview'
                        : 'Student ID Poster Preview'}
                    </span>
                    <span className="text-[#9E5911]">Ready for Your Results</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-semibold text-[#142B22]">
                      {learnerName.trim() || 'Your Personal Career Poster'}
                    </h3>
                    <p className="text-sm text-[#4A5D55] leading-relaxed">
                      Add your RIASEC and Big 5 result screenshots plus your top three career picks
                      on the left. Your summary and visual breakdown will appear right here as a{' '}
                      {posterFormat === 'dossier' ? 'Dossier Poster' : 'Student ID Poster'}.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-[#E2DDC3] pt-5 text-xs">
                    <div className="border-t-2 border-[#186049] pt-2.5 space-y-1">
                      <p className="font-mono uppercase tracking-wider text-[#186049] font-semibold">
                        01. Holland Code
                      </p>
                      <p className="text-[#4A5D55]">
                        Hexagon chart &amp; normalized 0–100 scores read from your RIASEC image.
                      </p>
                    </div>
                    <div className="border-t-2 border-[#D98327] pt-2.5 space-y-1">
                      <p className="font-mono uppercase tracking-wider text-[#9E5911] font-semibold">
                        02. Big 5 Traits
                      </p>
                      <p className="text-[#4A5D55]">
                        OCEAN personality bars &amp; plain-English study/work takeaways.
                      </p>
                    </div>
                    <div className="border-t-2 border-[#4A943E] pt-2.5 space-y-1">
                      <p className="font-mono uppercase tracking-wider text-[#2F6E26] font-semibold">
                        03. Career Match
                      </p>
                      <p className="text-[#4A5D55]">
                        Fit check, strengths, and next-step tips for your 3 career ideas.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E2DDC3]">
                    <p className="text-xs text-[#4A5D55]">
                      Don&apos;t have screenshots handy right now?
                    </p>
                    <button
                      type="button"
                      onClick={handleLoadSamples}
                      className="text-xs font-semibold text-[#186049] hover:text-[#4A943E] hover:underline underline-offset-4 cursor-pointer"
                    >
                      Try with Sample Student Charts
                    </button>
                  </div>
                </div>
              )}
            </div>

            {analysis && (
              <ScoreVerificationDrawer
                analysis={analysis}
                riasecImage={riasecImage}
                bigFiveImage={bigFiveImage}
                onUpdateRiasecScore={handleUpdateRiasecScore}
                onUpdateBigFiveScore={handleUpdateBigFiveScore}
              />
            )}
          </div>
        </div>
      </main>

      <FrameworkGuide />

      <footer className="no-print border-t border-[#D8D3B8] bg-[#FAF9F2] py-6">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#4A5D55]">
          <span className="font-medium text-[#186049]">Career Dossier Studio</span>
          <span>RIASEC · Big Five (OCEAN) · Student Career Guidance</span>
        </div>
      </footer>
    </div>
  );
}
