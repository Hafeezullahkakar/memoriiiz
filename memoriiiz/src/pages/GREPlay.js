import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Fade,
  Zoom,
} from "@mui/material";
import {
  MdRefresh,
  MdCheckCircle,
  MdCancel,
  MdFavorite,
  MdFavoriteBorder,
  MdLocalFireDepartment,
  MdBolt,
  MdStar,
  MdEmojiEvents,
} from "react-icons/md";
import { toast } from "react-toastify";
import confetti from "canvas-confetti";
import { useTokens } from "../theme/tokens";
import { playChime } from "../utils/chime";

const API_BASE = process.env.REACT_APP_URI || "https://memoriiiz.vercel.app/api";

const XP_MATCH_CORRECT = 12;
const XP_MCQ_CORRECT = 10;
const XP_PERFECT_BONUS = 50;
const XP_COMBO_STEP = 2;
const LEVEL_XP = 100;
const STARTING_LIVES = 3;

const readNum = (k, def = 0) => {
  const v = parseInt(localStorage.getItem(k) || "", 10);
  return Number.isFinite(v) ? v : def;
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};
const haptic = (pattern) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
};

const GREPlay = () => {
  const t = useTokens();

  // data
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizType, setQuizType] = useState("To Learn");

  // mode
  const [mode, setMode] = useState("mcq");

  // persistent player state
  const [xp, setXp] = useState(() => readNum("play_xp", 0));
  const [streak, setStreak] = useState(() => readNum("play_streak", 0));
  const streakLastDate = useRef(localStorage.getItem("play_streak_last_date") || "");

  useEffect(() => localStorage.setItem("play_xp", String(xp)), [xp]);
  useEffect(() => localStorage.setItem("play_streak", String(streak)), [streak]);

  const level = Math.floor(xp / LEVEL_XP) + 1;
  const levelProgress = xp % LEVEL_XP;
  const prevLevel = useRef(level);

  // session
  const [lives, setLives] = useState(STARTING_LIVES);
  const [combo, setCombo] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);
  const [xpPop, setXpPop] = useState(null);
  const [levelUp, setLevelUp] = useState(false);

  // matching
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMeaning, setSelectedMeaning] = useState(null);
  const [matches, setMatches] = useState({});
  const [wrongMatches, setWrongMatches] = useState({});
  const [matchScore, setMatchScore] = useState(0);

  // mcq
  const [mcqQuiz, setMcqQuiz] = useState(null);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedMcqOption, setSelectedMcqOption] = useState(null);
  const [mcqResult, setMcqResult] = useState(null);
  const [mcqScore, setMcqScore] = useState(0);
  const [mcqFinished, setMcqFinished] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetchWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWords = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/getAllWords`);
      const list = res?.data || [];
      setWords(list);
      const filtered = list.filter((w) =>
        quizType === "Known" ? w.status === "Known" : quizType === "Focus" ? w.status === "Focus" : (w.status === "To Learn" || !w.status)
      );
      if (filtered.length >= 5) {
        generateQuiz(filtered);
        generateMcqQuiz(filtered);
      } else {
        setCurrentQuiz(null);
        setMcqQuiz(null);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load words");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (level > prevLevel.current) {
      prevLevel.current = level;
      setLevelUp(true);
      haptic([40, 80, 40, 80, 40]);
      confetti({
        particleCount: 160,
        spread: 100,
        startVelocity: 45,
        origin: { y: 0.5 },
        colors: ["#FFD700", "#EC4899", "#6366F1", "#22C55E"],
      });
      setTimeout(() => setLevelUp(false), 2400);
    }
  }, [level]);

  const bumpStreak = () => {
    const today = todayStr();
    const last = streakLastDate.current;
    if (last === today) return;
    const next = last === yesterdayStr() ? streak + 1 : 1;
    setStreak(next);
    streakLastDate.current = today;
    localStorage.setItem("play_streak_last_date", today);
  };

  const awardXp = (amount) => {
    if (amount <= 0) return;
    setXp((x) => x + amount);
    setXpPop({ amount, id: Date.now() });
    setTimeout(() => setXpPop(null), 900);
  };

  const bumpCombo = () => {
    setCombo((c) => {
      const next = c + 1;
      if (next >= 2) {
        setComboFlash(true);
        setTimeout(() => setComboFlash(false), 700);
      }
      return next;
    });
  };
  const resetCombo = () => setCombo(0);

  const generateQuiz = (available) => {
    const selected = [...available].sort(() => 0.5 - Math.random()).slice(0, 5);
    setCurrentQuiz({
      words: [...selected].sort(() => 0.5 - Math.random()),
      meanings: [...selected].sort(() => 0.5 - Math.random()),
    });
    setMatches({});
    setWrongMatches({});
    setSelectedWord(null);
    setSelectedMeaning(null);
    setMatchScore(0);
  };

  const generateMcqQuiz = (available) => {
    const selected = [...available].sort(() => 0.5 - Math.random()).slice(0, 5);
    const quiz = selected.map((word) => {
      const others = available
        .filter((w) => w._id !== word._id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((w) => w.meaning);
      const options = [...others, word.meaning].sort(() => 0.5 - Math.random());
      return { word, options, correctMeaning: word.meaning };
    });
    setMcqQuiz(quiz);
    setCurrentMcqIndex(0);
    setSelectedMcqOption(null);
    setMcqResult(null);
    setMcqScore(0);
    setMcqFinished(false);
    setGameOver(false);
    setLives(STARTING_LIVES);
    resetCombo();
  };

  const handleQuizTypeChange = (_e, next) => {
    if (next !== null && next !== quizType) {
      setQuizType(next);
      const filtered = words.filter((w) =>
        next === "Known" ? w.status === "Known" : (w.status === "To Learn" || !w.status)
      );
      if (filtered.length >= 5) {
        generateQuiz(filtered);
        generateMcqQuiz(filtered);
      } else {
        setCurrentQuiz(null);
        setMcqQuiz(null);
      }
    }
  };

  // matching handlers
  const handleWordSelect = (word) => {
    if (matches[word._id]) return;
    haptic(8);
    setSelectedWord(word);
    if (selectedMeaning) checkMatch(word, selectedMeaning);
  };
  const handleMeaningSelect = (meaning) => {
    if (Object.values(matches).some((m) => m._id === meaning._id)) return;
    haptic(8);
    setSelectedMeaning(meaning);
    if (selectedWord) checkMatch(selectedWord, meaning);
  };
  const checkMatch = (word, meaning) => {
    if (word._id === meaning._id) {
      setMatches((prev) => ({ ...prev, [word._id]: meaning }));
      setMatchScore((s) => s + 1);
      bumpCombo();
      awardXp(XP_MATCH_CORRECT + Math.max(0, combo) * XP_COMBO_STEP);
      haptic([15, 30, 15]);
      confetti({ particleCount: 60, spread: 55, origin: { y: 0.7 }, colors: [t.colors.known, t.colors.primary, "#FFD700"] });
    } else {
      resetCombo();
      setWrongMatches({ [word._id]: true, [meaning._id]: true });
      haptic([50, 30, 50]);
      setTimeout(() => setWrongMatches({}), 600);
    }
    setSelectedWord(null);
    setSelectedMeaning(null);
  };

  useEffect(() => {
    if (matchScore === 5) {
      awardXp(XP_PERFECT_BONUS);
      bumpStreak();
      haptic([30, 40, 30, 40, 60]);
      playChime("perfect");
      const end = Date.now() + 3000;
      const rand = (min, max) => Math.random() * (max - min) + min;
      const iv = setInterval(() => {
        const left = end - Date.now();
        if (left <= 0) return clearInterval(iv);
        const pc = 50 * (left / 3000);
        confetti({ particleCount: pc, spread: 360, ticks: 60, startVelocity: 30, origin: { x: rand(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ particleCount: pc, spread: 360, ticks: 60, startVelocity: 30, origin: { x: rand(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      return () => clearInterval(iv);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchScore]);

  // MCQ handler
  const handleMcqOptionSelect = (option) => {
    if (mcqResult) return;
    setSelectedMcqOption(option);
    const isCorrect = option === mcqQuiz[currentMcqIndex].correctMeaning;
    const willEndOnLives = !isCorrect && lives - 1 <= 0;
    const nextScore = mcqScore + (isCorrect ? 1 : 0);

    if (isCorrect) {
      setMcqResult("correct");
      setMcqScore((s) => s + 1);
      bumpCombo();
      awardXp(XP_MCQ_CORRECT + Math.max(0, combo) * XP_COMBO_STEP);
      haptic([15, 25, 15]);
      confetti({ particleCount: 40, spread: 45, origin: { y: 0.75 }, colors: [t.colors.known, t.colors.primary] });
    } else {
      setMcqResult("wrong");
      resetCombo();
      haptic([80, 40, 80]);
      setLives((l) => Math.max(0, l - 1));
    }

    if (willEndOnLives) {
      setTimeout(() => {
        setGameOver(true);
        playChime("fail");
      }, 900);
      return;
    }

    setTimeout(() => {
      if (currentMcqIndex < 4) {
        setCurrentMcqIndex((i) => i + 1);
        setSelectedMcqOption(null);
        setMcqResult(null);
      } else {
        setMcqFinished(true);
        if (nextScore === 5) {
          awardXp(XP_PERFECT_BONUS);
          playChime("perfect");
        } else {
          playChime("success");
        }
        if (nextScore >= 3) bumpStreak();
      }
    }, 1100);
  };

  const handleResetAll = () => {
    const filtered = words.filter((w) =>
      quizType === "Known" ? w.status === "Known" : quizType === "Focus" ? w.status === "Focus" : (w.status === "To Learn" || !w.status)
    );
    if (filtered.length >= 5) {
      generateQuiz(filtered);
      generateMcqQuiz(filtered);
    } else {
      fetchWords();
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
        <Container maxWidth="md">
          <Skeleton variant="rounded" height={90} sx={{ borderRadius: t.radii.lg, mb: 2 }} />
          <Skeleton variant="rounded" height={48} sx={{ borderRadius: t.radii.md, mb: 3 }} />
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: t.radii.xl, mb: 2 }} />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={60} sx={{ borderRadius: t.radii.md, mb: 1.25 }} />
          ))}
        </Container>
      </Box>
    );
  }

  // ─── HUD ────────────────────────────────────────────────────────────
  const HUD = (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: t.radii.lg,
        mb: 2,
        border: `1px solid ${t.colors.border}`,
        bgcolor: t.colors.surface,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: { xs: 1, sm: 1.5 },
            py: 0.75,
            borderRadius: t.radii.md,
            background: t.gradients.toLearn,
            color: "white",
            boxShadow: t.shadows.toLearn,
          }}
        >
          <MdLocalFireDepartment size={20} />
          <Typography sx={{ fontWeight: 800, fontSize: { xs: 14, sm: 16 } }}>{streak}</Typography>
        </Box>

        <Box sx={{ flex: 1, mx: { xs: 1, sm: 2 }, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
            <MdStar color={t.colors.toLearn} size={18} />
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 12, sm: 14 } }}>Lv {level}</Typography>
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: { xs: 11, sm: 13 }, color: t.colors.textMuted }}>
              {xp} XP
            </Typography>
          </Box>
          <Box sx={{ position: "relative", height: 8, borderRadius: t.radii.pill, bgcolor: t.colors.hover, overflow: "hidden" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                width: `${(levelProgress / LEVEL_XP) * 100}%`,
                background: t.gradients.primary,
                borderRadius: t.radii.pill,
                transition: `width ${t.motion.slow}`,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          {[0, 1, 2].map((i) =>
            i < lives ? (
              <MdFavorite key={i} size={22} color={t.colors.danger} />
            ) : (
              <MdFavoriteBorder key={i} size={22} color={t.colors.textFaint} />
            )
          )}
        </Box>
      </Box>

      {xpPop && (
        <Box
          key={xpPop.id}
          sx={{
            position: "absolute",
            right: 16,
            top: 8,
            fontWeight: 900,
            color: t.colors.known,
            fontSize: 20,
            animation: "xpFloat 0.9s ease-out forwards",
            pointerEvents: "none",
          }}
        >
          +{xpPop.amount} XP
        </Box>
      )}

      {comboFlash && combo >= 2 && (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            fontWeight: 900,
            fontSize: { xs: 22, sm: 28 },
            color: t.colors.toLearn,
            animation: "comboPop 0.7s ease-out forwards",
            pointerEvents: "none",
          }}
        >
          {combo}× COMBO!
        </Box>
      )}
    </Paper>
  );

  // ─── controls ──────────────────────────────────────────────────────
  const Controls = (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        justifyContent: "space-between",
        p: 1,
        pl: 1.5,
        mb: 2,
        borderRadius: t.radii.lg,
        border: `1px solid ${t.colors.border}`,
        bgcolor: t.colors.surface,
        flexWrap: "wrap",
      }}
    >
      <ToggleButtonGroup
        value={quizType}
        exclusive
        onChange={handleQuizTypeChange}
        size="small"
        sx={{
          bgcolor: t.colors.bg,
          borderRadius: t.radii.md,
          p: 0.5,
          "& .MuiToggleButton-root": {
            px: 2,
            py: 0.5,
            fontWeight: 700,
            fontSize: 12,
            border: "none !important",
            borderRadius: `${t.radii.sm}px !important`,
            textTransform: "none",
            color: t.colors.textMuted,
            "&.Mui-selected": {
              bgcolor: t.colors.surface,
              color: t.colors.text,
              boxShadow: t.shadows.xs,
            },
          },
        }}
      >
        <ToggleButton value="To Learn">To Learn</ToggleButton>
        <ToggleButton value="Focus">Focus</ToggleButton>
        <ToggleButton value="Known">Known</ToggleButton>
      </ToggleButtonGroup>

      <Button
        onClick={handleResetAll}
        startIcon={<MdRefresh />}
        size="small"
        sx={{ borderRadius: t.radii.md, fontWeight: 700, color: t.colors.text }}
      >
        New Round
      </Button>
    </Box>
  );

  // ─── mode tabs ─────────────────────────────────────────────────────
  const ModeTabs = (
    <Box
      sx={{
        display: "flex",
        gap: 0.5,
        p: 0.5,
        borderRadius: t.radii.lg,
        bgcolor: t.colors.surface,
        border: `1px solid ${t.colors.border}`,
        mb: 3,
      }}
    >
      {[
        { key: "mcq", label: "Lightning Round", icon: <MdBolt size={16} /> },
        { key: "match", label: "Match It", icon: <MdEmojiEvents size={16} /> },
      ].map((tab) => {
        const active = mode === tab.key;
        return (
          <Box
            key={tab.key}
            onClick={() => {
              haptic(6);
              setMode(tab.key);
            }}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              py: 1.25,
              borderRadius: t.radii.md,
              cursor: "pointer",
              userSelect: "none",
              fontWeight: 800,
              fontSize: { xs: 13, sm: 14.5 },
              transition: `all ${t.motion.base}`,
              background: active ? t.gradients.primary : "transparent",
              color: active ? "#fff" : t.colors.textMuted,
              boxShadow: active ? t.shadows.primary : "none",
            }}
          >
            {tab.icon}
            {tab.label}
          </Box>
        );
      })}
    </Box>
  );

  // Empty state
  if (!currentQuiz && !mcqQuiz) {
    return (
      <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
        <Container maxWidth="md">
          {HUD}
          {Controls}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: t.radii.xl,
              border: `2px dashed ${t.colors.border}`,
              bgcolor: t.colors.surface,
              textAlign: "center",
            }}
          >
            <Box sx={{ fontSize: 56, mb: 1 }}>🧠</Box>
            <Typography sx={{ fontWeight: 800, fontSize: 20, mb: 1 }}>Not enough words yet</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              You need at least 5 words marked as <b>{quizType}</b> to play.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="/words"
              sx={{
                borderRadius: t.radii.md,
                px: 4,
                py: 1.5,
                fontWeight: 800,
                background: t.gradients.primary,
              }}
            >
              Go to Words
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const McqView = () => {
    if (!mcqQuiz) return null;
    if (gameOver) {
      return (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: t.radii.xl,
            textAlign: "center",
            border: `2px solid ${t.colors.danger}`,
            bgcolor: t.colors.dangerSoft,
          }}
        >
          <Box sx={{ fontSize: 64, mb: 1 }}>💔</Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 1 }}>Out of lives!</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You got {mcqScore} correct. Every attempt builds memory.
          </Typography>
          <Button
            onClick={handleResetAll}
            variant="contained"
            startIcon={<MdRefresh />}
            sx={{ borderRadius: t.radii.md, px: 4, py: 1.25, fontWeight: 800, background: t.gradients.primary }}
          >
            Retry
          </Button>
        </Paper>
      );
    }
    if (mcqFinished) {
      const perfect = mcqScore === 5;
      return (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: t.radii.xl,
            textAlign: "center",
            border: `2px solid ${perfect ? t.colors.known : t.colors.border}`,
            bgcolor: perfect ? t.colors.knownSoft : t.colors.surface,
          }}
        >
          <Box sx={{ fontSize: 64, mb: 1 }}>{perfect ? "🏆" : "🎯"}</Box>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>
            {perfect ? "Perfect Round!" : "Round Complete"}
          </Typography>
          <Typography sx={{ color: t.colors.textMuted, mb: 3 }}>
            You scored {mcqScore}/5
            {perfect && <span style={{ color: t.colors.known, fontWeight: 800 }}> · +{XP_PERFECT_BONUS} bonus XP</span>}
          </Typography>
          <Button
            onClick={handleResetAll}
            variant="contained"
            startIcon={<MdRefresh />}
            sx={{ borderRadius: t.radii.md, px: 4, py: 1.25, fontWeight: 800, background: t.gradients.primary }}
          >
            Play Again
          </Button>
        </Paper>
      );
    }

    const q = mcqQuiz[currentMcqIndex];
    const progress = (currentMcqIndex / 5) * 100;

    return (
      <Box>
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.colors.textMuted }}>
              Question {currentMcqIndex + 1} of 5
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.colors.textMuted }}>
              {mcqScore} correct
            </Typography>
          </Box>
          <Box sx={{ position: "relative", height: 8, borderRadius: t.radii.pill, bgcolor: t.colors.hover, overflow: "hidden" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                width: `${progress}%`,
                background: t.gradients.known,
                borderRadius: t.radii.pill,
                transition: `width ${t.motion.base}`,
              }}
            />
          </Box>
        </Box>

        <Zoom in key={currentMcqIndex} timeout={300}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              mb: 3,
              borderRadius: t.radii.xl,
              textAlign: "center",
              background: t.gradients.primary,
              color: "#fff",
              boxShadow: t.shadows.primary,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 30, sm: 42, md: 48 }, letterSpacing: "-0.02em" }}>
              {q.word.word}
            </Typography>
            <Typography sx={{ mt: 1, opacity: 0.85, fontWeight: 500, fontSize: 13 }}>
              Pick the correct meaning
            </Typography>
          </Paper>
        </Zoom>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          {q.options.map((option, i) => {
            const isSelected = selectedMcqOption === option;
            const isCorrect = option === q.correctMeaning;

            let bg = t.colors.surface;
            let border = t.colors.border;
            let color = t.colors.text;
            let shake = false;

            if (mcqResult && isSelected) {
              if (isCorrect) {
                bg = t.gradients.known;
                border = t.colors.known;
                color = "#fff";
              } else {
                bg = t.gradients.danger;
                border = t.colors.danger;
                color = "#fff";
                shake = true;
              }
            } else if (mcqResult && isCorrect) {
              border = t.colors.known;
              bg = t.colors.knownSoft;
            }

            return (
              <Box
                key={i}
                onClick={() => handleMcqOptionSelect(option)}
                className={shake ? "shake-animation" : ""}
                sx={{
                  cursor: mcqResult ? "default" : "pointer",
                  background: bg,
                  color,
                  borderRadius: t.radii.lg,
                  border: `2px solid ${border}`,
                  p: { xs: 1.75, sm: 2 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  transition: `all ${t.motion.base}`,
                  minHeight: 56,
                  boxShadow: isSelected ? t.shadows.md : t.shadows.xs,
                  "&:hover": {
                    transform: mcqResult ? "none" : "translateY(-2px)",
                    borderColor: mcqResult ? border : t.colors.primary,
                    boxShadow: mcqResult ? undefined : t.shadows.sm,
                  },
                  "&:active": { transform: mcqResult ? "none" : "scale(0.98)" },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 14,
                    flexShrink: 0,
                    bgcolor: isSelected && mcqResult ? "rgba(255,255,255,0.25)" : t.colors.hover,
                    color: isSelected && mcqResult ? "#fff" : t.colors.text,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </Box>
                <Typography sx={{ fontWeight: 600, flex: 1, fontSize: { xs: 14, sm: 15 }, lineHeight: 1.4 }}>
                  {option}
                </Typography>
                {mcqResult && isCorrect && <MdCheckCircle size={22} color={isSelected ? "#fff" : t.colors.known} />}
                {mcqResult && isSelected && !isCorrect && <MdCancel size={22} color="#fff" />}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  const MatchView = () => {
    if (!currentQuiz) return null;
    const progress = (matchScore / 5) * 100;

    return (
      <Box>
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.colors.textMuted }}>
              Matched {matchScore} of 5
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: t.colors.textMuted }}>
              Tap a word, then its meaning
            </Typography>
          </Box>
          <Box sx={{ position: "relative", height: 8, borderRadius: t.radii.pill, bgcolor: t.colors.hover, overflow: "hidden" }}>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                width: `${progress}%`,
                background: t.gradients.known,
                borderRadius: t.radii.pill,
                transition: `width ${t.motion.base}`,
              }}
            />
          </Box>
        </Box>

        {matchScore === 5 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              mb: 3,
              borderRadius: t.radii.xl,
              textAlign: "center",
              border: `2px solid ${t.colors.known}`,
              bgcolor: t.colors.knownSoft,
            }}
          >
            <Box sx={{ fontSize: 48, mb: 1 }}>🎉</Box>
            <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5 }}>All matched!</Typography>
            <Typography sx={{ color: t.colors.known, fontWeight: 700, mb: 2 }}>+{XP_PERFECT_BONUS} bonus XP</Typography>
            <Button
              onClick={handleResetAll}
              variant="contained"
              startIcon={<MdRefresh />}
              sx={{ borderRadius: t.radii.md, px: 4, py: 1.25, fontWeight: 800, background: t.gradients.known }}
            >
              Play Again
            </Button>
          </Paper>
        )}

        <Grid container spacing={{ xs: 1, sm: 2 }}>
          <Grid item xs={6}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 10, sm: 11 }, letterSpacing: 1.5, color: t.colors.textMuted, mb: 1, textTransform: "uppercase" }}>
              Words
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.75, sm: 1.25 } }}>
              {currentQuiz.words.map((w) => {
                const isMatched = !!matches[w._id];
                const isSelected = selectedWord?._id === w._id;
                const isWrong = wrongMatches[w._id];
                return (
                  <Box
                    key={w._id}
                    onClick={() => handleWordSelect(w)}
                    className={isWrong ? "shake-animation" : ""}
                    sx={{
                      cursor: isMatched ? "default" : "pointer",
                      borderRadius: t.radii.md,
                      p: { xs: 1, sm: 1.75 },
                      minHeight: { xs: 56, sm: 52 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      gap: 0.5,
                      fontWeight: 700,
                      fontSize: { xs: 13, sm: 16 },
                      lineHeight: 1.15,
                      wordBreak: "break-word",
                      transition: `all ${t.motion.base}`,
                      border: `2px solid ${
                        isWrong
                          ? t.colors.danger
                          : isMatched
                          ? t.colors.known
                          : isSelected
                          ? t.colors.primary
                          : t.colors.border
                      }`,
                      background: isMatched
                        ? t.gradients.known
                        : isSelected
                        ? t.gradients.primary
                        : t.colors.surface,
                      color: isMatched || isSelected ? "#fff" : t.colors.text,
                      boxShadow: isSelected ? t.shadows.primary : isMatched ? t.shadows.known : t.shadows.xs,
                      "&:hover": { transform: isMatched ? "none" : "translateY(-2px)" },
                      "&:active": { transform: isMatched ? "none" : "scale(0.98)" },
                    }}
                  >
                    {w.word}
                    {isMatched && <MdCheckCircle size={16} />}
                  </Box>
                );
              })}
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography sx={{ fontWeight: 800, fontSize: { xs: 10, sm: 11 }, letterSpacing: 1.5, color: t.colors.textMuted, mb: 1, textTransform: "uppercase" }}>
              Meanings
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.75, sm: 1.25 } }}>
              {currentQuiz.meanings.map((m) => {
                const isMatched = Object.values(matches).some((match) => match._id === m._id);
                const isSelected = selectedMeaning?._id === m._id;
                const isWrong = wrongMatches[m._id];
                return (
                  <Box
                    key={m._id}
                    onClick={() => handleMeaningSelect(m)}
                    className={isWrong ? "shake-animation" : ""}
                    sx={{
                      cursor: isMatched ? "default" : "pointer",
                      borderRadius: t.radii.md,
                      p: { xs: 1, sm: 1.75 },
                      minHeight: { xs: 56, sm: 52 },
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      fontWeight: 500,
                      fontSize: { xs: 11, sm: 14 },
                      lineHeight: 1.25,
                      wordBreak: "break-word",
                      transition: `all ${t.motion.base}`,
                      border: `2px solid ${
                        isWrong
                          ? t.colors.danger
                          : isMatched
                          ? t.colors.known
                          : isSelected
                          ? t.colors.primary
                          : t.colors.border
                      }`,
                      background: isMatched
                        ? t.gradients.known
                        : isSelected
                        ? t.gradients.primary
                        : t.colors.surface,
                      color: isMatched || isSelected ? "#fff" : t.colors.text,
                      boxShadow: isSelected ? t.shadows.primary : isMatched ? t.shadows.known : t.shadows.xs,
                      "&:hover": { transform: isMatched ? "none" : "translateY(-2px)" },
                      "&:active": { transform: isMatched ? "none" : "scale(0.98)" },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>{m.meaning}</Box>
                    {isMatched && <MdCheckCircle size={16} style={{ flexShrink: 0 }} />}
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  return (
    <Box sx={{ bgcolor: t.colors.bg, minHeight: "100vh", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="md">
        {HUD}
        {Controls}
        {ModeTabs}
        <Fade in key={mode} timeout={220}>
          <Box>{mode === "mcq" ? <McqView /> : <MatchView />}</Box>
        </Fade>
      </Container>

      {levelUp && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.25s ease-out",
            pointerEvents: "none",
          }}
        >
          <Box sx={{ textAlign: "center", animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
            <Box sx={{ fontSize: 88, mb: 1 }}>⭐</Box>
            <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: { xs: 30, sm: 42 } }}>LEVEL UP!</Typography>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: { xs: 16, sm: 20 }, mt: 0.5, opacity: 0.9 }}>
              You reached level {level}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GREPlay;
