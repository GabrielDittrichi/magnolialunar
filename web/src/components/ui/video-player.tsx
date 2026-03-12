"use client"

import { useState, useRef } from "react"
import { Play, Pause } from "lucide-react"

interface VideoPlayerProps {
  src: string
  poster?: string
  className?: string
}

export function VideoPlayer({ src, poster, className = "" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }

  return (
    <div 
      className={`relative group cursor-pointer overflow-hidden rounded-sm ${className}`} 
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        playsInline
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Overlay Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/20 transition-all duration-500 flex items-center justify-center
          ${isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
      >
        {/* Play/Pause Button Circle */}
        <div 
          className={`
            w-20 h-20 
            bg-white/20 backdrop-blur-md border border-white/40 rounded-full 
            flex items-center justify-center 
            text-white shadow-2xl transition-transform duration-300
            ${isPlaying ? "scale-90" : "scale-100 hover:scale-110"}
          `}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </div>
      </div>
    </div>
  )
}
