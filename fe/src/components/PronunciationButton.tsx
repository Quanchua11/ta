import { useRef, useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'

export function PronunciationButton({ audioUrl }: { audioUrl: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  if (!audioUrl) return null

  const handlePlay = () => {
    if (!audioRef.current) return
    setIsPlaying(true)
    audioRef.current.currentTime = 0
    audioRef.current
      .play()
      .catch(() => {
        setIsPlaying(false)
      })
  }

  return (
    <>
      <button
        className={`audio-button ${isPlaying ? 'is-playing' : ''}`}
        type="button"
        aria-label="Nghe phát âm"
        onClick={handlePlay}
      >
        {isPlaying ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Đang phát…</span>
          </>
        ) : (
          <>
            <Volume2 size={16} />
            <span>Phát âm</span>
          </>
        )}
      </button>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </>
  )
}
