import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Set<number>>(
    new Set()
  );

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
  const columns = answerCount > 15 ? 3 : answerCount > 8 ? 2 : 1;

  return (
    <motion.div
      className="relative w-full aspect-video perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}>
      <motion.div
        className="relative w-full h-full cursor-pointer preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        onClick={() => setIsFlipped(!isFlipped)}>
        {/* Front of card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-2 border-accent shadow-xl">
          <CardContent className="flex flex-col justify-center items-center h-full p-6 text-center">
            <div className="text-primary-foreground/80 text-sm font-medium mb-3 uppercase tracking-wide">
              {question.category}
            </div>
            <h3 className="text-primary-foreground font-bold text-lg leading-tight px-4">
              {question.question}
            </h3>
            <div className="mt-6 text-primary-foreground/60 text-sm">
              Kattints a válaszokért!
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 border-2 border-accent shadow-xl overflow-hidden">
          <CardContent className="flex flex-col h-full p-4">
            <div className="text-secondary-foreground/80 text-xs font-medium mb-2 uppercase tracking-wide text-center">
              Lehetséges válaszok
            </div>
            <div
              className={`flex-1 overflow-y-auto pr-1 grid ${
                columns === 3
                  ? "grid-cols-3"
                  : columns === 2
                  ? "grid-cols-2"
                  : "grid-cols-1"
              } gap-1.5 scrollbar-thin scrollbar-thumb-secondary-foreground/20 scrollbar-track-transparent`}>
              {question.answers.map((answer, answerIndex) => (
                <motion.div
                  key={answerIndex}
                  className={`rounded-md px-2 py-1.5 text-center text-xs cursor-pointer transition-all duration-200 ${
                    selectedAnswers.has(answerIndex)
                      ? "bg-green-500/30 border border-green-500/50"
                      : "bg-secondary-foreground/10 hover:bg-secondary-foreground/20"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + answerIndex * 0.03 }}
                  onClick={(e) => handleAnswerClick(e, answerIndex)}>
                  <span className="text-secondary-foreground">{answer}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-2 text-secondary-foreground/60 text-[10px] text-center leading-tight">
              Kattints a válaszokra • Kártyára kattintva vissza a kérdéshez
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
