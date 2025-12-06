// src/components/LifeReel.jsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, X, ChevronLeft, ChevronRight, Maximize2, Calendar,
  Clock, Heart, Image as ImageIcon, Play, Pause, Trash2,
  MoreHorizontal, CalendarClock, Edit3
} from "lucide-react";

/**
 * LIFE REEL - Premium Photo Gallery with Mortality Awareness
 * 
 * A beautiful, reflective slideshow of life's precious moments.
 * Features:
 * - Ken Burns effect (slow zoom/pan)
 * - Auto-play carousel
 * - Drag & drop upload
 * - Time-since metadata ("5 years ago")
 * - Fullscreen lightbox
 * - Caption/reflection prompts
 * - Local storage persistence
 */

export default function LifeReel({ isFinal = false }) {
  const [photos, setPhotos] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLightbox, setIsLightbox] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(null);
  const [showControlsMenu, setShowControlsMenu] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [tempDate, setTempDate] = useState("");
  const fileInputRef = useRef(null);
  const autoPlayRef = useRef(null);

  // Load photos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mortals.lifeReel");
    if (saved) {
      try {
        setPhotos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load life reel:", e);
      }
    }
  }, []);

  // Save photos to localStorage
  useEffect(() => {
    if (photos.length > 0) {
      localStorage.setItem("mortals.lifeReel", JSON.stringify(photos));
    }
  }, [photos]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && photos.length > 1 && !isLightbox) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 8000); // 8 seconds per photo (slower)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPlaying, photos.length, isLightbox]);

  // Handle file upload
  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          date: new Date().toISOString(),
          caption: "",
          reflectionPrompt: getRandomPrompt()
        };
        setPhotos((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Random reflection prompts
  const getRandomPrompt = () => {
    const prompts = [
      "What made this moment unforgettable?",
      "Who were you becoming in this season of life?",
      "What did this experience teach you?",
      "If you could return to this moment, what would you say?",
      "What emotions does this photo stir in you now?",
      "How has this memory shaped who you are today?",
      "What would you tell your past self about this time?",
      "What were you hoping for when this was taken?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  // Calculate time since photo
  const getTimeSince = (dateStr) => {
    const then = new Date(dateStr);
    const now = new Date();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = Math.floor(diffDays / 365);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return "Today";
  };

  // Delete photo
  const deletePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    if (currentIndex >= photos.length - 1) {
      setCurrentIndex(Math.max(0, photos.length - 2));
    }
  };

  // Update caption
  const updateCaption = (id, caption) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, caption } : p))
    );
    setIsEditing(null);
  };

  // Update date
  const updateDate = (id, dateStr) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, date: new Date(dateStr).toISOString() } : p)));
    setIsDateModalOpen(false);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // Navigation
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  if (photos.length === 0) {
    // Empty state - Upload prompt
    return (
      <div
        className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
          isFinal
            ? "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-200/50"
            : "bg-gradient-to-br from-purple-50 via-white to-indigo-50 border-2 border-purple-200/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`px-8 py-16 text-center relative ${isDragging ? "opacity-50" : ""}`}>
          {/* Subtle decorative elements */}
          <div className="absolute top-8 left-8 w-16 h-16 rounded-full opacity-10 blur-2xl bg-gradient-to-br from-purple-500 to-indigo-500" />
          <div className="absolute bottom-8 right-8 w-20 h-20 rounded-full opacity-10 blur-2xl bg-gradient-to-br from-amber-500 to-orange-500" />
          
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6 shadow-xl ${
            isFinal
              ? "bg-gradient-to-br from-amber-400 to-orange-500"
              : "bg-gradient-to-br from-purple-500 to-indigo-600"
          }`}>
            <ImageIcon className="w-12 h-12 text-white" />
          </div>
          
          <h3 className={`text-3xl font-bold mb-3 ${
            isFinal ? "text-amber-900" : "text-purple-900"
          }`}>
            Your Life in Pictures
          </h3>
          
          <p className={`text-base mb-2 max-w-md mx-auto leading-relaxed ${
            isFinal ? "text-amber-800/80" : "text-purple-800/80"
          }`}>
            Every photo tells a story. Every moment mattered.
          </p>
          
          <p className="text-gray-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Create a visual timeline of your journey—birthdays, travels, milestones, 
            ordinary days that became extraordinary. This is your proof: you were here, 
            you felt deeply, you lived fully.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl ${
              isFinal
                ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            }`}
          >
            <Upload className="w-6 h-6" />
            Start Your Life Reel
          </button>

          <p className="text-xs text-gray-500 mt-6">
            Drag & drop images here • Privacy-first: stored locally on your device only
          </p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  return (
    <>
      {/* Main Carousel */}
      <div className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${
        isFinal
          ? "bg-white border-2 border-amber-200/50"
          : "bg-white border-2 border-purple-200/50"
      }`}>
        {/* Subtle top gradient overlay for depth */}
        <div className={`absolute top-0 left-0 right-0 h-32 pointer-events-none z-[5] ${
          isFinal
            ? "bg-gradient-to-b from-amber-100/20 to-transparent"
            : "bg-gradient-to-b from-purple-100/20 to-transparent"
        }`} />

        {/* Header */}
        <div className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-white/95 via-white/90 to-white/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              isFinal
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : "bg-gradient-to-br from-purple-500 to-indigo-600"
            }`}>
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`font-bold ${
                isFinal ? "text-amber-900" : "text-gray-900"
              }`}>
                Life Reel
              </h3>
              <p className={`text-xs ${
                isFinal ? "text-amber-700/80" : "text-gray-600"
              }`}>
                {currentIndex + 1} of {photos.length} • {getTimeSince(currentPhoto.date)}
              </p>
            </div>
          </div>

          {/* Compact controls menu */}
          <div className="relative">
            <button
              onClick={() => setShowControlsMenu((s) => !s)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
              title="More"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showControlsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-xl z-20 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);
                      setShowControlsMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isPlaying ? "Pause" : "Play"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowControlsMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Add photos</span>
                  </button>
                  <button
                    onClick={() => {
                      setTempDate(currentPhoto.date?.slice(0,10) || new Date().toISOString().slice(0,10));
                      setIsDateModalOpen(true);
                      setShowControlsMenu(false);
                    }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                  >
                    <CalendarClock className="w-4 h-4" />
                    <span>Edit date</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowControlsMenu(false);
                      if (window.confirm("Delete this photo?")) {
                        deletePhoto(currentPhoto.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Photo Display with Ken Burns Effect */}
        <div className="relative grid md:grid-cols-4 gap-0 bg-white">
          {/* Left: Rounded Photo Container */}
          <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-white overflow-hidden flex items-center justify-center p-6 md:p-6 md:col-span-1">
            <div className="relative w-full h-full rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden border-2 border-white shadow-2xl group/container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhoto.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="absolute inset-0 cursor-pointer group"
                  onClick={() => setIsPlaying(!isPlaying)}
                  title={isPlaying ? "Click to pause" : "Click to play"}
                >
                  {/* Photo with Ken Burns zoom effect */}
                  <motion.img
                    src={currentPhoto.url}
                    alt={currentPhoto.caption || "Life moment"}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: [1, 1.08],
                      x: [0, -8],
                      y: [0, -8]
                    }}
                    transition={{
                      duration: 15,
                      ease: "linear",
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  />

                  {/* Gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-br from-black/25 via-transparent to-transparent" />
                  
                  {/* Play/Pause indicator overlay (shows briefly on hover/click) */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {isPlaying ? (
                        <Pause className="w-8 h-8 text-gray-900" />
                      ) : (
                        <Play className="w-8 h-8 text-gray-900 ml-1" />
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Premium subtle rim accent */}
              <div className="absolute inset-0 rounded-[2.5rem] pointer-events-none">
                <div className={`absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ${
                  isFinal 
                    ? "ring-amber-400/20"
                    : "ring-purple-400/20"
                }`} />
              </div>

              {/* Navigation Arrows - Subtle, appear on hover */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering play/pause
                      goToPrevious();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 hover:bg-white/90 transition-all opacity-0 group-hover/container:opacity-100 z-20"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-900" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering play/pause
                      goToNext();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 hover:bg-white/90 transition-all opacity-0 group-hover/container:opacity-100 z-20"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-900" />
                  </button>
                </>
              )}

              {/* Fullscreen button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering play/pause
                  setIsLightbox(true);
                }}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 hover:bg-white/90 transition-all opacity-0 group-hover/container:opacity-100 z-20"
                title="View fullscreen"
              >
                <Maximize2 className="w-4 h-4 text-gray-900" />
              </button>

              {/* Time badge with quick edit date */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                <div className="px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {getTimeSince(currentPhoto.date)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering play/pause
                    setTempDate(currentPhoto.date?.slice(0,10) || new Date().toISOString().slice(0,10));
                    setIsDateModalOpen(true);
                  }}
                  className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:scale-110 transition-transform"
                  title="Edit photo date"
                >
                  <Edit3 className="w-4 h-4 text-gray-900" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Caption & Reflection Panel */}
          <div className="flex flex-col justify-between p-8 bg-gradient-to-br from-gray-50 to-white min-h-[400px] md:min-h-0 md:col-span-3">
            {/* Top Section: Caption */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide font-semibold">
                <Calendar className="w-4 h-4" />
                Memory {currentIndex + 1} of {photos.length}
              </div>

              {/* Editable Caption */}
              {isEditing === currentPhoto.id ? (
                <div className="space-y-2">
                  <textarea
                    defaultValue={currentPhoto.caption}
                    placeholder="Describe this moment..."
                    onBlur={(e) => updateCaption(currentPhoto.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        updateCaption(currentPhoto.id, e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-purple-500 outline-none text-base resize-none h-24"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 italic">
                    Press Ctrl+Enter to save
                  </p>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(currentPhoto.id)}
                  className="cursor-pointer group min-h-[6rem]"
                >
                  {currentPhoto.caption ? (
                    <p className="text-lg leading-relaxed text-gray-900 group-hover:text-purple-700 transition-colors">
                      "{currentPhoto.caption}"
                    </p>
                  ) : (
                    <p className="text-base text-gray-400 italic group-hover:text-purple-600 transition-colors">
                      Click to add your caption and preserve this memory...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Middle Section: Reflection Prompt */}
            <div className={`p-5 rounded-2xl border-2 ${
              isFinal
                ? "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200"
                : "bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  isFinal ? "bg-amber-200/50" : "bg-purple-200/50"
                }`}>
                  <Heart className={`w-5 h-5 ${
                    isFinal ? "text-amber-700" : "text-purple-700"
                  }`} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                    isFinal ? "text-amber-700" : "text-purple-700"
                  }`}>
                    Reflect
                  </p>
                  <p className="text-sm leading-relaxed text-gray-700 italic">
                    {currentPhoto.reflectionPrompt}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Section: Photo Dots */}
            {photos.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all rounded-full ${
                      idx === currentIndex
                        ? isFinal
                          ? "w-8 h-2 bg-amber-600"
                          : "w-8 h-2 bg-purple-600"
                        : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex items-center justify-center p-4"
            onClick={() => setIsLightbox(false)}
          >
            <button
              onClick={() => setIsLightbox(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={currentPhoto.url}
              alt={currentPhoto.caption || "Life moment"}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Lightbox caption */}
            {currentPhoto.caption && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 max-w-2xl px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl">
                <p className="text-white text-center font-medium">
                  {currentPhoto.caption}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Date Modal */}
      <AnimatePresence>
        {isDateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsDateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-3">
                <CalendarClock className="w-5 h-5 text-gray-800" />
                <h4 className="font-semibold text-gray-900">Set Photo Date</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">Choose the date this photo was actually taken.</p>
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 focus:border-purple-500 outline-none text-sm"
                max={new Date().toISOString().slice(0,10)}
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateDate(currentPhoto.id, tempDate)}
                  className={`px-4 py-2 rounded-xl text-white text-sm ${
                    isFinal ? "bg-amber-600 hover:bg-amber-700" : "bg-purple-600 hover:bg-purple-700"
                  }`}
                  disabled={!tempDate}
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
