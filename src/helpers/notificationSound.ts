// A short two note chime for incoming notifications, generated with the Web
// Audio API rather than an audio file. That keeps it out of the asset bundle and
// means there is nothing to download before the first notification can be heard.
//
// Browsers refuse to play audio until the person has interacted with the page,
// so this fails quietly. A missed chime is not worth an error in the console.

let audioContext: AudioContext | null = null;

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      audioContext = new Ctor();
    }
    return audioContext;
  } catch {
    return null;
  }
};

const tone = (
  ctx: AudioContext,
  frequency: number,
  startAt: number,
  duration: number,
) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  // Fade in and out so the note does not click at either end.
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(0.18, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
};

export const playNotificationSound = (): void => {
  const ctx = getContext();
  if (!ctx) return;

  try {
    // The context starts suspended until the page has been interacted with.
    if (ctx.state === "suspended") void ctx.resume();
    const now = ctx.currentTime;
    tone(ctx, 880, now, 0.16); // A5
    tone(ctx, 1174.66, now + 0.11, 0.22); // D6
  } catch {
    // Nothing to do; the notification itself still shows.
  }
};
