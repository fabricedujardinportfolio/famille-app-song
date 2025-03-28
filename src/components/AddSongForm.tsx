import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { SongFormData } from '../types/database.types';
import { useAuth } from '../contexts/AuthContext';

const MUSICAL_NOTES = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
const SCROLL_SPEEDS = ['slow', 'medium', 'fast'] as const;

export default function AddSongForm({ onSongAdded }: { onSongAdded: () => void }) {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<SongFormData>({
    title: '',
    lyrics: '',
    starting_note: 'Do',
    scroll_speed: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: supabaseError } = await supabase
        .from('songs')
        .insert([{
          ...formData,
          user_id: session?.user?.id
        }]);

      if (supabaseError) throw supabaseError;

      setFormData({
        title: '',
        lyrics: '',
        starting_note: 'Do',
        scroll_speed: 'medium',
      });
      setIsOpen(false);
      onSongAdded();
    } catch (err) {
      setError('Failed to add song');
      console.error('Error adding song:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        <PlusCircle size={20} />
        Add New Song
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Song</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-700">
            Lyrics
          </label>
          <textarea
            id="lyrics"
            value={formData.lyrics}
            onChange={(e) => setFormData({ ...formData, lyrics: e.target.value })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="starting_note" className="block text-sm font-medium text-gray-700">
            Starting Note
          </label>
          <select
            id="starting_note"
            value={formData.starting_note}
            onChange={(e) => setFormData({ ...formData, starting_note: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {MUSICAL_NOTES.map((note) => (
              <option key={note} value={note}>
                {note}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="scroll_speed" className="block text-sm font-medium text-gray-700">
            Scroll Speed
          </label>
          <select
            id="scroll_speed"
            value={formData.scroll_speed}
            onChange={(e) => setFormData({ ...formData, scroll_speed: e.target.value as typeof SCROLL_SPEEDS[number] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {SCROLL_SPEEDS.map((speed) => (
              <option key={speed} value={speed}>
                {speed.charAt(0).toUpperCase() + speed.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Song'}
          </button>
        </div>
      </form>
    </div>
  );
}