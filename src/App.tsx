/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";
import { AssessmentForm } from "./components/AssessmentForm";
import { InformationGrid } from "./components/InformationGrid";
import { ForumSection } from "./components/Forum/ForumSection";
import { AiAssistant } from "./components/AiAssistant";
import { Footer } from "./components/Footer";
import { ProfileModal } from "./components/Forum/ProfileModal";

export default function App() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navigation onOpenProfile={() => setIsProfileOpen(true)} />
      <main>
        <Hero />
        <AssessmentForm />
        <InformationGrid />
        <ForumSection onOpenProfile={() => setIsProfileOpen(true)} />
      </main>
      <Footer />
      <AiAssistant />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
}

