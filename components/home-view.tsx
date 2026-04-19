"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/components/app-state-provider";
import { LocaleToggle } from "@/components/locale-toggle";
import { ResetFlow } from "@/components/reset-flow";
import { getCopy } from "@/lib/i18n";

export function HomeView() {
  const { appState, updatePreferences } = useAppState();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [soundtrack, setSoundtrack] = useState<"main" | "ending">("main");
  const landingBackdrop =
    "linear-gradient(180deg, rgba(5, 7, 15, 0.12) 0%, rgba(5, 7, 15, 0.36) 45%, rgba(5, 7, 15, 0.72) 100%), url('/illustrations/main_bg.png')";
  const locale = appState.preferences.locale;
  const soundEnabled = appState.preferences.soundEnabled;
  const soundtrackSrc = soundtrack === "ending" ? "/audio/ending.wav" : "/audio/main.wav";
  const copy = getCopy(locale);
  const landingKicker = locale === "th" ? "พื้นที่ปลอดภัย" : "Safe Space";

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

  const handleLocaleToggle = () => {
    updatePreferences({
      locale: locale === "en" ? "th" : "en",
    });
  };

  return (
    <main className="landing-screen" style={{ backgroundImage: landingBackdrop }}>
      <audio ref={audioRef} loop preload="auto" src={soundtrackSrc} />

      <LocaleToggle locale={locale} onToggle={handleLocaleToggle} />

      <button
        aria-label={soundEnabled ? copy.common.soundOff : copy.common.soundOn}
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
        <span className="sr-only">{soundEnabled ? copy.common.soundOn : copy.common.soundOff}</span>
      </button>

      <section className="landing-intro" aria-label={copy.home.welcomeTitle}>
        <div className="landing-copy">
          <p className="landing-kicker">{landingKicker}</p>
          <h1 className="landing-title">{copy.home.welcomeTitle}</h1>
          <p className="landing-subtitle">{copy.home.welcomeSubtitle}</p>
        </div>

        <button className="start-button landing-start-button" onClick={() => setResetOpen(true)} type="button">
          {copy.home.enterRoom}
        </button>
      </section>

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
