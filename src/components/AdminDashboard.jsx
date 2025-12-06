import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export default function AdminDashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const token = localStorage.getItem('mortals.auth.token');

  useEffect(() => {
    fetchStats();
    fetchReports();
  }, [selectedTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/moderation/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/moderation/admin/reports?status=${selectedTab}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId, status, adminNotes = '') => {
    try {
      setProcessingId(reportId);
      const response = await fetch(`${API_URL}/moderation/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNotes })
      });

      if (!response.ok) throw new Error('Failed to update report');
      
      fetchReports();
      fetchStats();
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-amber-300">
          <h2 className="text-xl font-bold text-amber-900">🛡️ Admin Dashboard</h2>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-4 p-4 bg-amber-100/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">{stats.total_users}</div>
              <div className="text-sm text-amber-700">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">{stats.total_posts}</div>
              <div className="text-sm text-amber-700">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.pending_reports}</div>
              <div className="text-sm text-amber-700">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.resolved_reports}</div>
              <div className="text-sm text-amber-700">Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">{stats.total_blocks}</div>
              <div className="text-sm text-amber-700">Blocks</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b-2 border-amber-300">
          {['pending', 'reviewed', 'resolved', 'dismissed'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-3 font-semibold transition ${
                selectedTab === tab
                  ? 'bg-amber-200 text-amber-900 border-b-4 border-amber-600'
                  : 'text-amber-700 hover:bg-amber-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-amber-700 py-8">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center text-amber-700 py-8">
              No {selectedTab} reports
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map(report => (
                <div
                  key={report.id}
                  className="bg-white border-2 border-amber-300 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-amber-900">
                        Report #{report.id}
                      </div>
                      <div className="text-xs text-amber-600">
                        {formatDate(report.created_at)} by {report.reporter_username}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-semibold text-amber-900 mb-1">
                      {report.reported_username ? (
                        <>👤 Reported User: <span className="text-red-600">{report.reported_username}</span></>
                      ) : (
                        <>📝 Reported Post ID: {report.reported_post_id}</>
                      )}
                    </div>
                    
                    {report.post_content && (
                      <div className="text-sm text-amber-800 bg-amber-50 p-2 rounded mb-2 italic">
                        "{report.post_content.substring(0, 200)}{report.post_content.length > 200 ? '...' : ''}"
                      </div>
                    )}

                    <div className="text-sm text-amber-900">
                      <span className="font-semibold">Reason:</span> {report.reason}
                    </div>

                    {report.admin_notes && (
                      <div className="text-sm text-amber-700 mt-2">
                        <span className="font-semibold">Admin Notes:</span> {report.admin_notes}
                      </div>
                    )}
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const notes = prompt('Add admin notes (optional):');
                          if (notes !== null) {
                            updateReport(report.id, 'reviewed', notes);
                          }
                        }}
                        disabled={processingId === report.id}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-semibold"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Resolution notes (optional):');
                          if (notes !== null) {
                            updateReport(report.id, 'resolved', notes);
                          }
                        }}
                        disabled={processingId === report.id}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-semibold"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Dismiss this report?')) {
                            updateReport(report.id, 'dismissed');
                          }
                        }}
                        disabled={processingId === report.id}
                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 text-sm font-semibold"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
