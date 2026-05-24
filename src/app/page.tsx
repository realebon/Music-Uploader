"use client";

/**
 * Main Application Entry Point
 * 
 * Manages the high-level state of the application, including:
 * - The current view (Upload vs List)
 * - The global queue of uploaded songs
 * - Persistence to IndexedDB (localforage) so data survives reloads
 */
import { useState, useEffect } from "react";
import { Container, Flex, Spinner } from "@radix-ui/themes";
import { SongInfo } from "../types";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { UploadView } from "../components/UploadView";
import { ListView } from "../components/ListView";
import { saveSongsToStorage, loadSongsFromStorage } from "../utils/storage";

export default function Home() {
  const [songs, setSongs] = useState<SongInfo[]>([]);
  const [view, setView] = useState<'upload' | 'list'>('upload');
  const [isLoaded, setIsLoaded] = useState(false);
  const { currentSong, isPlaying, togglePlay } = useAudioPlayer();

  useEffect(() => {
    const initializeSongs = async () => {
      const storedSongs = await loadSongsFromStorage();
      if (storedSongs.length > 0) {
        setSongs(storedSongs);
        setView('list');
      }
      setIsLoaded(true);
    };
    initializeSongs();
  }, []);

  const handleSongsAdded = (newSongs: SongInfo[]) => {
    setSongs((prev) => {
      const updated = [...prev, ...newSongs];
      saveSongsToStorage(updated);
      return updated;
    });
    setView('list');
  };

  const handleRenameSong = (id: string, newTitle: string) => {
    setSongs((prev) => {
      const updated = prev.map(song => {
        if (song.id === id) {
          const originalExtension = song.file.name.includes('.') 
            ? song.file.name.substring(song.file.name.lastIndexOf('.'))
            : '.mp3';
          
          const newFileName = newTitle.endsWith(originalExtension) 
            ? newTitle 
            : `${newTitle}${originalExtension}`;
            
          const newFile = new File([song.file], newFileName, { type: song.file.type });
          return { ...song, title: newTitle, file: newFile };
        }
        return song;
      });
      saveSongsToStorage(updated);
      return updated;
    });
  };

  const handleRemoveSongs = (idsToRemove: Set<string>) => {
    setSongs((prev) => {
      const updated = prev.filter(song => !idsToRemove.has(song.id));
      saveSongsToStorage(updated);
      return updated;
    });
  };

  if (!isLoaded) {
    return (
      <Container size="2" p="4">
        <Flex justify="center" align="center" style={{ minHeight: '80vh' }}>
          <Spinner size="3" />
        </Flex>
      </Container>
    );
  }

  return (
    <Container size="2" p="4">
      {view === 'upload' && (
        <UploadView onSongsAdded={handleSongsAdded} />
      )}

      {view === 'list' && (
        <ListView 
          songs={songs} 
          currentSong={currentSong}
          isPlaying={isPlaying}
          onSongsAdded={handleSongsAdded}
          onTogglePlay={togglePlay}
          onRenameSong={handleRenameSong}
          onRemoveSongs={handleRemoveSongs}
        />
      )}
    </Container>
  );
}
