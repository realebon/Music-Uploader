import localforage from 'localforage';
import { SongInfo } from '../types';

localforage.config({
  name: 'MusicUploader',
  storeName: 'songs'
});

export const saveSongsToStorage = async (songs: SongInfo[]) => {
  try {
    await localforage.setItem('songs', songs);
  } catch (error) {
    console.error('Error saving songs to storage:', error);
  }
};

export const loadSongsFromStorage = async (): Promise<SongInfo[]> => {
  try {
    const songs = await localforage.getItem<SongInfo[]>('songs');
    return songs || [];
  } catch (error) {
    console.error('Error loading songs from storage:', error);
    return [];
  }
};
