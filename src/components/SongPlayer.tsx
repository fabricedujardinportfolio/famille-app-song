import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, Edit2, Save, Trash2 } from 'lucide-react';
import type { Song } from '../types/database.types';
import { supabase } from '../lib/supabase';

interface SongPlayerProps {
  song: Song;
  onClose: () => void;
  onSongDeleted: () => void;
}

const SPEEDS = {
  slow: 50,
  medium: 30,
  fast: 15,
};

const MUSICAL_NOTES = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

export default function SongPlayer({ song, onClose, onSongDeleted }: SongPlayerProps) {
  const [speed, setSpeed] = useState(SPEEDS[song.scroll_speed]);
  const [scrollSpeedPercentage, setScrollSpeedPercentage] = useState(Math.round((100 - speed) / 5));
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: song.title,
    lyrics: song.lyrics,
    starting_note: song.starting_note,
  });

  useEffect(() => {
    if (!isScrolling || !containerRef.current) return;

    const container = containerRef.current;
    const scrollHeight = container.scrollHeight - container.clientHeight;
    const duration = scrollHeight * speed;
    const startTime = performance.now();

    const scroll = (currentTime: number) => {
      if (!isScrolling || !containerRef.current) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollHeight * progress;
      }

      if (progress < 1) {
        requestAnimationFrame(scroll);
      }
    };

    requestAnimationFrame(scroll);
  }, [isScrolling, speed]);

  const updateScrollSpeed = (newPercentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, newPercentage));
    setScrollSpeedPercentage(clampedPercentage);
    setSpeed(100 - (clampedPercentage * 5));
  };

  const increaseSpeed = () => updateScrollSpeed(scrollSpeedPercentage + 5);
  const decreaseSpeed = () => updateScrollSpeed(scrollSpeedPercentage - 5);

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({
          ...editData,
          scroll_speed: speed <= 20 ? 'fast' : speed <= 35 ? 'medium' : 'slow'
        })
        .eq('id', song.id);

      if (error) throw error;
      setIsEditing(false);
      onSongDeleted(); // Refresh the song list
    } catch (err) {
      console.error('Error updating song:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        const { error } = await supabase
          .from('songs')
          .delete()
          .eq('id', song.id);

        if (error) throw error;
        onClose();
        onSongDeleted();
      } catch (err) {
        console.error('Error deleting song:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-indigo-50">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="flex-1 px-2 py-1 border rounded mr-4"
            />
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-900">{editData.title}</h2>
              <p className="text-sm text-gray-500">Starting Note: {editData.starting_note}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-indigo-100 rounded-full text-indigo-600"
                  title="Edit"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-red-100 rounded-full text-red-500"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 min-h-0">
          <div className="w-12 border-r flex flex-col items-center py-4 space-y-4 bg-gray-50">
            <button
              onClick={increaseSpeed}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-700"
              title="Increase speed"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={decreaseSpeed}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-700"
              title="Decrease speed"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {isEditing ? (
              <div className="h-full p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Note
                  </label>
                  <select
                    value={editData.starting_note}
                    onChange={(e) => setEditData({ ...editData, starting_note: e.target.value })}
                    className="w-full rounded-md border-gray-300"
                  >
                    {MUSICAL_NOTES.map((note) => (
                      <option key={note} value={note}>{note}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lyrics
                  </label>
                  <textarea
                    value={editData.lyrics}
                    onChange={(e) => setEditData({ ...editData, lyrics: e.target.value })}
                    className="w-full h-[calc(100%-2rem)] p-4 border-gray-300 rounded-md"
                  />
                </div>
              </div>
            ) : (
              <div
                ref={containerRef}
                className="h-full overflow-y-auto p-6 text-lg"
              >
                <pre className="whitespace-pre-wrap font-sans">{editData.lyrics}</pre>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-500">
            Scroll Speed: {scrollSpeedPercentage}%
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditData({
                    title: song.title,
                    lyrics: song.lyrics,
                    starting_note: song.starting_note,
                  });
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsScrolling(!isScrolling)}
              className={`px-4 py-2 rounded-md font-medium ${
                isScrolling
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isScrolling ? 'Stop' : 'Start'} Scrolling
            </button>
          )}
        </div>
      </div>
    </div>
  );
}