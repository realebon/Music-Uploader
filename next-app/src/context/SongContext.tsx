'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Song {
  id: string;
  name: string;
  file: File;
}

interface SongContextType {
  songs: Song[];
  addSongs: (newSongs: File[]) => void;
}

const SongContext = createContext<SongContextType | undefined>(undefined);

export const SongProvider = ({ children }: { children: ReactNode }) => {
  const [songs, setSongs] = useState<Song[]>([]);

  const addSongs = (newSongs: File[]) => {
    const formattedSongs = newSongs.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      file,
    }));
    setSongs((prev) => [...prev, ...formattedSongs]);
  };

  return (
    <SongContext.Provider value={{ songs, addSongs }}>
      {children}
    </SongContext.Provider>
  );
};

export const useSongs = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSongs must be used within a SongProvider');
  }
  return context;
};
