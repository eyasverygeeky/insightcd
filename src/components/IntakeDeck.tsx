import React, { useRef, useState } from 'react';
import { Upload, X, FileImage, User, ArrowRight, RotateCcw } from 'lucide-react';
import type { UploadedAssessmentImage } from '../types/profile';

interface IntakeDeckProps {
  learnerName: string;
  onLearnerNameChange: (val: string) => void;
  learnerTrack: string;
  onLearnerTrackChange: (val: string) => void;
  portraitUrl: string | null;
  onPortraitChange: (url: string | null) => void;
  riasecImage: UploadedAssessmentImage | null;
  onRiasecImageChange: (img: UploadedAssessmentImage | null) => void;
  bigFiveImage: UploadedAssessmentImage | null;
  onBigFiveImageChange: (img: UploadedAssessmentImage | null) => void;
  careerChoices: [string, string, string];
  onCareerChoiceChange: (index: 0 | 1 | 2, val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onLoadSamples: () => void;
  onReset: () => void;
  isAnalyzing: boolean;
  errorMessage: string | null;
}

async function readImageFile(file: File): Promise<UploadedAssessmentImage> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose a PNG, JPG, or WebP image file.');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Image file must be under 12 MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const base64Data = result.split(',')[1] ?? '';
      if (!base64Data) {
        reject(new Error('Could not read image contents.'));
        return;
      }
      resolve({
        name: file.name,
        mimeType: file.type,
        base64Data,
        previewUrl: result,
        sizeLabel: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read the selected file.'));
    reader.readAsDataURL(file);
  });
}

interface ImageDropzoneProps {
  id: string;
  label: string;
  helper: string;
  image: UploadedAssessmentImage | null;
  onChange: (img: UploadedAssessmentImage | null) => void;
  onError: (msg: string) => void;
}

function ImageDropzone({ id, label, helper, image, onChange, onError }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = await readImageFile(file);
      onChange(parsed);
    } catch (err: unknown) {
      onError(err instanceof Error ? err.message : 'Unable to read image.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-semibold text-[#142B22]">
          {label}
        </label>
        <span className="text-xs text-[#4A5D55] tabular-nums">
          {image ? `${image.sizeLabel} · Ready` : 'PNG, JPG, WebP'}
        </span>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {image ? (
        <div className="border border-[#4A943E]/45 bg-white rounded-xl p-3 flex items-center gap-3.5">
          <div className="w-20 h-14 rounded-lg border border-[#ECE8AF] bg-[#FAF9F2] overflow-hidden shrink-0">
            <img
              src={image.previewUrl}
              alt={`${label} preview`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#142B22] truncate">{image.name}</p>
            <p className="text-xs text-[#4A5D55] mt-0.5">{helper}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1.5 text-xs font-medium text-[#186049] hover:bg-[#ECE8AF]/50 rounded-md transition-colors cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label={`Remove ${label}`}
              className="p-1.5 text-[#4A5D55] hover:text-[#9E5911] rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`border border-dashed rounded-xl p-4 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#186049] ${
            isDragging
              ? 'border-[#186049] bg-[#ECE8AF]/40'
              : 'border-[#B9B393] bg-white hover:border-[#4A943E] hover:bg-[#ECE8AF]/15'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#ECE8AF]/55 border border-[#DDD7A3] flex items-center justify-center shrink-0 text-[#186049]">
              <FileImage className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#142B22]">
                Drop screenshot or browse image
              </p>
              <p className="text-xs text-[#4A5D55] mt-0.5">{helper}</p>
            </div>
            <Upload className="w-4 h-4 text-[#186049] shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}

export function IntakeDeck({
  learnerName,
  onLearnerNameChange,
  learnerTrack,
  onLearnerTrackChange,
  portraitUrl,
  onPortraitChange,
  riasecImage,
  onRiasecImageChange,
  bigFiveImage,
  onBigFiveImageChange,
  careerChoices,
  onCareerChoiceChange,
  onSubmit,
  onLoadSamples,
  onReset,
  isAnalyzing,
  errorMessage,
}: IntakeDeckProps) {
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handlePortraitFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = await readImageFile(file);
      onPortraitChange(parsed.previewUrl);
      setLocalError(null);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Unable to load portrait image.');
    }
  };

  const displayError = localError || errorMessage;
  const canSubmit =
    Boolean(riasecImage) &&
    Boolean(bigFiveImage) &&
    careerChoices.every((c) => c.trim().length > 0) &&
    !isAnalyzing;

  return (
    <section
      id="intake-section"
      className="no-print bg-white border border-[#D8D3B8] rounded-2xl p-6 lg:p-7 space-y-6 shadow-[0_8px_24px_-16px_rgba(24,96,73,0.12)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#EAE5CB] pb-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#9E5911]">
            Step 1 of 2 · Student Intake
          </p>
          <h2 className="font-serif text-xl font-semibold text-[#142B22] mt-0.5">
            Share Your Quiz Results
          </h2>
        </div>

        <button
          type="button"
          onClick={onLoadSamples}
          disabled={isAnalyzing}
          className="text-xs font-semibold text-[#186049] hover:text-[#4A943E] hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
        >
          Try Sample Charts
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-3.5">
          <p className="text-xs font-semibold tracking-wide text-[#4A5D55]">
            Student Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="learner-name" className="block text-xs font-medium text-[#2A4238] mb-1">
                Your Name
              </label>
              <input
                id="learner-name"
                type="text"
                value={learnerName}
                onChange={(e) => onLearnerNameChange(e.target.value)}
                placeholder="e.g., Maya Elena Santos"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F2] border border-[#D8D3B8] rounded-lg text-[#142B22] placeholder:text-[#8E9B94] focus:outline-none focus:border-[#186049] focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="learner-track" className="block text-xs font-medium text-[#2A4238] mb-1">
                Grade Level or Major
              </label>
              <input
                id="learner-track"
                type="text"
                value={learnerTrack}
                onChange={(e) => onLearnerTrackChange(e.target.value)}
                placeholder="e.g., Grade 12 STEM · Class of 2026"
                className="w-full px-3 py-2 text-sm bg-[#FAF9F2] border border-[#D8D3B8] rounded-lg text-[#142B22] placeholder:text-[#8E9B94] focus:outline-none focus:border-[#186049] focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg border border-[#D8D3B8] bg-[#ECE8AF]/35 overflow-hidden flex items-center justify-center shrink-0">
                {portraitUrl ? (
                  <img
                    src={portraitUrl}
                    alt="Student portrait"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-[#186049]" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#142B22]">Student ID Photo (Optional)</p>
                <p className="text-xs text-[#4A5D55] truncate">
                  {portraitUrl ? 'Photo added to your poster' : 'Uses your initials crest by default'}
                </p>
              </div>
            </div>

            <input
              ref={portraitInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                void handlePortraitFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => portraitInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-[#186049] bg-[#ECE8AF]/40 border border-[#D8D3B8] rounded-lg hover:bg-[#ECE8AF]/70 transition-colors cursor-pointer"
              >
                {portraitUrl ? 'Change' : 'Add Photo'}
              </button>
              {portraitUrl && (
                <button
                  type="button"
                  onClick={() => onPortraitChange(null)}
                  className="px-2 py-1.5 text-xs font-medium text-[#4A5D55] hover:text-[#9E5911] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-[#EAE5CB] pt-5 space-y-4">
          <p className="text-xs font-semibold tracking-wide text-[#4A5D55]">
            Upload Quiz Result Images
          </p>

          <ImageDropzone
            id="riasec-upload"
            label="1. RIASEC Career Interest Result"
            helper="Screenshot of your Holland Code bars, chart, or scores"
            image={riasecImage}
            onChange={(img) => {
              setLocalError(null);
              onRiasecImageChange(img);
            }}
            onError={setLocalError}
          />

          <ImageDropzone
            id="big5-upload"
            label="2. Big 5 Personality Result"
            helper="Screenshot of your OCEAN trait bars or percentiles"
            image={bigFiveImage}
            onChange={(img) => {
              setLocalError(null);
              onBigFiveImageChange(img);
            }}
            onError={setLocalError}
          />
        </div>

        <div className="border-t border-[#EAE5CB] pt-5 space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-[#4A5D55]">
              Your Top 3 Career Choices
            </p>
            <span className="text-xs text-[#4A5D55]">Type your top picks</span>
          </div>

          {([0, 1, 2] as const).map((idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              <span className="w-7 h-9 flex items-center justify-center rounded-md bg-[#ECE8AF]/50 font-mono text-xs font-semibold text-[#186049] tabular-nums shrink-0">
                #{idx + 1}
              </span>
              <input
                type="text"
                required
                aria-label={`Career Choice ${idx + 1}`}
                value={careerChoices[idx]}
                onChange={(e) => onCareerChoiceChange(idx, e.target.value)}
                placeholder={
                  idx === 0
                    ? '1st choice (e.g., UX Researcher)'
                    : idx === 1
                    ? '2nd choice (e.g., Environmental Data Analyst)'
                    : '3rd choice (e.g., Science Curriculum Designer)'
                }
                className="flex-1 px-3 py-2 text-sm bg-[#FAF9F2] border border-[#D8D3B8] rounded-lg text-[#142B22] placeholder:text-[#8E9B94] focus:outline-none focus:border-[#186049] focus:bg-white"
              />
            </div>
          ))}
        </div>

        {displayError && (
          <div
            role="alert"
            className="border border-[#D98327]/50 bg-[#FDF3E7] text-[#8B4A09] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed"
          >
            {displayError}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#186049] rounded-lg hover:bg-[#134D3A] disabled:bg-[#B2B8B0] disabled:cursor-not-allowed transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#186049]"
          >
            <span>{isAnalyzing ? 'Reading Your Results...' : 'Build My Career Dossier'}</span>
            {!isAnalyzing && <ArrowRight className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isAnalyzing}
            title="Clear all inputs"
            aria-label="Reset form"
            className="px-3 py-2.5 text-xs font-medium text-[#4A5D55] bg-[#FAF9F2] border border-[#D8D3B8] rounded-lg hover:bg-[#ECE8AF]/40 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </form>
    </section>
  );
}
