import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowsClockwise } from "@phosphor-icons/react";

interface QuizQuestion {
  id: string;
  question: string;
  answers: string[];
  category: string;
}

interface QuestionCardProps {
  question: QuizQuestion;
  index: number;
}

// Helper functions for localStorage
const getStoredFlipState = (questionId: string): boolean => {
  try {
    const stored = localStorage.getItem(`flip_${questionId}`);
    return stored === "true";
  } catch {
    return false;
  }
};

const setStoredFlipState = (questionId: string, isFlipped: boolean) => {
  try {
    localStorage.setItem(`flip_${questionId}`, String(isFlipped));
  } catch {
    // Ignore localStorage errors
  }
};

const getStoredAnswers = (questionId: string): Set<number> => {
  try {
    const stored = localStorage.getItem(`answers_${questionId}`);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore parse errors
  }
  return new Set();
};

const setStoredAnswers = (questionId: string, answers: Set<number>) => {
  try {
    localStorage.setItem(
      `answers_${questionId}`,
      JSON.stringify(Array.from(answers))
    );
  } catch {
    // Ignore localStorage errors
  }
};

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(() =>
    getStoredFlipState(question.id)
  );
  const [selectedAnswers, setSelectedAnswers] = useState<Set<number>>(() =>
    getStoredAnswers(question.id)
  );

  // Persist flip state to localStorage
  useEffect(() => {
    setStoredFlipState(question.id, isFlipped);
  }, [isFlipped, question.id]);

  // Persist selected answers to localStorage
  useEffect(() => {
    setStoredAnswers(question.id, selectedAnswers);
  }, [selectedAnswers, question.id]);

  const handleAnswerClick = (e: React.MouseEvent, answerIndex: number) => {
    e.stopPropagation();
    setSelectedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(answerIndex)) {
        newSet.delete(answerIndex);
      } else {
        newSet.add(answerIndex);
      }
      return newSet;
    });
  };

  // Determine number of columns based on answer count
  const answerCount = question.answers.length;
  const columns =
    answerCount > 20 ? 4 : answerCount > 12 ? 3 : answerCount > 6 ? 2 : 1;

  return (
    <motion.div
      className="relative w-full aspect-[9/16] md:aspect-[4/3] perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}>
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}>
        {/* Flip Button - Always visible on top */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFlipped(!isFlipped);
          }}
          className="absolute top-3 right-3 z-50 bg-background/90 hover:bg-background text-foreground rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 active:scale-95"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "none" }}
          aria-label="Flip card">
          <ArrowsClockwise size={24} weight="bold" />
        </button>

        {/* Front of card */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-2 border-accent shadow-xl overflow-hidden cursor-pointer"
          style={{ pointerEvents: isFlipped ? "none" : "auto" }}
          onClick={() => setIsFlipped(true)}>
          {/* Diagonal HUMBUG! Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="text-primary-foreground/[0.07] font-black text-[6rem] md:text-[10rem] tracking-tighter whitespace-nowrap select-none"
              style={{
                transform: "rotate(-45deg)",
                fontFamily: "Poppins, sans-serif",
              }}>
              HUMBUG!
            </div>
          </div>

          <CardContent className="flex flex-col justify-center items-center h-full p-4 md:p-6 text-center relative z-10">
            <div className="text-primary-foreground/80 !text-base md:!text-lg font-bold mb-3 md:mb-4 uppercase tracking-wide">
              {question.category}
            </div>
            <h3 className="text-primary-foreground font-bold !text-xl md:!text-2xl leading-tight px-2 md:px-4">
              {question.question}
            </h3>
            <div className="mt-5 md:mt-6 text-primary-foreground/60 !text-base md:!text-lg">
              Nyomj rá a helyes válaszokért!
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 border-2 border-accent shadow-xl overflow-hidden"
          style={{ pointerEvents: isFlipped ? "auto" : "none" }}>
          {/* Diagonal HUMBUG! Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div
              className="text-secondary-foreground/[0.05] font-black text-[6rem] md:text-[10rem] tracking-tighter whitespace-nowrap select-none"
              style={{
                transform: "rotate(-45deg)",
                fontFamily: "Poppins, sans-serif",
              }}>
              HUMBUG!
            </div>
          </div>

          <CardContent
            className="flex flex-col h-full p-3 md:p-4 relative z-10"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-secondary-foreground/80 !text-sm md:!text-base font-bold mb-2 uppercase tracking-wide text-center">
              Helyes válaszok
            </div>
            <div
              className={`flex-1 overflow-y-auto pr-1 grid ${
                columns === 4
                  ? "grid-cols-2 md:grid-cols-4"
                  : columns === 3
                  ? "grid-cols-2 md:grid-cols-3"
                  : columns === 2
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              } gap-1.5 md:gap-2 scrollbar-thin scrollbar-thumb-secondary-foreground/20 scrollbar-track-transparent`}>
              {question.answers.map((answer, answerIndex) => (
                <button
                  key={answerIndex}
                  className={`rounded-md px-2 md:px-2.5 py-1.5 md:py-2 text-center text-xs md:text-[11px] cursor-pointer transition-all duration-200 w-full ${
                    selectedAnswers.has(answerIndex)
                      ? "bg-green-500/30 border border-green-500/50"
                      : "bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
                  }`}
                  onClick={(e) => handleAnswerClick(e, answerIndex)}>
                  <span className="text-secondary-foreground font-medium">
                    {answer}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-secondary-foreground/60 text-[10px] md:text-xs text-center leading-tight">
              Kattints a válaszokra a jelöléshez
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
