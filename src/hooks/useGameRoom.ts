/**
 * useGameRoom Hook
 * Manages multiplayer game room state with 3-second polling
 * ETag-based optimization for efficient network usage
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface Player {
  id: number;
  nickname: string;
  lives: number;
  score: number;
  isHost: boolean;
  isCurrentPlayer: boolean;
  joinedAt: string;
}

export interface GameQuestion {
  id: number;
  text: string;
  category: string;
}

export interface GameState {
  currentQuestionIndex: number;
  totalQuestions: number;
  roundNumber: number;
  currentQuestion: GameQuestion | null;
  currentTurnPlayerId: number;
  currentPlayerNickname: string;
}

export interface RoomState {
  room: {
    id: string;
    code: string;
    state: "lobby" | "playing" | "finished";
    maxPlayers: number;
    stateVersion: number;
    expiresAt: string;
  };
  players: Player[];
  currentPlayer: {
    id: number;
    nickname: string;
    isHost: boolean;
  } | null;
  gameState: GameState | null;
}

interface UseGameRoomOptions {
  roomId?: string;
  code?: string;
  pollingInterval?: number; // milliseconds, default 3000
  onError?: (error: Error) => void;
  onStateChange?: (state: RoomState) => void;
}

export function useGameRoom(options: UseGameRoomOptions) {
  const {
    roomId,
    code,
    pollingInterval = 3000,
    onError,
    onStateChange,
  } = options;

  const [state, setState] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Track ETag for 304 Not Modified optimization
  const etagRef = useRef<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const fetchState = useCallback(async () => {
    if (!roomId && !code) {
      return;
    }

    try {
      const params = new URLSearchParams();
      if (roomId) params.append("roomId", roomId);
      if (code) params.append("code", code);

      const headers: HeadersInit = {};
      if (etagRef.current) {
        headers["If-None-Match"] = etagRef.current;
      }

      const response = await fetch(
        `/api/rooms?action=state&${params.toString()}`,
        {
          method: "GET",
          headers,
        }
      );

      // 304 Not Modified - no changes
      if (response.status === 304) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch room state");
      }

      // Update ETag for next request
      const newETag = response.headers.get("ETag");
      if (newETag) {
        etagRef.current = newETag;
      }

      const data = await response.json();

      if (data.success && data.data) {
        setState(data.data);
        setError(null);
        setLoading(false);
        onStateChange?.(data.data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      setLoading(false);
      onError?.(error);
    }
  }, [roomId, code, onError, onStateChange]);

  // Start polling
  const startPolling = useCallback(() => {
    if (isPollingRef.current) return;

    isPollingRef.current = true;

    const poll = async () => {
      await fetchState();

      // Schedule next poll
      if (isPollingRef.current) {
        pollingTimeoutRef.current = setTimeout(poll, pollingInterval);
      }
    };

    // Initial fetch
    poll();
  }, [fetchState, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  // Auto-start polling on mount
  useEffect(() => {
    if (roomId || code) {
      startPolling();
    }

    return () => {
      stopPolling();
    };
  }, [roomId, code, startPolling, stopPolling]);

  // Refresh immediately (bypasses polling interval)
  const refresh = useCallback(async () => {
    await fetchState();
  }, [fetchState]);

  // Actions
  const createRoom = useCallback(
    async (maxPlayers: number = 10, questionSetId?: number) => {
      try {
        const response = await fetch("/api/rooms?action=create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxPlayers, questionSetId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to create room");
        }

        return data.data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create room");
        setError(error);
        throw error;
      }
    },
    []
  );

  const joinRoom = useCallback(async (roomCode: string, nickname: string) => {
    try {
      const response = await fetch("/api/rooms?action=join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: roomCode, nickname }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to join room");
      }

      return data.data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to join room");
      setError(error);
      throw error;
    }
  }, []);

  const leaveRoom = useCallback(
    async (leaveRoomId: string) => {
      try {
        const response = await fetch("/api/rooms?action=leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: leaveRoomId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to leave room");
        }

        stopPolling();
        setState(null);

        return data.data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to leave room");
        setError(error);
        throw error;
      }
    },
    [stopPolling]
  );

  const startGame = useCallback(
    async (startRoomId: string, questionSetId?: number) => {
      try {
        const response = await fetch("/api/rooms?action=start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: startRoomId, questionSetId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to start game");
        }

        // Immediate refresh to show game state
        await refresh();

        return data.data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to start game");
        setError(error);
        throw error;
      }
    },
    [refresh]
  );

  const submitAnswer = useCallback(
    async (answerRoomId: string, answer: string) => {
      try {
        const response = await fetch("/api/rooms?action=answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: answerRoomId, answer }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to submit answer");
        }

        // Immediate refresh to show updated state
        await refresh();

        return data.data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to submit answer");
        setError(error);
        throw error;
      }
    },
    [refresh]
  );

  const nextQuestion = useCallback(
    async (nextRoomId: string) => {
      try {
        const response = await fetch("/api/rooms?action=next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId: nextRoomId }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to advance to next question");
        }

        // Immediate refresh
        await refresh();

        return data.data;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to advance");
        setError(error);
        throw error;
      }
    },
    [refresh]
  );

  return {
    state,
    loading,
    error,
    refresh,
    startPolling,
    stopPolling,
    actions: {
      createRoom,
      joinRoom,
      leaveRoom,
      startGame,
      submitAnswer,
      nextQuestion,
    },
  };
}
