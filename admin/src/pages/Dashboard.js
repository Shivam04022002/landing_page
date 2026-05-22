import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  Calendar,
  TrendingUp,
  Download,
  Search,
  Filter,
  Trash2,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    todayLeads: 0,
    monthLeads: 0
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    source: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/leads`, {
        params: {
          page: currentPage,
          limit: 20,
          search: searchQuery,
          ...filters
        }
      });
      
      setLeads(response.data.data);
      setTotalPages(response.data.totalPages);
      setStats({
        totalLeads: response.data.total,
        todayLeads: response.data.todayLeads,
        monthLeads: response.data.monthLeads
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLeads();
  };

  const handleExport = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      
      const response = await axios.get(`${API_URL}/leads/export`, {
        params: filters,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Export downloaded successfully!', { id: 'export' });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export leads', { id: 'export' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;

    try {
      await axios.delete(`${API_URL}/leads/${id}`);
      toast.success('Lead deleted successfully');
      fetchLeads();
      if (selectedLead?._id === id) {
        setIsModalOpen(false);
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete lead');
    }
  };

  const viewLeadDetails = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Manage and track your leads</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Today's Leads"
          value={stats.todayLeads}
          icon={Calendar}
          color="bg-green-500"
        />
        <StatCard
          title="This Month"
          value={stats.monthLeads}
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, business, or phone..."
                className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </form>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                  : 'border-dark-600 text-gray-400 hover:text-white'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">All Sources</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Organic">Organic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Leads Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Business</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Owner</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Phone</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Loan Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Source</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-gray-400">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {format(new Date(lead.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm text-white font-medium">
                      {lead.businessName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {lead.ownerName}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {lead.phoneNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {lead.desiredLoanAmount.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                        lead.source === 'Google Ads' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewLeadDetails(lead)}
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lead._id)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && leads.length > 0 && (
          <div className="flex items-center justify-between px-4 py-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Showing {(currentPage - 1) * 20 + 1} - {Math.min(currentPage * 20, stats.totalLeads)} of {stats.totalLeads} leads
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-white/5 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Modal */}
      {isModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-800/95 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Lead Details</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Business Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Business Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Business Name</p>
                    <p className="text-white font-medium">{selectedLead.businessName}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Owner Name</p>
                    <p className="text-white font-medium">{selectedLead.ownerName}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Phone Number</p>
                    <p className="text-white font-medium">{selectedLead.phoneNumber}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">PIN Code</p>
                    <p className="text-white font-medium">{selectedLead.pinCode}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">State</p>
                    <p className="text-white font-medium">{selectedLead.state}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">District</p>
                    <p className="text-white font-medium">{selectedLead.district}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">City</p>
                    <p className="text-white font-medium">{selectedLead.city}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-white font-medium">{selectedLead.country}</p>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Loan Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Desired Loan Amount</p>
                    <p className="text-white font-medium flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {selectedLead.desiredLoanAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Use of Funds</p>
                    <p className="text-white font-medium">{selectedLead.useOfFunds}</p>
                  </div>
                </div>
              </div>

              {/* Financial Health */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Financial Health</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Monthly Sale</p>
                    <p className="text-white font-medium flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {selectedLead.averageMonthlySale.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Business Vintage</p>
                    <p className="text-white font-medium">{selectedLead.businessVintage}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Credit Score</p>
                    <p className="text-white font-medium">{selectedLead.creditScore}</p>
                  </div>
                </div>
              </div>

              {/* Source Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-3">Lead Source</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Source</p>
                    <p className="text-white font-medium">{selectedLead.source}</p>
                  </div>
                  <div className="p-3 bg-dark-800/50 rounded-lg">
                    <p className="text-xs text-gray-500">Submitted On</p>
                    <p className="text-white font-medium">
                      {format(new Date(selectedLead.createdAt), 'PPP p')}
                    </p>
                  </div>
                  {selectedLead.utmSource && (
                    <div className="p-3 bg-dark-800/50 rounded-lg">
                      <p className="text-xs text-gray-500">UTM Source</p>
                      <p className="text-white font-medium">{selectedLead.utmSource}</p>
                    </div>
                  )}
                  {selectedLead.utmCampaign && (
                    <div className="p-3 bg-dark-800/50 rounded-lg">
                      <p className="text-xs text-gray-500">UTM Campaign</p>
                      <p className="text-white font-medium">{selectedLead.utmCampaign}</p>
                    </div>
                  )}
                  {selectedLead.device && (
                    <div className="p-3 bg-dark-800/50 rounded-lg">
                      <p className="text-xs text-gray-500">Device</p>
                      <p className="text-white font-medium capitalize">{selectedLead.device}</p>
                    </div>
                  )}
                  {selectedLead.browser && (
                    <div className="p-3 bg-dark-800/50 rounded-lg">
                      <p className="text-xs text-gray-500">Browser</p>
                      <p className="text-white font-medium">{selectedLead.browser}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => handleDelete(selectedLead._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Lead
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-dark-600 text-gray-400 hover:text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
