export const Footer = () => {
  return (
    <footer className="border-t border-brand-text/10 pt-12 pb-20 px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[9px] uppercase tracking-[0.3em] font-bold text-brand-text/40 space-y-8 md:space-y-0">
        <span>Affordable Clean Energy — SDG 7</span>
        <div className="flex items-center gap-10">
          <span className="font-serif italic lowercase tracking-tight text-xl text-brand-text/60 normal-case">Clean Cooking Global Alliance</span>
        </div>
        <span>Health and Well-being — SDG 3</span>
      </div>
      <div className="max-w-7xl mx-auto mt-12 text-center text-[8px] uppercase tracking-[0.5em] font-bold text-brand-text/20">
        &copy; 2026 Archive of Sustainable Transitions • All Rights Observed
      </div>
    </footer>
  );
};
