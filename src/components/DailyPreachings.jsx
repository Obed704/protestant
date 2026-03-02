import React, { useState, useEffect } from "react";
import { 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaUser, 
  FaHeart, 
  FaStar, 
  FaComment, 
  FaShare, 
  FaBible, 
  FaChevronRight, 
  FaTimes, 
  FaExternalLinkAlt,
  FaPrayingHands,
  FaExpand,
  FaBookOpen,
  FaWindowClose,
  FaBookmark,
  FaPrint,
  FaFacebook,
  FaTwitter,
  FaWhatsapp,
  FaCopy,
  FaSpinner
} from "react-icons/fa";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import axios from "axios";

// Use your existing BASE_URL from .env → exposed with VITE_ prefix for frontend
const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const API_ENDPOINT = `${API_BASE_URL}/api/dailyPreachingsWord`;

const DailyPreachingsPage = () => {
  const [preachings, setPreachings] = useState([]);
  const [filteredPreachings, setFilteredPreachings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPreaching, setSelectedPreaching] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser] = useState('user123'); // Replace with actual user authentication
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPreacher, setSelectedPreacher] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(API_ENDPOINT);
        setPreachings(response.data);
        setFilteredPreachings(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load preachings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let results = [...preachings];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(preaching =>
        preaching.description.toLowerCase().includes(term) ||
        preaching.preacher.toLowerCase().includes(term) ||
        preaching.day.toLowerCase().includes(term) ||
        preaching.verses.some(verse => verse.toLowerCase().includes(term))
      );
    }

    // Preacher filter
    if (selectedPreacher !== 'all') {
      results = results.filter(preaching => preaching.preacher === selectedPreacher);
    }

    // Day filter
    if (selectedDay !== 'all') {
      results = results.filter(preaching => preaching.day === selectedDay);
    }

    // Sort
    if (sortBy === 'date-desc') {
      results.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-asc') {
      results.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === 'day') {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      results.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));
    }

    setFilteredPreachings(results);
  }, [searchTerm, selectedPreacher, selectedDay, sortBy, preachings]);

  // Get unique preachers and days for filters
  const preachers = [...new Set(preachings.map(p => p.preacher))];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Format date with special handling
  const formatDateDisplay = (dateString) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      if (isTomorrow(date)) return 'Tomorrow';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get day badge color
  const getDayColor = (day) => {
    const colors = {
      Monday: 'bg-blue-100 text-blue-800 border border-blue-200',
      Tuesday: 'bg-purple-100 text-purple-800 border border-purple-200',
      Wednesday: 'bg-green-100 text-green-800 border border-green-200',
      Thursday: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      Friday: 'bg-red-100 text-red-800 border border-red-200',
      Saturday: 'bg-indigo-100 text-indigo-800 border border-indigo-200',
      Sunday: 'bg-pink-100 text-pink-800 border border-pink-200',
    };
    return colors[day] || 'bg-gray-100 text-gray-800';
  };

  // Handle like/unlike
  const handleLike = async (id) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/like`, { user: currentUser });
      
      // Update local state
      setPreachings(prev => prev.map(p => 
        p._id === id ? { ...p, likes: response.data } : p
      ));
      
      if (selectedPreaching?._id === id) {
        setSelectedPreaching(prev => ({ 
          ...prev, 
          likes: response.data 
        }));
      }
    } catch (err) {
      console.error('Error liking preaching:', err);
      alert('Failed to update like. Please try again.');
    }
  };

  // Handle favorite/unfavorite
  const handleFavorite = async (id) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/favorite`, { user: currentUser });
      
      setPreachings(prev => prev.map(p => 
        p._id === id ? { ...p, favorites: response.data } : p
      ));
      
      if (selectedPreaching?._id === id) {
        setSelectedPreaching(prev => ({ 
          ...prev, 
          favorites: response.data 
        }));
      }
    } catch (err) {
      console.error('Error favoriting preaching:', err);
      alert('Failed to update favorite. Please try again.');
    }
  };

  // Handle add comment
  const handleAddComment = async (id, text) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/comment`, { 
        user: currentUser, 
        text 
      });
      
      setPreachings(prev => prev.map(p => 
        p._id === id ? { ...p, comments: response.data } : p
      ));
      
      if (selectedPreaching?._id === id) {
        setSelectedPreaching(prev => ({ 
          ...prev, 
          comments: response.data 
        }));
      }
      
      return response.data;
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
      return null;
    }
  };

  // Handle reply to comment
  const handleReplyToComment = async (id, commentId, text) => {
    try {
      const response = await axios.post(`${API_ENDPOINT}/${id}/comment/${commentId}/reply`, { 
        user: currentUser, 
        text 
      });
      
      // Update local state (this is complex since we need to update nested replies)
      const updatedPreachings = preachings.map(p => {
        if (p._id === id) {
          const updatedComments = p.comments.map(comment => {
            if (comment._id === commentId) {
              return { ...comment, replies: response.data };
            }
            return comment;
          });
          return { ...p, comments: updatedComments };
        }
        return p;
      });
      
      setPreachings(updatedPreachings);
      
      if (selectedPreaching?._id === id) {
        const updatedSelected = {
          ...selectedPreaching,
          comments: selectedPreaching.comments.map(comment => {
            if (comment._id === commentId) {
              return { ...comment, replies: response.data };
            }
            return comment;
          })
        };
        setSelectedPreaching(updatedSelected);
      }
      
      return response.data;
    } catch (err) {
      console.error('Error replying to comment:', err);
      alert('Failed to add reply. Please try again.');
      return null;
    }
  };

  // Open modal with selected preaching
  const openModal = async (preaching) => {
    try {
      // Fetch full preaching data if needed
      const response = await axios.get(`${API_ENDPOINT}/${preaching._id}`);
      setSelectedPreaching(response.data);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    } catch (err) {
      console.error('Error fetching preaching details:', err);
      setSelectedPreaching(preaching);
      setIsModalOpen(true);
      document.body.style.overflow = 'hidden';
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPreaching(null);
    document.body.style.overflow = 'auto';
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPreacher('all');
    setSelectedDay('all');
    setSortBy('date-desc');
  };

  // Share functionality
  const handleShare = (platform) => {
    if (!selectedPreaching) return;
    
    const text = `${selectedPreaching.day}'s Preaching: ${selectedPreaching.description}`;
    const url = window.location.href;
    
    let shareUrl = '';
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    if (!selectedPreaching) return;
    
    const text = `${selectedPreaching.day}'s Preaching\nPreacher: ${selectedPreaching.preacher}\nDate: ${formatDateDisplay(selectedPreaching.date)}\n\n${selectedPreaching.description}\n\nVerses: ${selectedPreaching.verses.join(', ')}`;
    
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  // Check if user has liked/favorited
  const hasLiked = (preaching) => preaching.likes?.includes(currentUser);
  const hasFavorited = (preaching) => preaching.favorites?.includes(currentUser);

  // Calculate stats
  const totalVerses = preachings.reduce((acc, p) => acc + p.verses.length, 0);
  const avgVerses = preachings.length > 0 ? (totalVerses / preachings.length).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading daily preachings...</p>
        </div>
      </div>
    );
  }

  if (error && preachings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Content</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500 mb-4">
            Error Please Try Again
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Custom CSS */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
        
        .font-inter { font-family: 'Inter', sans-serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideIn {
          from { transform: translateY(50px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5);
          animation: modalFadeIn 0.3s ease-out;
        }
        
        .modal-content {
          animation: modalSlideIn 0.4s ease-out;
        }
        
        .comment-section {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>

      {/* Modal Popup */}
      {isModalOpen && selectedPreaching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
          <div className="absolute inset-0" onClick={closeModal}></div>
          
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl modal-content">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${getDayColor(selectedPreaching.day)}`}>
                    {selectedPreaching.day.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-gray-900">
                      {selectedPreaching.day}'s Message
                    </h2>
                    <p className="text-gray-600">{formatDateDisplay(selectedPreaching.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Copy to clipboard"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Print"
                  >
                    <FaPrint />
                  </button>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    title="Close"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>
              
              {/* Preacher Info */}
              <div className="flex items-center space-x-3 mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  <FaUser className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedPreaching.preacher}</p>
                  <p className="text-sm text-gray-600">Preacher</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message</h3>
                <p className="text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                  "{selectedPreaching.description}"
                </p>
              </div>

              {/* Full Content (if available) */}
              {selectedPreaching.fullContent && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <FaBookOpen className="mr-2 text-blue-600" />
                    Full Teaching
                  </h3>
                  <div className="prose prose-lg max-w-none">
                    {selectedPreaching.fullContent.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Verses */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaBible className="mr-2 text-blue-600" />
                  Scripture References
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedPreaching.verses.map((verse, idx) => (
                    <a
                      key={idx}
                      href={`https://www.biblegateway.com/passage/?search=${verse}&version=NIV`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-50 p-4 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors group"
                    >
                      <div className="font-bold text-blue-800 mb-1">{verse}</div>
                      <div className="text-sm text-gray-600 flex items-center">
                        Read full passage
                        <FaExternalLinkAlt className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Comments Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FaComment className="mr-2 text-blue-600" />
                  Comments ({selectedPreaching.comments?.length || 0})
                </h3>
                
                <div className="comment-section mb-4">
                  {selectedPreaching.comments?.length > 0 ? (
                    <div className="space-y-4">
                      {selectedPreaching.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">{comment.user}</span>
                            <span className="text-sm text-gray-500">
                              {format(new Date(comment.createdAt || Date.now()), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                          
                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-300">
                              {comment.replies.map((reply, replyIdx) => (
                                <div key={replyIdx} className="mt-2">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm text-gray-900">{reply.user}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(reply.createdAt || Date.now()), 'MMM dd, HH:mm')}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700">{reply.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reply Input */}
                          <div className="mt-2">
                            <button
                              onClick={() => {
                                const replyText = prompt('Enter your reply:');
                                if (replyText) {
                                  handleReplyToComment(selectedPreaching._id, comment._id, replyText);
                                }
                              }}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                  )}
                </div>
                
                {/* Add Comment Form */}
                <div className="mt-4">
                  <textarea
                    id="commentInput"
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="2"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => {
                        const input = document.getElementById('commentInput');
                        const text = input.value.trim();
                        if (text) {
                          handleAddComment(selectedPreaching._id, text);
                          input.value = '';
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(selectedPreaching._id)}
                    className={`flex items-center space-x-2 transition-colors ${hasLiked(selectedPreaching) ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
                  >
                    <FaHeart className={hasLiked(selectedPreaching) ? 'text-xl fill-current' : 'text-xl'} />
                    <span className="font-medium">{selectedPreaching.likes?.length || 0} Likes</span>
                  </button>
                  
                  <button
                    onClick={() => handleFavorite(selectedPreaching._id)}
                    className={`flex items-center space-x-2 transition-colors ${hasFavorited(selectedPreaching) ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'}`}
                  >
                    <FaStar className={hasFavorited(selectedPreaching) ? 'text-xl fill-current' : 'text-xl'} />
                    <span className="font-medium">{selectedPreaching.favorites?.length || 0} Favorites</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Share:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShare('facebook')}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Share on Facebook"
                    >
                      <FaFacebook />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="p-2 bg-blue-100 text-blue-400 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Share on Twitter"
                    >
                      <FaTwitter />
                    </button>
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="Share on WhatsApp"
                    >
                      <FaWhatsapp />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <FaBible className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-playfair font-bold text-gray-900">Daily Preachings</h1>
                
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <FaCalendarAlt />
                <span>{format(new Date(), 'MMMM dd, yyyy')}</span>
              </div>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => {
                  const todayPreaching = preachings.find(p => {
                    try {
                      return isToday(parseISO(p.date));
                    } catch {
                      return false;
                    }
                  }) || preachings[0];
                  if (todayPreaching) openModal(todayPreaching);
                }}
              >
                <FaPrayingHands />
                <span>Today's Devotion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-purple-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold mb-4">
              Daily Word for Spiritual Growth
            </h2>
            <p className="text-xl text-blue-100 mb-6">
              Real-time data from your API. Click "Read More" for detailed view with comments and interactions.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{preachings.length}</div>
                <div className="text-sm">Live Preachings</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{preachers.length}</div>
                <div className="text-sm">Preachers</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{totalVerses}</div>
                <div className="text-sm">Total Verses</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-20">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Filter Live Data</h3>
              <p className="text-gray-600">Connected with{preachings.length} preachings</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <FaFilter />
                <span>Filters</span>
                {(selectedPreacher !== 'all' || selectedDay !== 'all' || searchTerm) && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
              
              <button
                onClick={clearFilters}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                disabled={!searchTerm && selectedPreacher === 'all' && selectedDay === 'all'}
              >
                <FaTimes />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search preachings, verses, or descriptions..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preacher</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  value={selectedPreacher}
                  onChange={(e) => setSelectedPreacher(e.target.value)}
                >
                  <option value="all">All Preachers</option>
                  {preachers.map(preacher => (
                    <option key={preacher} value={preacher}>{preacher}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  <option value="all">All Days</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="day">Day of Week</option>
                </select>
              </div>
            </div>
          )}

          {/* Active filters */}
          <div className="flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-200">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-blue-900">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            {selectedPreacher !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-200">
                Preacher: {selectedPreacher}
                <button onClick={() => setSelectedPreacher('all')} className="ml-2 hover:text-purple-900">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
            {selectedDay !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 border border-green-200">
                Day: {selectedDay}
                <button onClick={() => setSelectedDay('all')} className="ml-2 hover:text-green-900">
                  <FaTimes className="text-xs" />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Showing {filteredPreachings.length} of {preachings.length} preachings
            </h3>
            <div className="text-sm text-gray-600">
              Click "Read More" to view details and comments
            </div>
          </div>
        </div>

        {/* Preachings Grid */}
        {filteredPreachings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-gray-300 text-6xl mb-4">
              <FaSearch />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No preachings found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search criteria or clear filters</p>
            <button onClick={clearFilters} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {filteredPreachings.map((preaching, index) => (
                <div
                  key={preaching._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover animate-fade-in border border-gray-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getDayColor(preaching.day)}`}>
                          {preaching.day.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-playfair font-bold text-gray-900">
                            {preaching.day}'s Word
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatDateDisplay(preaching.date)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preacher Info */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full shadow-sm">
                        <FaUser className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{preaching.preacher}</p>
                        <p className="text-sm text-gray-600">Preacher</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 pt-0">
                    <p className="text-gray-700 mb-6 leading-relaxed italic">
                      "{preaching.description}"
                    </p>

                    {/* Verses Section */}
                    <div className="mb-6">
                      <h4 className="flex items-center text-gray-900 font-semibold mb-3">
                        <FaBible className="mr-2 text-blue-600" />
                        Scripture References
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {preaching.verses.map((verse, idx) => (
                          <a
                            key={idx}
                            href={`https://www.biblegateway.com/passage/?search=${verse}&version=NIV`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-800 border border-blue-100 hover:bg-blue-100 transition-colors duration-200 group"
                          >
                            {verse}
                            <FaExternalLinkAlt className="ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <FaHeart className={hasLiked(preaching) ? 'text-red-500' : ''} />
                        <span>{preaching.likes?.length || 0} likes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaStar className={hasFavorited(preaching) ? 'text-yellow-500' : ''} />
                        <span>{preaching.favorites?.length || 0} favorites</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FaComment />
                        <span>{preaching.comments?.length || 0} comments</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-6 pt-0">
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleLike(preaching._id)}
                          className={`p-2 rounded-lg transition-colors ${hasLiked(preaching) ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:text-red-500 hover:bg-red-50'}`}
                          title={hasLiked(preaching) ? 'Unlike' : 'Like'}
                        >
                          <FaHeart className={hasLiked(preaching) ? 'fill-current' : ''} />
                        </button>
                        
                        <button
                          onClick={() => handleFavorite(preaching._id)}
                          className={`p-2 rounded-lg transition-colors ${hasFavorited(preaching) ? 'bg-yellow-50 text-yellow-600' : 'text-gray-600 hover:text-yellow-500 hover:bg-yellow-50'}`}
                          title={hasFavorited(preaching) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <FaStar className={hasFavorited(preaching) ? 'fill-current' : ''} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => openModal(preaching)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <FaExpand />
                        <span>Read More</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{preachings.length}</div>
                  <p className="text-blue-100">Total Preachings</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{preachers.length}</div>
                  <p className="text-blue-100">Different Preachers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{avgVerses}</div>
                  <p className="text-blue-100">Average Verses per Preaching</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Preachers List */}
        {preachers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Our Preachers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {preachers.map((preacher, index) => (
                <div
                  key={preacher}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer"
                  onClick={() => setSelectedPreacher(preacher)}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {preacher.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{preacher}</p>
                    <p className="text-sm text-gray-600">
                      {preachings.filter(p => p.preacher === preacher).length} preachings
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Info */}
        {/* <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">API Information</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Endpoint:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">GET {API_ENDPOINT}</code>
            </p>
            <p className="text-gray-600">
              <strong>Status:</strong> <span className="text-green-600 font-medium">Connected</span> ({preachings.length} items loaded)
            </p>
            <p className="text-gray-600">
              <strong>Features:</strong> Real-time likes, favorites, and comments with full CRUD operations
            </p>
          </div>
        </div> */}
      </main>

      {/* Footer */}
      {/* <footer className="bg-gray-900 text-white py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <div className="flex items-center space-x-3 mb-4 justify-center md:justify-start">
                <FaBible className="text-2xl text-blue-400" />
                <h3 className="text-xl font-playfair font-bold">Daily Preachings Word</h3>
              </div>
              <p className="text-gray-400 max-w-md">
                Real-time spiritual guidance powered by your Express.js backend API.
              </p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2 text-sm">
                API Endpoint: <code className="bg-gray-800 px-2 py-1 rounded text-xs">{API_ENDPOINT}</code>
              </p>
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} Daily Preachings | Connected to backend
              </p>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
};

export default DailyPreachingsPage;