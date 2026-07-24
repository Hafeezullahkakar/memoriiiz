// Tiny Web Audio-synthesized chime for quiz-completion feedback.
// No external asset needed. Safe to call on server (SSR) — bails out gracefully.

let ctx = null;
const getCtx = () => {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
};

// kind: 'success' (ascending arpeggio) | 'perfect' (longer 4-note) | 'fail' (descending)
export function playChime(kind = "success") {
  const c = getCtx();
  if (!c) return;

  // Some browsers keep the context suspended until user gesture — resume if needed.
  if (c.state === "suspended") {
    try {
      c.resume();
    } catch {}
  }

  // Note frequencies (Hz)
  const C5 = 523.25;
  const E5 = 659.25;
  const G5 = 783.99;
  const C6 = 1046.5;
  const A4 = 440.0;
  const F4 = 349.23;

  let notes;
  if (kind === "perfect") notes = [C5, E5, G5, C6];
  else if (kind === "fail") notes = [C5, A4, F4];
  else notes = [C5, E5, G5]; // success

  const now = c.currentTime;
  const stepGap = 0.09;
  const noteDur = 0.22;
  const peakGain = 0.14;

  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;

    const t = now + i * stepGap;
    // Attack-decay envelope for a soft, bell-like chime
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peakGain, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + noteDur);

    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + noteDur + 0.05);
  });
}
