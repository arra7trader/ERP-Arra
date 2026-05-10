'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { MarketingCampaign } from '@/types';

const platformIcons: Record<string, string> = {
  youtube: '📺',
  instagram: '📷',
  tiktok: '🎵',
  twitter: '🐦',
  facebook: '👍',
};

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  scheduled: 'bg-blue-100 text-blue-800',
  published: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
};

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const user = await api.getMe();
      setUserId(user.id);
      const data = await api.getCampaigns(user.id);
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCopy = async (campaignId: string) => {
    if (!userId) return;
    setGeneratingAI(campaignId);
    try {
      await api.generateMarketingCopy(userId, campaignId);
      loadData();
    } catch (error) {
      console.error('Failed to generate copy:', error);
    } finally {
      setGeneratingAI(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketing & Distribusi</h1>
        <p className="text-gray-600">Kelola kampanye promosi dengan AI copywriting</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-600">Total Kampanye</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-600">Draft</p>
          <p className="text-2xl font-bold text-gray-600">{campaigns.filter(c => c.status === 'draft').length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-600">Terjadwal</p>
          <p className="text-2xl font-bold text-blue-600">{campaigns.filter(c => c.status === 'scheduled').length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <p className="text-sm text-gray-600">Published</p>
          <p className="text-2xl font-bold text-green-600">{campaigns.filter(c => c.status === 'published').length}</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{platformIcons[campaign.platform] || '📢'}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-500">{campaign.video?.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">{campaign.platform}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{campaign.campaignType}</span>
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[campaign.status]}`}>{campaign.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {campaign.scheduledDate && (
                    <p className="text-sm text-gray-600">
                      Jadwal: {new Date(campaign.scheduledDate).toLocaleDateString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              {/* Caption */}
              {campaign.caption && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{campaign.caption}</p>
                  {campaign.hashtags && (
                    <p className="text-sm text-blue-600 mt-2">{campaign.hashtags}</p>
                  )}
                </div>
              )}

              {/* AI Generated Copy */}
              {campaign.aiGeneratedCopy && (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-700">AI Generated Copy</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{campaign.aiGeneratedCopy}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleGenerateCopy(campaign.id)}
                  disabled={generatingAI === campaign.id}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {generatingAI === campaign.id ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Generating...</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Generate AI Copy</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada kampanye</h3>
          <p className="text-gray-500">Kampanye marketing akan muncul setelah Anda membuat proyek video</p>
        </div>
      )}
    </div>
  );
}
