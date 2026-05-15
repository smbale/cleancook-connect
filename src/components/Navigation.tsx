import { motion } from "motion/react";
import { User, LogOut, LogIn } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signInWithGoogle } from "../lib/firebase";

export const Navigation = ({ onOpenProfile }: { onOpenProfile: () => void }) => {
  const [user] = useAuthState(auth);

  return (
    <nav className="border-b border-brand-text/10 px-10 py-6 sticky top-0 bg-brand-bg/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-editorial font-bold text-brand-accent mb-1">The Global Transition</span>
          <span className="font-serif text-2xl italic text-brand-text">Clean Cooking Initiative</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-10 text-[11px] uppercase tracking-widest font-semibold text-brand-text">
          <a href="#assessment" className="hover:text-brand-accent transition-colors">The Impact</a>
          <a href="#solutions" className="hover:text-brand-accent transition-colors">Fuel Tech</a>
          <a href="#forum" className="hover:text-brand-accent transition-colors">Community</a>
          <div className="h-4 w-px bg-brand-text/10 mx-2" />
          
          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={onOpenProfile}
                className="flex items-center gap-3 hover:text-brand-accent transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-brand-text overflow-hidden flex items-center justify-center text-white text-[10px] italic">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user.displayName?.[0] || "U"
                  )}
                </div>
                <span className="group-hover:border-b border-brand-accent pb-0.5">Profile</span>
              </button>
              <div className="relative group">
                <button 
                  onClick={() => auth.signOut()}
                  className="text-brand-text/40 hover:text-brand-text transition-colors flex items-center gap-2"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
                <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-brand-text text-white text-[8px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  Terminate Session
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <button 
                onClick={signInWithGoogle}
                className="text-brand-accent hover:opacity-80 transition-all flex items-center gap-2"
                aria-label="Sign In with Google"
              >
                Sign In <LogIn className="w-4 h-4" />
              </button>
              <div className="absolute top-full right-0 mt-2 px-2 py-1 bg-brand-text text-white text-[8px] uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Authenticate to Contribute
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
