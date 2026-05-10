'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Video } from '@/types';

const statusColors: Record<string, string> = {
  ideation: 'bg-gray-100 text-gray-800',
  pre_production: 'bg-blue-100 text-blue-800',
  production: 'bg-yellow-100 text-yellow-800',
  post_production: 'bg-purple-100 text-purple-800',
  review: 'bg-orange-100 text-orange-800',
  published: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  ideation: 'Ideasi',
  pre_production: 'Pra-Produksi',
  production: 'Produksi',
  post_production: 'Pasca-Produksi',
  review: 'Review',
  published: 'Tayang',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-600',
  high: 'bg-orange-100 text-orange-600',
  urgent: 'bg-red-100 text-red-600',
};

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    concept: '',
    category: '',
    duration: 15,
    priority: 'medium',
    tags: '',
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const user = await api.getMe();
      setUserId(user.id);
      const filters: Record<string, string> = {};
      if (filter.status) filters.status = filter.status;
      if (filter.priority) filters.priority = filter.priority;
      const data = await api.getVideos(user.id, filters);
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    try {
      await api.createVideo(userId, { ...formData, requestAISuggestion: true });
      setShowModal(false);
      setFormData({ title: '', description: '', concept: '', category: '', duration: 15, priority: 'medium', tags: '' });
      loadData();
    } catch (error) {
      console.error('Failed to create video:', error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.updateVideoStatus(id, status);
      loadData();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Pipeline</h1>
          <p className="text-gray-600">Kelola proyek video dari ideasi hingga tayang</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Video Baru
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select
          value={filter.priority}
          onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
          className="px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Semua Prioritas</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Video Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${priorityColors[video.priority]}`}>
                  {video.priority}
                </span>
              </div>
              
              {video.concept && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.concept}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[video.status]}`}>
                  {statusLabels[video.status]}
                </span>
                {video.category && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {video.category}
                  </span>
                )}
                {video.duration && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {video.duration} menit
                  </span>
                )}
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-1 mb-4">
                {['ideation', 'pre_production', 'production', 'post_production', 'review', 'published'].map((step, i) => {
                  const steps = ['ideation', 'pre_production', 'production', 'post_production', 'review', 'published'];
                  const currentIndex = steps.indexOf(video.status);
                  const isCompleted = i <= currentIndex;
                  return (
                    <div
                      key={step}
                      className={`flex-1 h-1.5 rounded-full ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}
                    />
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <select
                  value={video.status}
                  onChange={(e) => handleStatusChange(video.id, e.target.value)}
                  className="text-sm border rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(statusLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <a
                  href={`/videos/${video.id}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Detail →
                </a>
              </div>
            </div>

            {/* Budget Summary */}
            {video.budgets && video.budgets.length > 0 && (
              <div className="px-5 py-3 bg-gray-50 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium text-gray-900">
                    Rp {video.budgets.reduce((sum, b) => sum + b.plannedAmount, 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada video</h3>
          <p className="text-gray-500 mb-4">Mulai dengan membuat proyek video pertama Anda</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buat Video Baru
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Buat Video Baru</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Video *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan judul video"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konsep/Ide</label>
                <textarea
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Jelaskan konsep atau ide video"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Education, Tech, dll"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durasi (menit)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={120}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="tutorial, ai, tech (pisahkan dengan koma)"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Buat & Minta Saran AI
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
