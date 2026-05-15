import { motion } from "motion/react";
import { Zap, Droplets, Flame, ShieldCheck, TrendingDown, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Adjusting life years for better visual comparison in a single chart if units are vastly different
// Let's use two separate values but represent them meaningfully.
const visualData = [
  { name: 'Air Quality', value: 95, display: '-95%', meta: 'Reduction in harmful particulate matter' },
  { name: 'Longevity', value: 65, display: '+5 Years', meta: 'Average increase in life expectancy' },
];

const solutions = [
  {
    title: "Ethanol Micro-Distilleries",
    desc: "Local production of clean liquid fuel from agricultural waste, creating jobs and circular economies.",
    icon: Droplets,
    number: "01",
    benefits: ["Odorless burning", "Local job creation", "Sustainable energy chain"],
    bgColor: "bg-brand-muted"
  },
  {
    title: "LPG Distribution Networks",
    desc: "Rapidly scalable bridge fuel that eliminates smoke inhalation and reduces forest degradation.",
    icon: Flame,
    number: "02",
    benefits: ["Hot flame control", "Easily portable", "Immediate reduction in P.M."],
    bgColor: "bg-brand-text text-white"
  },
  {
    title: "Solar Electric Cooking",
    desc: "The ultimate goal: zero-emission cooking powered by decentralized renewable energy grids.",
    icon: Zap,
    number: "03",
    benefits: ["True zero-emissions", "Grid-independent", "Future-proof tech"],
    bgColor: "bg-brand-paper"
  }
];

export const InformationGrid = () => {
  return (
    <section id="solutions" className="py-32 px-10 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12 mb-12">
          <header className="flex justify-between items-baseline border-b border-brand-text/10 pb-6">
            <h2 className="text-4xl font-serif italic text-brand-text">Transition Pathways</h2>
            <span className="text-[10px] uppercase tracking-widest font-bold text-brand-accent">Fuel Technology & Future Tech</span>
          </header>
        </div>

        <div className="lg:col-span-12 grid md:grid-cols-3 gap-12">
          {solutions.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`p-8 min-h-[350px] flex flex-col justify-between border border-brand-text/5 ${item.bgColor}`}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <item.icon className="w-8 h-8 opacity-40" />
                  <span className="text-2xl font-serif italic text-brand-accent opacity-60 font-bold">{item.number}</span>
                </div>
                <h3 className="text-xl uppercase tracking-widest font-bold italic">{item.title}</h3>
                <p className="text-sm leading-relaxed opacity-80">{item.desc}</p>
              </div>
              <ul className="mt-8 space-y-2 border-t border-current pt-6 opacity-40">
                {item.benefits.map((b, i) => (
                  <li key={i} className="text-[9px] uppercase tracking-widest font-bold">
                    — {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-12 mt-20 grid lg:grid-cols-12 gap-20 items-center">
          <div className="lg:col-span-8 h-[400px] bg-brand-paper p-8 border border-brand-text/5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={visualData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
              >
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#2D2A26', fontSize: 12, fontWeight: 'bold' as const }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#EAE7E0', opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-brand-text text-white p-4 font-serif italic text-sm">
                          <p className="font-bold uppercase tracking-widest text-[9px] mb-1">{data.name}</p>
                          <p className="text-brand-accent text-2xl">{data.display}</p>
                          <p className="text-[10px] opacity-60 mt-1">{data.meta}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                  {visualData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#A67C52' : '#2D2A26'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <span className="text-[10px] uppercase tracking-editorial font-bold text-brand-accent">Impact Metrics</span>
            <h3 className="text-4xl font-serif leading-tight">The <span className="italic">Village Transformation</span> Vision</h3>
            <p className="text-brand-text/60 font-light leading-relaxed">
              When a village of 100 households switches to clean cooking, they prevent approximately 300 annual cases of childhood pneumonia and collectively save 70,000 hours previously spent collecting wood.
            </p>
            <div className="grid grid-cols-2 gap-10 pt-6">
              <div className="space-y-2">
                <span className="text-4xl font-serif italic text-brand-accent">-95%</span>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">PM2.5 Exposure</p>
              </div>
              <div className="space-y-2">
                <span className="text-4xl font-serif italic text-brand-accent">+5yr</span>
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-40">Life Years Gained</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
