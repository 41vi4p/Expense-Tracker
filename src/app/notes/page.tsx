'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Calendar,
  FileText,
  Target,
  PiggyBank,
  Lightbulb,
  Bell,
  Bookmark
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Note } from '@/types';
import { getUserNotes, addNote, updateNote, deleteNote } from '@/lib/firestore';
import toast from 'react-hot-toast';

const NOTE_CATEGORIES = {
  'financial-goal': { name: 'Financial Goal', icon: Target, color: '#3B82F6' },
  'budget-plan': { name: 'Budget Plan', icon: PiggyBank, color: '#10B981' },
  'investment-idea': { name: 'Investment Idea', icon: Lightbulb, color: '#F59E0B' },
  'expense-reminder': { name: 'Expense Reminder', icon: Bell, color: '#EF4444' },
  'general': { name: 'General', icon: Bookmark, color: '#8B5CF6' }
};

export default function NotesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Note['category']>('general');
  const [tags, setTags] = useState<string>('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadNotes();
  }, [user, authLoading, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadNotes = useCallback(async () => {
    try {
      if (!user) return;
      const userNotes = await getUserNotes(user.uid);
      setNotes(userNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    try {
      const noteData = {
        userId: user.uid,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      };

      if (editingNote) {
        await updateNote(editingNote.id, noteData);
        toast.success('Note updated successfully');
      } else {
        await addNote(noteData);
        toast.success('Note created successfully');
      }

      setIsModalOpen(false);
      resetForm();
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setTags(note.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleDelete = async (noteId: string, noteTitle: string) => {
    if (!user) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete "${noteTitle}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      await deleteNote(noteId, user.uid);
      toast.success('Note deleted successfully');
      loadNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setTags('');
    setEditingNote(null);
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface-dark to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-xl sm:text-2xl font-display font-bold text-gradient mb-2">
            Financial Notes
          </h1>
          <p className="text-foreground/70 font-body">
            Keep track of your financial thoughts, goals, and reminders
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Add Note Button */}
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 glow hover:glow-accent"
            >
              <Plus className="w-4 h-4" />
              <span className="font-body">Add Note</span>
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-sm font-body transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border/50 hover:border-primary/50'
              }`}
            >
              All
            </button>
            {Object.entries(NOTE_CATEGORIES).map(([key, cat]) => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1 rounded-lg text-sm font-body transition-colors flex items-center space-x-1 ${
                    selectedCategory === key
                      ? 'bg-primary text-white'
                      : 'bg-surface border border-border/50 hover:border-primary/50'
                  }`}
                >
                  <IconComponent className="w-3 h-3" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Notes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredNotes.map((note, index) => {
            const categoryInfo = NOTE_CATEGORIES[note.category];
            const IconComponent = categoryInfo.icon;
            
            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="backdrop-blur-glass border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: `${categoryInfo.color}20` }}
                    >
                      <IconComponent 
                        className="w-4 h-4" 
                        style={{ color: categoryInfo.color }}
                      />
                    </div>
                    <span 
                      className="text-xs font-body"
                      style={{ color: categoryInfo.color }}
                    >
                      {categoryInfo.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(note)}
                      className="p-1.5 rounded-lg hover:bg-surface transition-colors text-foreground/60 hover:text-primary"
                      title="Edit note"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id, note.title)}
                      className="p-1.5 rounded-lg hover:bg-surface transition-colors text-foreground/60 hover:text-error"
                      title="Delete note"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <h3 className="font-body font-semibold text-foreground mb-2 line-clamp-2">
                  {note.title}
                </h3>
                
                <p className="text-sm text-foreground/70 font-body mb-3 line-clamp-3">
                  {note.content}
                </p>

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-0.5 bg-surface border border-border/50 rounded text-xs font-body text-foreground/60"
                      >
                        #{tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span className="text-xs text-foreground/50 font-body">
                        +{note.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center text-xs text-foreground/50 font-body">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
            <h3 className="text-lg font-display font-semibold text-foreground/60 mb-2">
              No notes found
            </h3>
            <p className="text-foreground/50 font-body">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Create your first financial note to get started'
              }
            </p>
          </motion.div>
        )}
      </main>

      {/* Add/Edit Note Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface-dark/95 backdrop-blur-xl border border-border/70 rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-display font-bold text-gradient">
                  {editingNote ? 'Edit Note' : 'Add Note'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 rounded-lg hover:bg-surface transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-body font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors"
                    placeholder="Enter note title..."
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-body font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Note['category'])}
                    className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors"
                  >
                    {Object.entries(NOTE_CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-body font-medium mb-2">
                    Content
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors resize-none"
                    placeholder="Write your note content..."
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-body font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/50" />
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-surface border border-border/50 rounded-xl font-body focus:border-primary focus:outline-none transition-colors"
                      placeholder="budgeting, savings, investment..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 py-3 px-4 bg-surface border border-border/50 hover:border-border text-foreground font-semibold rounded-xl transition-all duration-300 font-body"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 glow hover:glow-accent font-body"
                  >
                    {editingNote ? 'Update Note' : 'Save Note'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}