import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import SectionWrapper from "./SectionWrapper";

const candleCount = 5;
const initialCandles = Array.from({ length: candleCount }, () => true);
const BLOW_THRESHOLD = 15;
const BLOW_COOLDOWN = 400;

function playCelebrationTone() {
  const context = new (window.AudioContext || window.webkitAudioContext)();
  const notes = [440, 554.37, 659.25];
  const duration = 0.25;
  let currentTime = context.currentTime;

  notes.forEach((freq) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, currentTime);
    gain.gain.linearRampToValueAtTime(0.16, currentTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, currentTime + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(currentTime);
    osc.stop(currentTime + duration);
    currentTime += duration;
  });
}

export default function CakeCeremony({
  onEnterSection,
  onCandlesComplete,
  onResetCandles,
  onLeaveSection,
}) {
  const [candles, setCandles] = useState(initialCandles);
  const [triggered, setTriggered] = useState(false);
  const [listening, setListening] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [signal, setSignal] = useState(0);
  const [feedback, setFeedback] = useState(
    "Tap blow mode and speak to extinguish a candle.",
  );

  const sectionRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioContextRef = useRef(null);
  const rafRef = useRef(null);
  const blowCooldown = useRef(0);
  const prevSignalRef = useRef(0);
  const signalHistory = useRef([]);
  const candlesRef = useRef(initialCandles);
  const candleBlowRef = useRef(null);
  const hasEnteredRef = useRef(false);

  const remaining = useMemo(() => candles.filter(Boolean).length, [candles]);

  const [boxOpened, setBoxOpened] = useState(false);
  const boxAudioRef = useRef(null);

  const handleBoxOpen = () => {
    if (!boxOpened) {
      if (boxAudioRef.current) {
        boxAudioRef.current.currentTime = 0;
        boxAudioRef.current.play().catch(() => {});
      }
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.2 },
        colors: ["#f7c5e9", "#d3b2ff", "#ffb7a2", "#ffffff"],
      });
      setBoxOpened(true);
    }
  };

  useEffect(() => {
    if (remaining === 0 && !triggered) {
      confetti({
        particleCount: 180,
        spread: 95,
        origin: { y: 0.2 },
        colors: ["#ffd4ea", "#d1baff", "#fff8e6"],
      });
      playCelebrationTone();
      setTriggered(true);
      stopListening();
      setFeedback("All candles are out! You made a perfect wish.");
      onCandlesComplete?.();
    }
  }, [remaining, triggered, onCandlesComplete]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasEnteredRef.current) {
          hasEnteredRef.current = true;
          onEnterSection?.();
        } else if (!entry.isIntersecting && hasEnteredRef.current) {
          hasEnteredRef.current = false;
          onLeaveSection?.();
        }
      },
      { rootMargin: "-25% 0px -50% 0px" },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [onEnterSection, onLeaveSection]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setListening(false);
    setSignal(0);
    prevSignalRef.current = 0;
    signalHistory.current = [];
  };

  const measureRMSLevel = (timeData) => {
    let sumSquares = 0;
    for (let i = 0; i < timeData.length; i += 1) {
      const normalized = timeData[i] - 128;
      sumSquares += normalized * normalized;
    }
    return Math.sqrt(sumSquares / timeData.length);
  };

  const playCandleBlowSound = () => {
    if (candleBlowRef.current) {
      candleBlowRef.current.currentTime = 0;
      candleBlowRef.current.play().catch(() => {});
    }
  };

  const handleCandle = (index) => {
    if (!candlesRef.current[index]) return;
    setCandles((prev) => {
      const next = prev.map((state, i) => (i === index ? false : state));
      candlesRef.current = next;
      return next;
    });
    playCandleBlowSound();
    setFeedback("Great! Blow again to extinguish the next candle.");
  };

  const blowFirstLitCandle = () => {
    const index = candlesRef.current.findIndex(Boolean);
    if (index >= 0) {
      handleCandle(index);
      prevSignalRef.current = 0;
      signalHistory.current = [];
    }
  };

  const detectBlow = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);
    const rms = measureRMSLevel(dataArray);

    signalHistory.current.push(rms);
    if (signalHistory.current.length > 16) signalHistory.current.shift();

    setSignal(rms);

    const now = performance.now();
    const isBlow =
      rms > BLOW_THRESHOLD && prevSignalRef.current <= BLOW_THRESHOLD;

    if (isBlow && now - blowCooldown.current > BLOW_COOLDOWN) {
      blowCooldown.current = now;
      blowFirstLitCandle();
    } else if (rms > BLOW_THRESHOLD * 0.75) {
      setFeedback("Nice breath — almost there!");
    } else if (rms > 5) {
      setFeedback("Keep speaking or blowing harder…");
    }

    prevSignalRef.current = rms;
    rafRef.current = requestAnimationFrame(detectBlow);
  };

  const enableBlowMode = async () => {
    if (listening) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicrophoneAvailable(false);
      setFeedback("Your browser does not support microphone access.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;
      sourceRef.current = source;
      audioContextRef.current = context;
      signalHistory.current = [];
      setListening(true);
      setFeedback("Listening... speak or blow into the microphone.");
      detectBlow();
    } catch (error) {
      setMicrophoneAvailable(false);
      setFeedback("Microphone permission denied. Tap candles to extinguish.");
    }
  };

  const handleReset = () => {
    candlesRef.current = initialCandles;
    setCandles(initialCandles);
    setTriggered(false);
    blowCooldown.current = 0;
    prevSignalRef.current = 0;
    stopListening();
    setFeedback("Tap blow mode and speak to extinguish a candle.");
    onResetCandles?.();
  };

  return (
    <SectionWrapper
      id="cake"
      title="Birthday Cake Ceremony"
      description="Tap or blow on the candles. The cake is crafted like a real celebration, with moving flames and a soft tone when all candles go out."
    >
      {/* integrated gift-box audio + UI */}
      <audio ref={boxAudioRef} src="/box-open-sound.mp3" preload="auto" />
      {/* candle blow sound */}
      <audio ref={candleBlowRef} src="/candle-blow.mp3" preload="auto" />

      {/* Gift box UI (added inside cake section) */}
      <div className="mb-4 w-full flex justify-center">
        <div className="relative isolate flex flex-col items-center justify-center gap-3 rounded-[34px] border border-white/8 bg-white/3 p-4 shadow-soft max-w-[320px]">
          <motion.div
            animate={{ y: boxOpened ? -8 : 0, rotate: boxOpened ? -4 : 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="relative flex h-[140px] w-[140px] items-center justify-center"
          >
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-br from-[#6e3fd8]/12 via-transparent to-[#ffbad6]/6" />
            <div className="relative h-3/4 w-3/4 rounded-[20px] border border-white/12 bg-[#120827] shadow-[inset_0_8px_30px_rgba(255,255,255,0.04)]" />
            <motion.div
              onTap={handleBoxOpen}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="absolute bottom-6 flex h-12 w-20 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#ff9cab] to-[#c78aff] text-sm font-semibold uppercase tracking-[0.12em] text-white shadow-soft"
            >
              {boxOpened ? "Opened" : "Open"}
            </motion.div>
          </motion.div>

          <div className="w-full rounded-[20px] border border-white/10 bg-[#12092f]/80 p-3 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-white/60">
              Surprise Revealed
            </p>
            <p className="mt-2 text-sm leading-6 text-white/85">
              {boxOpened
                ? "You are deeply loved, and your presence lights every celebration."
                : "Tap the box to open a glowing message."}
            </p>
          </div>
        </div>
      </div>

      {/* --- Original cake UI (kept intact) --- */}
      <div
        ref={sectionRef}
        className="mx-auto flex max-w-[560px] flex-col items-center gap-8 rounded-[40px] border border-white/10 bg-white/5  shadow-glow backdrop-blur-3xl"
      >
        <div className="relative w-full max-w-[460px] overflow-hidden rounded-[48px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,220,240,0.18),_transparent_55%)] p-6 shadow-soft">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#fed7f2]/40 via-transparent to-transparent" />
          <div className="relative mx-auto mb-6 h-20 w-[220px] rounded-full bg-white/10 blur-2xl" />
          <div className="relative mx-auto mb-8 h-16 w-[260px] rounded-full bg-[#fff0f8]/80 shadow-[0_12px_40px_rgba(255,209,240,0.16)]" />
          <div className="relative mx-auto h-[220px]  rounded-[50px] border border-white/15 bg-[#fdd6ea]/95 shadow-[inset_0_-12px_20px_rgba(255,255,255,0.45),0_18px_90px_rgba(96,30,94,0.16)]">
            <div className="absolute inset-x-6 bottom-28 h-24 rounded-[32px] bg-[#ffdff4] shadow-[inset_0_-8px_20px_rgba(255,255,255,0.35)]" />
            <div className="absolute inset-x-12 bottom-0 h-16 rounded-[28px] bg-[#eaa8ff]/90" />
            <div className="absolute top-24 left-8 h-6 w-10 rounded-full bg-[#ffe8ff]/90" />
            <div className="absolute top-24 right-12 h-6 w-10 rounded-full bg-[#fff0f8]/90" />
            <div className="absolute inset-x-0 top-4 mx-auto flex h-16 w-full items-center justify-between px-8">
              {candles.map((isLit, index) => (
                <div
                  key={index}
                  className="relative flex h-full w-10 items-end justify-center"
                >
                  <motion.div
                    animate={
                      isLit ? { y: [0, -10, 0], x: [0, 4, 0] } : { opacity: 0 }
                    }
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.12,
                    }}
                    className="absolute bottom-full h-12 w-5 rounded-full"
                  >
                    <div className="absolute inset-x-0 top-0 h-full rounded-full bg-gradient-to-b from-[#ffd87d] via-[#ffb34a] to-[#ff7960] shadow-[0_0_16px_rgba(255,149,176,0.55)]" />
                    <div className="absolute left-1/2 top-0 h-5 w-2 -translate-x-1/2 rounded-full bg-[#fff4b2] opacity-90" />
                  </motion.div>
                  <div className="absolute bottom-0 h-14 w-6 rounded-full bg-[#ffbdd9] shadow-[inset_0_4px_12px_rgba(255,255,255,0.5)]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 px-4 sm:grid-cols-5">
          {candles.map((isLit, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCandle(index)}
              className="group min-w-0 relative flex h-20 flex-col items-center justify-end gap-2 rounded-[28px] border border-white/10 bg-white/10 px-3 py-3 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="relative flex h-12 w-8 items-center justify-center">
                <div className="absolute inset-x-0 bottom-0 h-10 w-6 rounded-full bg-[#ffd7e5] shadow-[inset_0_4px_12px_rgba(255,255,255,0.5)]" />
                {isLit && (
                  <motion.div
                    animate={{ y: [0, -8, 0], x: [0, 2, 0] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.1,
                    }}
                    className="absolute top-1 h-8 w-4 rounded-full bg-gradient-to-b from-[#ffdb7f] via-[#ffb25a] to-[#ff8f7f] shadow-[0_0_18px_rgba(255,189,174,0.7)]"
                  >
                    <div className="absolute left-1/2 top-0 h-4 w-2 -translate-x-1/2 rounded-full bg-[#fff2bf] opacity-90" />
                  </motion.div>
                )}
              </div>
              <span className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                {isLit ? "blow" : "out"}
              </span>
            </button>
          ))}
        </div>

        <div className="w-full rounded-[34px] border border-white/10 bg-[#120723]/80 p-5 text-center text-white/80 shadow-soft">
          <p className="text-xs uppercase tracking-[0.24em] text-white/50">
            Make a wish ✨
          </p>
          <p className="mt-3 text-lg font-medium text-white">
            {remaining > 0
              ? `${remaining} candle${remaining > 1 ? "s" : ""} remain`
              : "All candles are out!"}
          </p>
          <p className="mt-3 text-sm text-white/50">
            {listening
              ? `Listening for your voice — signal ${Math.round(signal)} / threshold ${BLOW_THRESHOLD}`
              : microphoneAvailable
                ? "Tap blow mode, then speak or blow to extinguish a candle."
                : "Microphone unavailable. Tap the candles instead."}
          </p>
          <p className="mt-2 text-sm text-[#ffcad4]">{feedback}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={enableBlowMode}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff8abb] to-[#8c5cff] px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:scale-[1.01]"
          >
            {listening ? "Listening for your blow..." : "Blow to extinguish"}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 backdrop-blur-2xl transition hover:bg-white/10"
          >
            Reset candles
          </button>
        </div>
      </div>
    </SectionWrapper>
  );
}
