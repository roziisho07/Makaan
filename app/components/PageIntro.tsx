interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/60 p-6 sm:p-10 hero-backdrop text-white overflow-hidden relative">
          <div
            className="absolute inset-0 subtle-grid opacity-25"
            aria-hidden="true"
          />
          <div className="relative max-w-3xl">
            <p className="uppercase tracking-[0.18em] text-xs font-semibold text-white/75 mb-3">
              {eyebrow}
            </p>
            <h1 className="heading-1 mb-4">{title}</h1>
            <p className="text-base sm:text-lg text-white/85">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PageIntro;
