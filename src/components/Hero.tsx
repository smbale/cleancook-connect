import { motion } from "motion/react";

export const Hero = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center px-10 py-20 border-b border-brand-text/10">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-12 gap-12 items-center">
        <div className="col-span-12 lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h1 className="text-6xl md:text-8xl font-serif leading-[0.95] tracking-tight text-brand-text">
              Healing the <br/>
              <span className="italic">Indoor Atmosphere</span>
            </h1>
            
            <p className="text-xl leading-relaxed text-brand-text/80 max-w-lg font-light">
              Transitioning from solid fuels to modern ethanol and electric technologies isn't just about cooking—it's a critical intervention for global health equity.
            </p>

            <div className="flex items-center gap-6 pt-4">
              <div className="w-24 h-[1px] bg-brand-text"></div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">
                Reducing 4 Million Premature Deaths Annually
              </span>
            </div>

            <div className="flex flex-wrap gap-6 pt-6">
              <a href="#assessment" className="px-10 py-4 bg-brand-text text-white text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-accent transition-all">
                The Assessment
              </a>
              <a href="#solutions" className="px-10 py-4 border border-brand-text/20 text-brand-text text-[11px] uppercase tracking-[0.2em] font-bold hover:bg-brand-muted transition-all">
                The Solutions
              </a>
            </div>
          </motion.div>
        </div>

        <div className="hidden lg:block col-span-5 h-[500px]">
          <div className="w-full h-full bg-brand-paper relative overflow-hidden flex items-center justify-center p-12">
            <div className="absolute inset-0 opacity-20 flex flex-wrap gap-4 p-4 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border border-brand-text/10" />
              ))}
            </div>
            <div className="relative z-10 text-center space-y-4">
              <p className="font-serif text-2xl italic text-brand-text">"The health of the family begins at the hearth."</p>
              <p className="text-[9px] uppercase tracking-[0.2em] font-bold opacity-60">Project Hearthstone, 2024 Report</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
