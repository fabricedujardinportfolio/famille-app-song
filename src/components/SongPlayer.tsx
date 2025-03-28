import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronUp, ChevronDown, Edit2, Save } from 'lucide-react';
import type { Song } from '../types/database.types';
import { supabase } from '../lib/supabase';

interface SongPlayerProps {
  song: Song;
  onClose: () => void;
}

const SPEEDS = {
  slow: 50,
  medium: 30,
  fast: 15,
};

export default function SongPlayer({ song, onClose }: SongPlayerProps) {
  const [speed, setSpeed] = useState(SPEEDS[song.scroll_speed]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lyrics, setLyrics] = useState(song.lyrics);

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

  const increaseSpeed = () => setSpeed((s) => Math.max(s - 5, 5));
  const decreaseSpeed = () => setSpeed((s) => Math.min(s + 5, 100));

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('songs')
        .update({ lyrics })
        .eq('id', song.id);

      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b flex items-center justify-between bg-indigo-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{song.title}</h2>
            <p className="text-sm text-gray-500">Note de départ: {song.starting_note}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-indigo-100 rounded-full text-indigo-600"
                title="Modifier"
              >
                <Edit2 size={20} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-indigo-100 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex">
          <div className="w-12 border-r flex flex-col items-center py-4 space-y-4 bg-gray-50">
            <button
              onClick={increaseSpeed}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-700"
              title="Augmenter la vitesse"
            >
              <ChevronUp size={20} />
            </button>
            <button
              onClick={decreaseSpeed}
              className="p-2 hover:bg-gray-200 rounded-full text-gray-700"
              title="Diminuer la vitesse"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          
          <div className="flex-1 h-[60vh] relative">
            {isEditing ? (
              <textarea
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full h-full p-6 text-lg border-0 focus:ring-0 resize-none"
              />
            ) : (
              <div
                ref={containerRef}
                className="h-full overflow-y-auto p-6 text-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#94A3B8 #F1F5F9'
                }}
              >
                <pre className="whitespace-pre-wrap font-sans">{lyrics}</pre>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 border-t flex justify-between items-center bg-gray-50">
          <div className="text-sm text-gray-500">
            Vitesse de défilement: {Math.round((100 - speed) / 5)}%
          </div>
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2"
              >
                <Save size={16} />
                Enregistrer
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
              {isScrolling ? 'Arrêter' : 'Démarrer'} le défilement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}