import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { AlertCircle, Clock, Users, Loader2, HeartPulse, ChevronRight } from "lucide-react";

export const AssessmentForm = () => {
  const [fuelType, setFuelType] = useState("");
  const [hoursSpent, setHoursSpent] = useState("2");
  const [ageGroup, setAgeGroup] = useState("children");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fuelType, hoursSpent, ageGroup }),
      });
      const data = await response.json();
      setResult(data.text);
    } catch (error) {
      console.error(error);
      setResult("Sorry, we couldn't complete the assessment at this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="assessment" className="py-32 px-10 max-w-7xl mx-auto border-b border-brand-text/10">
      <div className="grid lg:grid-cols-12 gap-20">
        <div className="lg:col-span-5 space-y-12">
          <div className="space-y-6">
            <span className="text-[10px] uppercase tracking-editorial font-bold text-brand-accent">01. Household Survey</span>
            <h2 className="text-5xl font-serif tracking-tight text-brand-text leading-tight">Quantify your <br/><span className="italic">Health Risk</span></h2>
            <p className="text-brand-text/60 text-lg leading-relaxed font-light">
              Fill in the parameters below to generate a clinical-grade health risk assessment based on current exposure data.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-text/40">Primary Fuel Source</label>
              <select 
                title="Fuel Type"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                required
                className="w-full bg-transparent border-b border-brand-text/20 py-4 focus:outline-none focus:border-brand-accent transition-colors font-serif italic text-lg"
              >
                <option value="">Choose fuel type...</option>
                <option value="charcoal">Charcoal</option>
                <option value="wood">Wood</option>
                <option value="dung">Animal Dung</option>
                <option value="kerosene">Kerosene</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-text/40">Daily Exposure Rate: {hoursSpent} Hours</label>
              <input 
                type="range" 
                min="1" 
                max="12" 
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                className="w-full h-px bg-brand-text/20 appearance-none accent-brand-accent"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-brand-text/40">Vulnerable Demographic</label>
              <div className="flex gap-4">
                {["children", "women", "elderly"].map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setAgeGroup(group)}
                    className={`flex-1 py-3 text-[10px] uppercase tracking-[0.2em] font-bold border transition-all ${
                      ageGroup === group 
                        ? "bg-brand-text text-white border-brand-text" 
                        : "border-brand-text/10 text-brand-text/40 hover:border-brand-text/30"
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-accent text-white py-6 text-[10px] uppercase tracking-editorial font-bold hover:bg-brand-text transition-all flex items-center justify-center gap-4"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>Generate Health Report <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 lg:border-l lg:border-brand-text/10 lg:pl-20 min-h-[500px]">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col justify-center space-y-12"
              >
                <div className="max-w-md">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent block mb-8">Calculations Pending</span>
                  <p className="font-serif text-3xl italic text-brand-text/20 leading-relaxed">
                    \"The scientific data shows a direct correlation between smoke intake and metabolic health outcomes.\"
                  </p>
                </div>
                <div className="bg-brand-muted h-[240px] w-full flex items-center justify-center relative overflow-hidden grayscale opacity-30">
                  <HeartPulse className="w-32 h-32 text-brand-text/10 stroke-[0.5]" />
                </div>
              </motion.div>
            )}

            {loading && (
              <div className="h-full flex flex-col justify-center items-center gap-6">
                <Loader2 className="w-12 h-12 text-brand-accent animate-spin" />
                <p className="text-[10px] uppercase tracking-editorial font-bold text-brand-text/40">Analyzing Air Quality Factors...</p>
              </div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full flex flex-col pt-10"
              >
                <header className="flex justify-between items-baseline border-b border-brand-text/10 pb-6 mb-12">
                  <h3 className="text-2xl font-serif italic text-brand-accent">Report Analysis</h3>
                  <span className="text-[9px] uppercase tracking-widest font-bold text-brand-text/40">Verified by CleanCook AI</span>
                </header>
                <div className="markdown-body text-brand-text/80 columns-1 md:columns-2 gap-10">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
                <div className="mt-12 pt-12 border-t border-brand-text/10">
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-brand-accent block mb-4 italic">Next Step</span>
                  <a href="#solutions" className="text-xl font-serif hover:italic transition-all inline-flex items-center gap-4">
                    Explore available clean technology solutions <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
