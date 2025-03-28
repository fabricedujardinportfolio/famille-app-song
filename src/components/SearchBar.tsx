import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedNote: string;
  onNoteChange: (note: string) => void;
}

const MUSICAL_NOTES = ['All', 'Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

export default function SearchBar({
  searchTerm,
  onSearchChange,
  selectedNote,
  onNoteChange,
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search songs by title or lyrics..."
        />
      </div>
      <select
        value={selectedNote}
        onChange={(e) => onNoteChange(e.target.value)}
        className="block w-full sm:w-40 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      >
        {MUSICAL_NOTES.map((note) => (
          <option key={note} value={note}>
            {note === 'All' ? 'All Notes' : note}
          </option>
        ))}
      </select>
    </div>
  );
}