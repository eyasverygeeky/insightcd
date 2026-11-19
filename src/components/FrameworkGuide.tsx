export function FrameworkGuide() {
  return (
    <section
      id="framework-guide"
      className="no-print border-t border-[#D8D3B8] bg-[#ECE8AF]/35 py-14 mt-16"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-mono uppercase tracking-[0.14em] text-[#186049] font-semibold">
            Student Guidance Guide
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#142B22] mt-1.5 text-balance">
            How Your Interests, Personality, and Career Ideas Fit Together
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#D8D3B8] rounded-xl p-6 space-y-2">
            <p className="font-mono text-xs text-[#186049] font-semibold">01. RIASEC Holland Code</p>
            <h3 className="font-serif text-lg font-semibold text-[#142B22]">
              What Excites &amp; Motivates You
            </h3>
            <p className="text-sm text-[#4A5D55] leading-relaxed">
              Looks at your interest across Realistic, Investigative, Artistic, Social,
              Enterprising, and Conventional activities to spot your top three strengths.
            </p>
          </div>

          <div className="bg-white border border-[#D8D3B8] rounded-xl p-6 space-y-2">
            <p className="font-mono text-xs text-[#9E5911] font-semibold">02. Big Five (OCEAN)</p>
            <h3 className="font-serif text-lg font-semibold text-[#142B22]">
              How You Study &amp; Collaborate
            </h3>
            <p className="text-sm text-[#4A5D55] leading-relaxed">
              Reads your Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional
              Stability scores to show how you tackle projects and work with classmates or teams.
            </p>
          </div>

          <div className="bg-white border border-[#D8D3B8] rounded-xl p-6 space-y-2">
            <p className="font-mono text-xs text-[#2F6E26] font-semibold">03. Top 3 Career Choices</p>
            <h3 className="font-serif text-lg font-semibold text-[#142B22]">
              Testing Your Future Paths
            </h3>
            <p className="text-sm text-[#4A5D55] leading-relaxed">
              Connects your top three career choices with both quiz profiles so you can see where
              your interests already shine and which skills to grow next in school.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
