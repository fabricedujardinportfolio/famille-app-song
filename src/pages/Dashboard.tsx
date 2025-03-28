import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { Song } from '../types/database.types';
import AddSongForm from '../components/AddSongForm';
import SongList from '../components/SongList';
import SongPlayer from '../components/SongPlayer';
import SearchBar from '../components/SearchBar';
import { LogOut } from 'lucide-react';

export default function Dashboard() {
  const { signOut } = useAuth();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState('All');

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setSongs(data || []);
    } catch (err) {
      setError('Impossible de récupérer les chansons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = 
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.lyrics.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesNote = selectedNote === 'All' || song.starting_note === selectedNote;
    
    return matchesSearch && matchesNote;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Chansons</h1>
        <div className="flex items-center gap-4">
          <AddSongForm onSongAdded={fetchSongs} />
          <button
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
          >
            <LogOut size={18} />
            Se déconnecter
          </button>
        </div>
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedNote={selectedNote}
        onNoteChange={setSelectedNote}
      />

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement des chansons...</p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">Aucune chanson trouvée. Ajoutez votre première chanson !</p>
        </div>
      ) : (
        <SongList songs={filteredSongs} onSongSelect={setSelectedSong} />
      )}

      {selectedSong && (
        <SongPlayer song={selectedSong} onClose={() => setSelectedSong(null)} />
      )}
    </div>
  );
}