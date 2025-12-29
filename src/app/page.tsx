"use client";

import { useRouter } from "next/navigation";
import { SplitEntry } from "@/components/home";
import { SmartCompass } from "@/components/navigation";

export default function Home() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    if (path === 'home') {
      router.push('/');
    } else if (path === 'atlas') {
      router.push('/atlas');
    } else if (path === 'relic') {
      router.push('/relic');
    } else if (path === 'quiz') {
      router.push('/quiz');
    } else {
      router.push(`/${path}`);
    }
  };

  const handleGuidedEntry = (path: 'atlas' | 'relic') => {
    // For now, navigate to the collection page
    // Later this can trigger an onboarding flow
    router.push(`/${path}`);
  };

  const handleOpenAssistant = () => {
    // Placeholder for AI assistant integration
    console.log('Opening Alchemist assistant...');
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Split Screen Entry */}
      <SplitEntry 
        onNavigate={handleNavigate}
        onGuidedEntry={handleGuidedEntry}
      />
      
      {/* Smart Compass Navigation */}
      <SmartCompass 
        view="home"
        theme="light"
        gpsCoordinates="41.4025° N, 2.1743° E"
        onNavigate={handleNavigate}
        onOpenAssistant={handleOpenAssistant}
      />
    </main>
  );
}
