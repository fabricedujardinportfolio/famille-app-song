import React from 'react';
import { Music, Play } from 'lucide-react';
import type { Song } from '../types/database.types';

interface SongListProps {
  songs: Song[];
  onSongSelect: (song: Song) => void;
}

export default function SongList({ songs, onSongSelect }: SongListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {songs.map((song) => (
        <div
          key={song.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <Music className="h-6 w-6 text-indigo-600" />
                <h3 className="ml-2 text-lg font-semibold text-gray-900">{song.title}</h3>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {song.starting_note}
              </span>
            </div>
            <p className="mt-2 text-sm text-gray-500 line-clamp-3">{song.lyrics}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Speed: {song.scroll_speed.charAt(0).toUpperCase() + song.scroll_speed.slice(1)}
              </span>
              <button
                onClick={() => onSongSelect(song)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Play size={16} className="mr-1" />
                Play
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}