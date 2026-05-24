"use client";

import { useCallback } from "react";
import { extractArtwork } from "../utils/metadata";
import { SongInfo } from "../types";

export function useFileUpload(onSongsAdded: (songs: SongInfo[]) => void) {
  const processFiles = useCallback(async (newFiles: File[]) => {
    const mp3Files = newFiles.filter(
      (file) => file.type === "audio/mpeg" || file.name.endsWith(".mp3")
    );
    
    if (mp3Files.length > 0) {
      const newSongs: SongInfo[] = [];
      for (const file of mp3Files) {
        const coverUrl = await extractArtwork(file);
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);
        const title = file.name.replace(/\.[^/.]+$/, "");
        newSongs.push({ id, file, title, coverUrl });
      }
      onSongsAdded(newSongs);
    }
  }, [onSongsAdded]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      // Reset input so the same file can be uploaded again if needed
      e.target.value = "";
    }
  }, [processFiles]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [processFiles]);

  return { processFiles, handleFileChange, handleDrop };
}
