'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Eye, 
  Flag, 
  Trash2, 
  Download,
  RefreshCw,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { cn, formatPercentage, formatTimeAgo, getPercentageColor, generateAvatarInitials } from '@/lib/utils';
import type { Submission, User } from '@/lib/supabase';

interface AdminPanelProps {
  submissions: Submission[];
  users: User[];
  isAdmin: boolean;
}

interface CommunityStats {
  totalSubmissions: number;
  totalUsers: number;
  averageReturn: number;
  topPerformer: { username: string; percentage: number } | null;
  submissionRate: number;
  flaggedSubmissions: number;
}

interface ProofModalProps {
  isOpen: boolean;
  submission: Submission | null;
  onClose: () => void;
  onFlag: (submissionId: string) => void;
  onDelete: (submissionId: string) => void;
}

function ProofModal({ isOpen, submission, onClose, onFlag, onDelete }: ProofModalProps) {
  if (!isOpen || !submission) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-robinhood-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-robinhood-h2 text-robinhood-text-primary">
                Submission Review
              </h2>
              <p className="text-robinhood-text-secondary mt-1">
                {submission.user?.username} • {formatTimeAgo(new Date(submission.submitted_at))}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6 text-robinhood-text-secondary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Submission Details */}
            <div className="space-y-4">
              <div className="bg-robinhood-border rounded-lg p-4">
                <h3 className="text-robinhood-text-primary font-semibold mb-3">
                  Submission Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-robinhood-text-secondary">Percentage Gain:</span>
                    <span className={cn(
                      'font-semibold',
                      getPercentageColor(submission.percentage_gain)
                    )}>
                      {formatPercentage(submission.percentage_gain)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-robinhood-text-secondary">Points:</span>
                    <span className="text-robinhood-text-primary font-semibold">
                      {submission.points}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-robinhood-text-secondary">Date:</span>
                    <span className="text-robinhood-text-primary">
                      {new Date(submission.submission_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-robinhood-text-secondary">Status:</span>
                    <span className={cn(
                      'font-semibold',
                      submission.is_flagged ? 'text-robinhood-red' : 'text-robinhood-green'
                    )}>
                      {submission.is_flagged ? 'Flagged' : 'Approved'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => onFlag(submission.id)}
                  className={cn(
                    'flex-1 py-2 px-4 rounded-lg font-semibold transition-colors',
                    submission.is_flagged
                      ? 'bg-robinhood-green text-robinhood-text-primary hover:bg-robinhood-green/90'
                      : 'bg-robinhood-red text-robinhood-text-primary hover:bg-robinhood-red/90'
                  )}
                >
                  {submission.is_flagged ? 'Unflag' : 'Flag'}
                </button>
                <button
                  onClick={() => onDelete(submission.id)}
                  className="flex-1 py-2 px-4 bg-robinhood-border text-robinhood-text-primary rounded-lg font-semibold hover:bg-robinhood-hover transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Proof Image */}
            <div>
              <h3 className="text-robinhood-text-primary font-semibold mb-3">
                Proof Document
              </h3>
              {submission.proof_url ? (
                <div className="bg-robinhood-border rounded-lg p-4">
                  <img
                    src={submission.proof_url}
                    alt="Proof document"
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              ) : (
                <div className="bg-robinhood-border rounded-lg p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-robinhood-text-secondary mx-auto mb-3" />
                  <p className="text-robinhood-text-secondary">
                    No proof document provided
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminPanel({ submissions, users, isAdmin }: AdminPanelProps) {
  const [stats, setStats] = useState<CommunityStats>({
    totalSubmissions: 0,
    totalUsers: 0,
    averageReturn: 0,
    topPerformer: null,
    submissionRate: 0,
    flaggedSubmissions: 0,
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [proofModal, setProofModal] = useState<{ isOpen: boolean; submission: Submission | null }>({
    isOpen: false,
    submission: null,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    calculateStats();
    generateChartData();
  }, [submissions, users, selectedDate]);

  const calculateStats = () => {
    const todaySubmissions = submissions.filter(s => s.submission_date === selectedDate);
    const totalSubmissions = todaySubmissions.length;
    const totalUsers = users.length;
    const averageReturn = totalSubmissions > 0 
      ? todaySubmissions.reduce((sum, s) => sum + s.percentage_gain, 0) / totalSubmissions 
      : 0;
    
    const topSubmission = todaySubmissions.reduce((max, s) => 
      s.percentage_gain > max.percentage_gain ? s : max, 
      todaySubmissions[0] || { percentage_gain: 0, user: { username: 'N/A' } }
    );
    
    const topPerformer = topSubmission ? {
      username: topSubmission.user?.username || 'Unknown',
      percentage: topSubmission.percentage_gain
    } : null;

    const submissionRate = totalUsers > 0 ? (totalSubmissions / totalUsers) * 100 : 0;
    const flaggedSubmissions = todaySubmissions.filter(s => s.is_flagged).length;

    setStats({
      totalSubmissions,
      totalUsers,
      averageReturn,
      topPerformer,
      submissionRate,
      flaggedSubmissions,
    });
  };

  const generateChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySubmissions = submissions.filter(s => s.submission_date === dateStr);
      const averageGain = daySubmissions.length > 0 
        ? daySubmissions.reduce((sum, s) => sum + s.percentage_gain, 0) / daySubmissions.length 
        : 0;

      last7Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: daySubmissions.length,
        averageGain,
      });
    }

    setChartData(last7Days);
  };

  const handleFlagSubmission = async (submissionId: string) => {
    // TODO: Implement flag/unflag API call
    console.log('Flagging submission:', submissionId);
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    // TODO: Implement delete API call
    console.log('Deleting submission:', submissionId);
    setProofModal({ isOpen: false, submission: null });
  };

  const handleExportData = () => {
    const todaySubmissions = submissions.filter(s => s.submission_date === selectedDate);
    const csvData = todaySubmissions.map((submission, index) => ({
      Rank: index + 1,
      Username: submission.user?.username || 'Unknown',
      Percentage: submission.percentage_gain,
      Points: submission.points,
      TimeSubmitted: new Date(submission.submitted_at).toISOString(),
      ProofURL: submission.proof_url || 'N/A',
    }));

    const csv = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse-trades-leaderboard-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleResetLeaderboard = async () => {
    if (confirm('Are you sure you want to reset today\'s leaderboard? This action cannot be undone.')) {
      // TODO: Implement reset API call
      console.log('Resetting leaderboard for:', selectedDate);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-robinhood-black flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-robinhood-red mx-auto mb-4" />
          <h1 className="text-robinhood-h1 text-robinhood-text-primary mb-2">
            Access Denied
          </h1>
          <p className="text-robinhood-text-secondary">
            You don't have admin privileges to access this panel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-robinhood-black p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-robinhood-h1 text-robinhood-text-primary">
                Admin Panel
              </h1>
              <p className="text-robinhood-text-secondary mt-1">
                Community management and submission review
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-robinhood-input-bg border border-robinhood-border rounded-lg px-3 py-2 text-robinhood-text-primary"
              />
              <button
                onClick={handleExportData}
                className="flex items-center space-x-2 bg-robinhood-green hover:bg-robinhood-green/90 text-robinhood-text-primary px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-4 h-4 text-robinhood-text-secondary" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Total Users
              </span>
            </div>
            <div className="text-2xl font-bold text-robinhood-text-primary">
              {stats.totalUsers}
            </div>
          </div>

          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-robinhood-text-secondary" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Submissions
              </span>
            </div>
            <div className="text-2xl font-bold text-robinhood-text-primary">
              {stats.totalSubmissions}
            </div>
            <div className="text-sm text-robinhood-text-secondary">
              {stats.submissionRate.toFixed(1)}% rate
            </div>
          </div>

          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-robinhood-green" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Avg Return
              </span>
            </div>
            <div className={cn(
              "text-2xl font-bold",
              getPercentageColor(stats.averageReturn)
            )}>
              {formatPercentage(stats.averageReturn)}
            </div>
          </div>

          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Flag className="w-4 h-4 text-robinhood-red" />
              <span className="text-robinhood-caption text-robinhood-text-secondary">
                Flagged
              </span>
            </div>
            <div className="text-2xl font-bold text-robinhood-text-primary">
              {stats.flaggedSubmissions}
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Submission Count Chart */}
          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6">
            <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-4">
              Daily Submissions
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
                  <XAxis dataKey="date" stroke="#9D9D9D" fontSize={12} />
                  <YAxis stroke="#9D9D9D" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1C1E',
                      border: '1px solid #2C2C2E',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                    }}
                  />
                  <Bar dataKey="submissions" fill="#00C805" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Return Chart */}
          <div className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6">
            <h3 className="text-robinhood-h2 text-robinhood-text-primary mb-4">
              Average Returns
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" />
                  <XAxis dataKey="date" stroke="#9D9D9D" fontSize={12} />
                  <YAxis stroke="#9D9D9D" fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1C1E',
                      border: '1px solid #2C2C2E',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                    }}
                    formatter={(value: number) => [formatPercentage(value), 'Avg Return']}
                  />
                  <Line
                    type="monotone"
                    dataKey="averageGain"
                    stroke="#00C805"
                    strokeWidth={2}
                    dot={{ fill: '#00C805', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Submissions Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-robinhood-card-bg rounded-robinhood shadow-robinhood p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-robinhood-h2 text-robinhood-text-primary">
              Submissions Review
            </h2>
            <button
              onClick={handleResetLeaderboard}
              className="flex items-center space-x-2 bg-robinhood-red hover:bg-robinhood-red/90 text-robinhood-text-primary px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Leaderboard</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-robinhood-border">
                  <th className="text-left py-3 px-4 text-robinhood-text-secondary font-medium">
                    Time
                  </th>
                  <th className="text-left py-3 px-4 text-robinhood-text-secondary font-medium">
                    User
                  </th>
                  <th className="text-left py-3 px-4 text-robinhood-text-secondary font-medium">
                    % Gain
                  </th>
                  <th className="text-left py-3 px-4 text-robinhood-text-secondary font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-robinhood-text-secondary font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {submissions
                  .filter(s => s.submission_date === selectedDate)
                  .sort((a, b) => b.percentage_gain - a.percentage_gain)
                  .map((submission, index) => (
                    <tr key={submission.id} className="border-b border-robinhood-border hover:bg-robinhood-hover">
                      <td className="py-3 px-4 text-robinhood-text-primary">
                        {formatTimeAgo(new Date(submission.submitted_at))}
                      </td>
                      <td className="py-3 px-4 text-robinhood-text-primary">
                        {submission.user?.username || 'Unknown'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'font-semibold',
                          getPercentageColor(submission.percentage_gain)
                        )}>
                          {formatPercentage(submission.percentage_gain)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                          submission.is_flagged
                            ? 'bg-robinhood-red/20 text-robinhood-red'
                            : 'bg-robinhood-green/20 text-robinhood-green'
                        )}>
                          {submission.is_flagged ? (
                            <>
                              <Flag className="w-3 h-3" />
                              <span>Flagged</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              <span>Approved</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setProofModal({ isOpen: true, submission })}
                          className="p-2 hover:bg-robinhood-border rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-robinhood-text-secondary" />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Proof Modal */}
        <ProofModal
          isOpen={proofModal.isOpen}
          submission={proofModal.submission}
          onClose={() => setProofModal({ isOpen: false, submission: null })}
          onFlag={handleFlagSubmission}
          onDelete={handleDeleteSubmission}
        />
      </div>
    </div>
  );
}
