/**
 * Multiplayer Game Lobby
 * Shows room code, player list, and host controls
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameRoom } from "../../hooks/useGameRoom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Crown, Users, Copy, Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GameLobbyProps {
  roomId: string;
  code: string;
}

export function GameLobby({ roomId, code }: GameLobbyProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, loading, error, actions } = useGameRoom({ roomId });

  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleStartGame = async () => {
    if (!state?.currentPlayer?.isHost) return;

    setStarting(true);
    try {
      await actions.startGame(roomId);
      // Navigate to game view (state will update via polling)
    } catch (err) {
      console.error("Failed to start game:", err);
      alert(t("multiplayer.failedToStart"));
    } finally {
      setStarting(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await actions.leaveRoom(roomId);
      navigate("/");
    } catch (err) {
      console.error("Failed to leave:", err);
    } finally {
      setLeaving(false);
    }
  };

  if (loading && !state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            {t("multiplayer.errorLoadingRoom")}
          </h2>
          <p className="text-gray-600 mb-4">{error?.message}</p>
          <Button onClick={() => navigate("/")}>
            {t("common.backToHome")}
          </Button>
        </Card>
      </div>
    );
  }

  const { room, players, currentPlayer } = state;
  const isHost = currentPlayer?.isHost || false;
  const canStart =
    isHost && players.length >= 2 && players.length <= room.maxPlayers;

  return (
    <div className="container mx-auto p-4 max-w-2xl space-y-4">
      {/* Room Code Card */}
      <Card className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">{t("multiplayer.gameRoom")}</h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="text-4xl font-mono font-bold tracking-wider bg-gray-100 px-6 py-3 rounded-lg">
            {code}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={copyRoomCode}
            className="h-12 w-12">
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {t("multiplayer.shareCodeWithFriends")}
        </p>
      </Card>

      {/* Player List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("multiplayer.players")} ({players.length}/{room.maxPlayers})
          </h2>
          {room.state === "lobby" && (
            <Badge variant="secondary">{t("multiplayer.waitingToStart")}</Badge>
          )}
        </div>

        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                player.isCurrentPlayer
                  ? "bg-blue-50 border-blue-300"
                  : "bg-gray-50 border-gray-200"
              }`}>
              <div className="flex items-center gap-3">
                {player.isHost && <Crown className="h-5 w-5 text-yellow-500" />}
                <span className="font-medium">{player.nickname}</span>
                {player.isCurrentPlayer && (
                  <Badge variant="default" className="text-xs">
                    {t("common.you")}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">❤️ {player.lives}</Badge>
                <Badge variant="outline">🏆 {player.score}</Badge>
              </div>
            </div>
          ))}
        </div>

        {players.length < 2 && (
          <p className="text-sm text-amber-600 mt-4 text-center">
            ⚠️ {t("multiplayer.needMinPlayers", { min: 2 })}
          </p>
        )}
      </Card>

      {/* Host Controls */}
      {isHost && (
        <Card className="p-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            {t("multiplayer.hostControls")}
          </h3>
          <div className="space-y-2">
            <Button
              onClick={handleStartGame}
              disabled={!canStart || starting}
              className="w-full"
              size="lg">
              {starting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("multiplayer.starting")}
                </>
              ) : (
                t("multiplayer.startGame")
              )}
            </Button>
            {!canStart && players.length < 2 && (
              <p className="text-xs text-gray-600 text-center">
                {t("multiplayer.waitingForPlayers")}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Leave Button */}
      <Button
        variant="outline"
        onClick={handleLeave}
        disabled={leaving}
        className="w-full">
        {leaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("multiplayer.leaving")}
          </>
        ) : (
          t("multiplayer.leaveRoom")
        )}
      </Button>
    </div>
  );
}
