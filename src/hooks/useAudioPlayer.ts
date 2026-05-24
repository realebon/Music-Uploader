"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SongInfo } from "../types";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentSong, setCurrentSong] = useState<SongInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const togglePlay = useCallback((song: SongInfo) => {
    if (!audioRef.current) return;

    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      const url = URL.createObjectURL(song.file);
      audioRef.current.src = url;
      audioRef.current.play();
      setCurrentSong(song);
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying]);

  return {
    currentSong,
    isPlaying,
    togglePlay,
  };
}
