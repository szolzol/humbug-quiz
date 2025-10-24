/**
 * Multiplayer Game Page
 * Entry point for creating or joining multiplayer game rooms
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LoginButton } from "@/components/LoginButton";

export function MultiplayerPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      // TODO: Call API to create room
      console.log("Creating room...");
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || !nickname.trim()) {
      alert(t("multiplayer.fillAllFields", "Please fill in all fields"));
      return;
    }

    setIsJoining(true);
    try {
      // TODO: Call API to join room
      console.log("Joining room:", roomCode, "as", nickname);
    } catch (error) {
      console.error("Failed to join room:", error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToHome}
            className="gap-2">
            <ArrowLeft size={18} />
            {t("common.back", "Back")}
          </Button>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <LoginButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center gap-3 mb-4">
              <Users size={40} className="text-primary" />
              <h1 className="text-4xl sm:text-5xl font-bold">
                {t("multiplayer.title", "Multiplayer Mode")}
              </h1>
            </motion.div>
            <p className="text-lg text-muted-foreground">
              {t(
                "multiplayer.subtitle",
                "Create a room or join your friends for a quiz battle!"
              )}
            </p>
          </div>

          {/* Room Options Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Room Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus size={24} className="text-primary" />
                    {t("multiplayer.createRoom", "Create Room")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "multiplayer.createRoomDesc",
                      "Start a new game and invite friends"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-nickname">
                      {t("multiplayer.yourNickname", "Your Nickname")}
                    </Label>
                    <Input
                      id="create-nickname"
                      placeholder={t(
                        "multiplayer.enterNickname",
                        "Enter your nickname"
                      )}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !nickname.trim()}
                    className="w-full"
                    size="lg">
                    {isCreating
                      ? t("multiplayer.creating", "Creating...")
                      : t("multiplayer.createRoom", "Create Room")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Join Room Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={24} className="text-primary" />
                    {t("multiplayer.joinRoom", "Join Room")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "multiplayer.joinRoomDesc",
                      "Enter a room code to join an existing game"
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-code">
                      {t("multiplayer.roomCode", "Room Code")}
                    </Label>
                    <Input
                      id="room-code"
                      placeholder="ABC123"
                      value={roomCode}
                      onChange={(e) =>
                        setRoomCode(e.target.value.toUpperCase())
                      }
                      maxLength={6}
                      className="text-center text-2xl font-bold tracking-widest"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="join-nickname">
                      {t("multiplayer.yourNickname", "Your Nickname")}
                    </Label>
                    <Input
                      id="join-nickname"
                      placeholder={t(
                        "multiplayer.enterNickname",
                        "Enter your nickname"
                      )}
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <Button
                    onClick={handleJoinRoom}
                    disabled={isJoining || !roomCode.trim() || !nickname.trim()}
                    className="w-full"
                    size="lg"
                    variant="secondary">
                    {isJoining
                      ? t("multiplayer.joining", "Joining...")
                      : t("multiplayer.joinRoom", "Join Room")}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center">
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">
                  {t("multiplayer.howToPlay", "How to Play")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "multiplayer.instructions",
                    "Create a room to get a unique code, share it with friends. Take turns answering questions. Challenge wrong answers with HUMBUG to earn passes and eliminate opponents!"
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
