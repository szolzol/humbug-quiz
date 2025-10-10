import { motion } from "framer-motion"
import { Play, Pause, SpeakerHigh } from "@phosphor-icons/react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"

interface AudioPlayerProps {
  src: string
  title: string
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-4">
        <Button
          onClick={togglePlay}
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 p-0"
        >
          {isPlaying ? (
            <Pause size={24} weight="fill" />
          ) : (
            <Play size={24} weight="fill" />
          )}
        </Button>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            <SpeakerHigh className="inline mr-2" size={20} />
            {title}
          </h3>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {formatTime(currentTime)}
            </span>
            
            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-150"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
            
            <span className="text-sm text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
      
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <p className="text-sm text-muted-foreground mt-3">
        A játék szabályainak részletes ismertetése
      </p>
    </motion.div>
  )
}