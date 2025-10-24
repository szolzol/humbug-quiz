/**
 * Game Lobby Page Wrapper
 * Handles routing params and renders GameLobby component
 */

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { GameLobby } from "@/components/multiplayer/GameLobby";
import { Loader2 } from "lucide-react";

export function GameLobbyPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      navigate("/multiplayer");
      return;
    }

    // Fetch room state to get the code
    const fetchRoomState = async () => {
      try {
        const response = await fetch(
          `/api/rooms?action=state&roomId=${roomId}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch room state");
        }

        setRoomCode(data.data.room.code);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch room state:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
        // Redirect back to multiplayer page after 3 seconds
        setTimeout(() => navigate("/multiplayer"), 3000);
      }
    };

    fetchRoomState();
  }, [roomId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Error: {error}</p>
          <p className="text-sm text-muted-foreground">
            Redirecting to multiplayer page...
          </p>
        </div>
      </div>
    );
  }

  if (!roomId) {
    return null;
  }

  return <GameLobby roomId={roomId} code={roomCode} />;
}
