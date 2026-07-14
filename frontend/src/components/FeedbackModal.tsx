import React, { useState } from 'react';
import { Star, Sparkles, MessageSquare, Flame } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  stage: number;
  part: number;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, stage, part, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>('');
  const [enjoyment, setEnjoyment] = useState<string>('');
  const [comments, setComments] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating!');
      return;
    }
    if (!difficulty) {
      setError('Please choose a difficulty!');
      return;
    }
    if (!enjoyment) {
      setError('Please select how much you enjoyed this part!');
      return;
    }

    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/feedback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Token ${token}` : '',
        },
        body: JSON.stringify({
          stage,
          part,
          rating,
          difficulty,
          enjoyment,
          comments,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback.');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border-4 border-indigo-200 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Glow Effects */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-100 rounded-full blur-2xl opacity-50" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-100 rounded-full blur-2xl opacity-50" />

        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-5xl mb-6 animate-bounce">
              🎉
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Awesome Feedback!</h2>
            <p className="text-slate-500 font-bold text-sm">Thank you! Your feedback helps us make DolaCode even better!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-6 font-sans">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black mb-3 border border-indigo-150 uppercase tracking-widest">
                🚀 Part Completed!
              </span>
              <h2 className="text-3xl font-black text-slate-800">How was Part {part}?</h2>
              <p className="text-slate-500 font-bold text-xs mt-1">Let us know what you think to help improve DolaCode!</p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-2.5 rounded-xl font-bold text-xs text-center">
                ⚠️ {error}
              </div>
            )}

            {/* Star Rating */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Rate this part</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={36}
                      className={`${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400 fill-yellow-300'
                          : 'text-slate-200'
                      } transition-colors duration-150`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-center text-xs font-black text-slate-400 uppercase tracking-widest">Difficulty</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'easy', label: 'Easy 🟢', color: 'bg-emerald-50 border-emerald-250 border-emerald-200 text-emerald-700 hover:bg-emerald-100 shadow-[0_4px_0_rgba(16,185,129,0.15)] active:translate-y-1 active:shadow-none' },
                  { value: 'medium', label: 'Medium 🟡', color: 'bg-amber-50 border-amber-250 border-amber-200 text-amber-700 hover:bg-amber-100 shadow-[0_4px_0_rgba(245,158,11,0.15)] active:translate-y-1 active:shadow-none' },
                  { value: 'hard', label: 'Hard 🔴', color: 'bg-rose-50 border-rose-250 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-[0_4px_0_rgba(244,63,94,0.15)] active:translate-y-1 active:shadow-none' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setDifficulty(item.value)}
                    className={`py-3 px-2 rounded-2xl border-4 font-black text-sm text-center transition-all ${
                      difficulty === item.value
                        ? `${item.value === 'easy' ? 'bg-emerald-500 border-emerald-600 text-white shadow-none' : item.value === 'medium' ? 'bg-amber-500 border-amber-600 text-white shadow-none' : 'bg-rose-500 border-rose-600 text-white shadow-none'}`
                        : `${item.color}`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Enjoyment Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-center text-xs font-black text-slate-400 uppercase tracking-widest">Did you enjoy it?</span>
              <div className="flex justify-around gap-4">
                {[
                  { value: 'low', emoji: '😢', label: 'Not Much' },
                  { value: 'medium', emoji: '😐', label: 'It was OK' },
                  { value: 'high', emoji: '😃', label: 'Loved It!' }
                ].map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => setEnjoyment(item.value)}
                    className={`flex flex-col items-center p-3 rounded-2xl border-4 w-24 transition-all ${
                      enjoyment === item.value
                        ? 'bg-indigo-500 border-indigo-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-3xl mb-1">{item.emoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-wider">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Comments Input */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 justify-center">
                <MessageSquare size={14} /> Any suggestions? (Optional)
              </span>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What was your favorite level? How can we make it better?"
                className="w-full min-h-[80px] p-4 bg-slate-50 border-4 border-slate-200 rounded-2xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-indigo-300 transition-colors placeholder:text-slate-400"
              />
            </div>

            {/* Submit & Skip Buttons */}
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-center transition-colors text-sm"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Submit Feedback 🚀'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
