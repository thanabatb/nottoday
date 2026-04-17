"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import { ResetFlow } from "@/components/reset-flow";

export function HomeView() {
  const { appState, updatePreferences } = useAppState();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [soundtrack, setSoundtrack] = useState<"main" | "ending">("main");
  const landingBackdrop =
    "linear-gradient(180deg, rgba(5, 7, 15, 0.12) 0%, rgba(5, 7, 15, 0.36) 45%, rgba(5, 7, 15, 0.72) 100%), url('/illustrations/main_bg.png')";
  const soundEnabled = appState.preferences.soundEnabled;
  const soundtrackSrc = soundtrack === "ending" ? "/audio/ending.wav" : "/audio/main.wav";

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.load();

    if (soundEnabled) {
      audio.play().catch(() => {});
      return;
    }

    audio.pause();
  }, [soundEnabled, soundtrackSrc]);

  const handleSoundToggle = () => {
    const nextSoundEnabled = !soundEnabled;

    updatePreferences({
      soundEnabled: nextSoundEnabled,
    });

    if (nextSoundEnabled) {
      audioRef.current?.play().catch(() => {});
    } else {
      audioRef.current?.pause();
    }
  };

  return (
    <main className="landing-screen" style={{ backgroundImage: landingBackdrop }}>
      <audio ref={audioRef} loop preload="auto" src={soundtrackSrc} />

      <button
        aria-label={soundEnabled ? "Turn landing sound off" : "Turn landing sound on"}
        className="sound-toggle"
        data-enabled={soundEnabled}
        onClick={handleSoundToggle}
        type="button"
      >
        <Image
          alt=""
          aria-hidden="true"
          className="sound-toggle-icon"
          height={24}
          src="/illustrations/volume-high.svg"
          width={24}
        />
        <span className="sr-only">{soundEnabled ? "Sound On" : "Sound Off"}</span>
      </button>

      <button className="start-button" onClick={() => setResetOpen(true)} type="button">
        Enter Room
      </button>

      <ResetFlow
        onClose={() => {
          setSoundtrack("main");
          setResetOpen(false);
        }}
        onSoundtrackChange={setSoundtrack}
        open={resetOpen}
      />
    </main>
  );
}
