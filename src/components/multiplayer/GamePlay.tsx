/**
 * GamePlay Component
 * Shows active multiplayer game with questions, answers, and HUMBUG challenges
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Users, Crown, AlertCircle, Clock, Send, Loader2 } from "lucide-react";
import { RoomState } from "../../hooks/useGameRoom";

interface GamePlayProps {
  roomState: RoomState;
  onSubmitAnswer: (answer: string) => Promise<void>;
  onCallHumbug: (answerId: number) => Promise<void>;
}

export function GamePlay({
  roomState,
  onSubmitAnswer,
  onCallHumbug,
}: GamePlayProps) {
  const { t, i18n } = useTranslation();
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { room, players, currentPlayer, gameState } = roomState;

  if (!gameState) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading game state...</p>
        </Card>
      </div>
    );
  }

  const currentQuestion = gameState.currentQuestion;
  const isMyTurn = currentPlayer?.id === gameState.currentTurnPlayerId;
  const currentTurnPlayer = players.find(
    (p) => p.id === gameState.currentTurnPlayerId
  );

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmitAnswer(answer.trim());
      setAnswer(""); // Clear input after submit
    } catch (err) {
      console.error("Failed to submit answer:", err);
      alert("Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-4">
      {/* Game Header - Progress & Players */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-base">
              🎯 Question {gameState.currentQuestionIndex + 1} /{" "}
              {gameState.totalQuestions}
            </Badge>
            <Badge variant="outline" className="text-base">
              🔄 Round {gameState.roundNumber}
            </Badge>
          </div>
          <Badge variant="secondary" className="text-sm">
            Room: {room.code}
          </Badge>
        </div>

        {/* Players Summary */}
        <div className="flex gap-2 overflow-x-auto">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border min-w-fit ${
                player.id === gameState.currentTurnPlayerId
                  ? "bg-blue-100 dark:bg-blue-900/30 border-blue-400"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              }`}>
              {player.isHost && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className="font-medium text-sm">{player.nickname}</span>
              <span className="text-xs">❤️{player.lives}</span>
              <span className="text-xs">🏆{player.score}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Current Question */}
      {currentQuestion && (
        <Card className="p-6">
          <div className="mb-4">
            <Badge className="mb-3">{currentQuestion.category}</Badge>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {i18n.language === "hu"
                ? currentQuestion.textHu || currentQuestion.textEn
                : currentQuestion.textEn}
            </h2>
          </div>

          {/* Turn Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <Users className="h-4 w-4" />
            {isMyTurn ? (
              <span className="font-semibold text-green-600 dark:text-green-400">
                Your turn! 🎯
              </span>
            ) : (
              <span>
                Waiting for <strong>{currentTurnPlayer?.nickname}</strong> to
                answer...
              </span>
            )}
          </div>

          {/* Answer Input - Only for current turn player */}
          {isMyTurn && (
            <form onSubmit={handleSubmitAnswer} className="space-y-3">
              <Input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder={t("multiplayer.typeYourAnswer")}
                disabled={submitting}
                className="text-lg"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!answer.trim() || submitting}
                className="w-full"
                size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("multiplayer.submitting")}
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    {t("multiplayer.submitAnswer")}
                  </>
                )}
              </Button>
            </form>
          )}
        </Card>
      )}

      {/* Recent Answers - Show for HUMBUG challenges */}
      {gameState.recentAnswers && gameState.recentAnswers.length > 0 && (
        <Card className="p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("multiplayer.recentAnswers")}
          </h3>
          <div className="space-y-2">
            {gameState.recentAnswers.map((ans) => (
              <div
                key={ans.answerId}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  ans.revealed
                    ? ans.isCorrect
                      ? "bg-green-50 dark:bg-green-900/20 border-green-300"
                      : "bg-red-50 dark:bg-red-900/20 border-red-300"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200"
                }`}>
                <div className="flex items-center gap-3">
                  <span className="font-medium">{ans.playerNickname}:</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {ans.revealed ? ans.answerText : "???"}
                  </span>
                </div>

                {!ans.revealed &&
                  ans.playerNickname !== currentPlayer?.nickname && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onCallHumbug(ans.answerId)}>
                      🎺 HUMBUG!
                    </Button>
                  )}

                {ans.revealed && (
                  <Badge variant={ans.isCorrect ? "default" : "destructive"}>
                    {ans.isCorrect ? "✓ Correct" : "✗ Wrong"}
                    {ans.pointsEarned > 0 && ` +${ans.pointsEarned}`}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
