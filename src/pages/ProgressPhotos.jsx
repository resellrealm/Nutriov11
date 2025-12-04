import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, Plus, X, Calendar, TrendingDown, TrendingUp, Ruler,
  Loader, AlertCircle, Download, Trash2, Edit3, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getProgressPhotos,
  uploadProgressPhoto,
  deleteProgressPhoto,
  getProgressSummary
} from '../services/progressPhotosService';

const ProgressPhotos = () => {
  const userId = useSelector(state => state.auth.user?.id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form
  const [uploadForm, setUploadForm] = useState({
    file: null,
    previewUrl: null,
    date: new Date().toISOString().split('T')[0],
    weight: '',
    notes: '',
    measurements: {
      chest: '',
      waist: '',
      hips: '',
      arms: '',
      thighs: ''
    }
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [photosResult, summaryResult] = await Promise.all([
        getProgressPhotos(userId),
        getProgressSummary(userId)
      ]);

      if (photosResult.success) {
        setPhotos(photosResult.data);
      }

      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }
    } catch (error) {
      console.error('Error fetching progress photos:', error);
      toast.error('Failed to load progress photos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    setUploadForm({
      ...uploadForm,
      file,
      previewUrl
    });
    setShowUploadModal(true);
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a photo');
      return;
    }

    setUploading(true);
    try {
      const metadata = {
        date: uploadForm.date,
        weight: uploadForm.weight ? parseFloat(uploadForm.weight) : null,
        notes: uploadForm.notes,
        measurements: {
          chest: uploadForm.measurements.chest ? parseFloat(uploadForm.measurements.chest) : null,
          waist: uploadForm.measurements.waist ? parseFloat(uploadForm.measurements.waist) : null,
          hips: uploadForm.measurements.hips ? parseFloat(uploadForm.measurements.hips) : null,
          arms: uploadForm.measurements.arms ? parseFloat(uploadForm.measurements.arms) : null,
          thighs: uploadForm.measurements.thighs ? parseFloat(uploadForm.measurements.thighs) : null
        }
      };

      const result = await uploadProgressPhoto(userId, uploadForm.file, metadata);

      if (result.success) {
        toast.success('Progress photo uploaded successfully!');
        setShowUploadModal(false);
        resetUploadForm();
        fetchData();
      } else {
        toast.error(result.error || 'Failed to upload photo');
      }
    } catch {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm('Are you sure you want to delete this progress photo?')) {
      return;
    }

    try {
      const result = await deleteProgressPhoto(photo.id, userId, photo.filename);

      if (result.success) {
        toast.success('Photo deleted successfully');
        setSelectedPhoto(null);
        fetchData();
      } else {
        toast.error('Failed to delete photo');
      }
    } catch {
      toast.error('Failed to delete photo');
    }
  };

  const resetUploadForm = () => {
    if (uploadForm.previewUrl) {
      URL.revokeObjectURL(uploadForm.previewUrl);
    }
    setUploadForm({
      file: null,
      previewUrl: null,
      date: new Date().toISOString().split('T')[0],
      weight: '',
      notes: '',
      measurements: {
        chest: '',
        waist: '',
        hips: '',
        arms: '',
        thighs: ''
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading progress photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              <Camera className="mr-3 text-primary" size={32} />
              Progress Photos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your transformation visually over time
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus size={20} className="mr-2" />
              Add Photo
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Total Photos</span>
              <Camera size={20} />
            </div>
            <p className="text-3xl font-bold">{summary.totalPhotos}</p>
            <p className="text-xs opacity-75 mt-1">in your gallery</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Current Weight</span>
              {summary.weightChange !== null && summary.weightChange < 0 ? (
                <TrendingDown size={20} />
              ) : (
                <TrendingUp size={20} />
              )}
            </div>
            <p className="text-3xl font-bold">
              {summary.currentWeight ? `${summary.currentWeight} kg` : 'N/A'}
            </p>
            <p className="text-xs opacity-75 mt-1">
              {summary.startWeight && 'from ' + summary.startWeight + ' kg'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-gradient-to-br ${
              summary.weightChange !== null && summary.weightChange < 0
                ? 'from-green-500 to-green-600'
                : summary.weightChange !== null && summary.weightChange > 0
                ? 'from-orange-500 to-orange-600'
                : 'from-gray-500 to-gray-600'
            } rounded-xl shadow-lg p-6 text-white`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Weight Change</span>
              <TrendingDown size={20} />
            </div>
            <p className="text-3xl font-bold">
              {summary.weightChange !== null
                ? `${summary.weightChange > 0 ? '+' : ''}${summary.weightChange.toFixed(1)} kg`
                : 'N/A'}
            </p>
            <p className="text-xs opacity-75 mt-1">since first photo</p>
          </motion.div>
        </div>
      )}

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-12 text-center"
        >
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Progress Photos Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your transformation by uploading your first progress photo!
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition"
          >
            <Plus className="inline mr-2" size={20} />
            Add Your First Photo
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedPhoto(photo)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card overflow-hidden cursor-pointer group"
            >
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                <img
                  src={photo.photoUrl}
                  alt={`Progress ${photo.date}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Calendar className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(photo.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  {photo.weight && (
                    <span className="text-sm text-primary font-medium">
                      {photo.weight} kg
                    </span>
                  )}
                </div>
                {photo.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {photo.notes}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {new Date(selectedPhoto.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDelete(selectedPhoto)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition text-red-600"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={`Progress ${selectedPhoto.date}`}
                  className="w-full max-h-96 object-contain rounded-xl mb-6"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weight */}
                  {selectedPhoto.weight && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <TrendingDown className="mr-2 text-primary" size={18} />
                        Weight
                      </h4>
                      <p className="text-2xl font-bold text-primary">{selectedPhoto.weight} kg</p>
                    </div>
                  )}

                  {/* Measurements */}
                  {selectedPhoto.measurements && Object.values(selectedPhoto.measurements).some(v => v !== null) && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Ruler className="mr-2 text-primary" size={18} />
                        Measurements
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedPhoto.measurements.chest && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Chest:</span>
                            <span className="font-semibold">{selectedPhoto.measurements.chest} cm</span>
                          </div>
                        )}
                        {selectedPhoto.measurements.waist && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Waist:</span>
                            <span className="font-semibold">{selectedPhoto.measurements.waist} cm</span>
                          </div>
                        )}
                        {selectedPhoto.measurements.hips && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Hips:</span>
                            <span className="font-semibold">{selectedPhoto.measurements.hips} cm</span>
                          </div>
                        )}
                        {selectedPhoto.measurements.arms && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Arms:</span>
                            <span className="font-semibold">{selectedPhoto.measurements.arms} cm</span>
                          </div>
                        )}
                        {selectedPhoto.measurements.thighs && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Thighs:</span>
                            <span className="font-semibold">{selectedPhoto.measurements.thighs} cm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedPhoto.notes && (
                  <div className="mt-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                    <p className="text-gray-700 dark:text-gray-300">{selectedPhoto.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowUploadModal(false);
              resetUploadForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Upload Progress Photo</h2>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Preview */}
                {uploadForm.previewUrl && (
                  <div className="mb-6">
                    <img
                      src={uploadForm.previewUrl}
                      alt="Preview"
                      className="w-full max-h-64 object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={uploadForm.date}
                    onChange={(e) => setUploadForm({...uploadForm, date: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Weight */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={uploadForm.weight}
                    onChange={(e) => setUploadForm({...uploadForm, weight: e.target.value})}
                    placeholder="70.5"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Measurements */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Measurements (cm) - Optional
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={uploadForm.measurements.chest}
                      onChange={(e) => setUploadForm({
                        ...uploadForm,
                        measurements: {...uploadForm.measurements, chest: e.target.value}
                      })}
                      placeholder="Chest"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={uploadForm.measurements.waist}
                      onChange={(e) => setUploadForm({
                        ...uploadForm,
                        measurements: {...uploadForm.measurements, waist: e.target.value}
                      })}
                      placeholder="Waist"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={uploadForm.measurements.hips}
                      onChange={(e) => setUploadForm({
                        ...uploadForm,
                        measurements: {...uploadForm.measurements, hips: e.target.value}
                      })}
                      placeholder="Hips"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={uploadForm.measurements.arms}
                      onChange={(e) => setUploadForm({
                        ...uploadForm,
                        measurements: {...uploadForm.measurements, arms: e.target.value}
                      })}
                      placeholder="Arms"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes - Optional
                  </label>
                  <textarea
                    value={uploadForm.notes}
                    onChange={(e) => setUploadForm({...uploadForm, notes: e.target.value})}
                    placeholder="How are you feeling? Any observations?"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploading || !uploadForm.file}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader className="animate-spin inline mr-2" size={20} />
                        Uploading...
                      </>
                    ) : (
                      'Upload Photo'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      resetUploadForm();
                    }}
                    disabled={uploading}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProgressPhotos;
