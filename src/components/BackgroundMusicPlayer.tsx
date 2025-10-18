import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SpeakerHigh,
  SpeakerX,
  SpeakerLow,
  MusicNotes,
} from "@phosphor-icons/react";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface BackgroundMusicPlayerProps {
  src: string;
  title: string;
}

export function BackgroundMusicPlayer({
  src,
  title,
}: BackgroundMusicPlayerProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default to 30% volume for background music
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <SpeakerX size={18} weight="fill" />;
    } else if (volume < 0.5) {
      return <SpeakerLow size={18} weight="fill" />;
    } else {
      return <SpeakerHigh size={18} weight="fill" />;
    }
  };

  return (
    <motion.div
      className="px-4 py-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}>
      {/* Horizontal Soundbar Layout */}
      <div className="flex items-center gap-4 max-w-7xl mx-auto">
        {/* Play/Pause Button */}
        <Button
          onClick={togglePlay}
          size="sm"
          className="bg-gradient-to-br from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground rounded-full w-10 h-10 p-0 shadow-lg transition-all duration-300 hover:scale-105 flex-shrink-0">
          {isPlaying ? (
            <Pause size={18} weight="fill" />
          ) : (
            <Play size={18} weight="fill" />
          )}
        </Button>

        {/* Music Icon and Title */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          <motion.div
            animate={isPlaying ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex-shrink-0">
            <MusicNotes size={20} weight="fill" className="text-primary/80" />
          </motion.div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              {title}
            </h3>
          </div>
        </div>

        {/* Volume Controls - Takes remaining space */}
        <div className="flex items-center gap-2 flex-1 max-w-md ml-auto">
          <button
            onClick={toggleMute}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-accent/20 rounded-full flex-shrink-0">
            {getVolumeIcon()}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-primary [&::-webkit-slider-thumb]:to-accent [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-primary [&::-moz-range-thumb]:to-accent [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg hover:[&::-webkit-slider-thumb]:scale-110 hover:[&::-moz-range-thumb]:scale-110 transition-all"
          />
          <span className="text-xs font-medium text-muted-foreground w-10 text-right flex-shrink-0">
            {Math.round((isMuted ? 0 : volume) * 100)}%
          </span>
        </div>
      </div>

      {/* Audio element with loop enabled */}
      <audio
        ref={audioRef}
        src={src}
        loop
        onEnded={() => setIsPlaying(false)}
      />
    </motion.div>
  );
}
