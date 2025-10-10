import { motion } from "framer-motion"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface QuizQuestion {
  id: string
  question: string
  answers: string[]
  category: string
}

interface QuestionCardProps {
  question: QuizQuestion
  index: number
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      className="relative w-full h-80 perspective-1000"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="relative w-full h-full cursor-pointer preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 border-2 border-accent shadow-xl">
          <CardContent className="flex flex-col justify-center items-center h-full p-6 text-center">
            <div className="text-primary-foreground/80 text-sm font-medium mb-3 uppercase tracking-wide">
              {question.category}
            </div>
            <h3 className="text-primary-foreground font-bold text-lg leading-tight">
              {question.question}
            </h3>
            <div className="mt-6 text-primary-foreground/60 text-sm">
              Kattints a válaszokért!
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80 border-2 border-accent shadow-xl">
          <CardContent className="flex flex-col justify-center h-full p-6">
            <div className="text-secondary-foreground/80 text-sm font-medium mb-4 uppercase tracking-wide text-center">
              Lehetséges válaszok
            </div>
            <div className="grid grid-cols-1 gap-2 text-secondary-foreground text-sm">
              {question.answers.map((answer, answerIndex) => (
                <motion.div
                  key={answerIndex}
                  className="bg-secondary-foreground/10 rounded-lg p-2 text-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + answerIndex * 0.1 }}
                >
                  {answer}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 text-secondary-foreground/60 text-xs text-center">
              Kattints újra a kérdés megtekintéséhez
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}