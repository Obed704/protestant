import React from "react";
import { X, Bookmark, Share2, Download, Printer, Copy, ExternalLink } from "lucide-react";

const StudyPopup = ({ 
  study, 
  onClose, 
  onBookmark, 
  onShare, 
  onDownload, 
  isBookmarked 
}) => {
  // Guard against null/undefined study
  if (!study) {
    return null;
  }

  const handlePrint = () => {
    const printContent = document.getElementById('study-content')?.innerHTML || '';
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${study?.title || 'Bible Study'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
            .verse { font-style: italic; color: #666; margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid #4f46e5; }
            .content { line-height: 1.6; margin: 20px 0; }
          </style>
        </head>
        <body>
          <h1>${study?.title || 'Bible Study'}</h1>
          <div id="study-content">${printContent}</div>
          <hr style="margin: 40px 0;">
          <p style="text-align: center; color: #666; font-size: 12px;">
            Printed from Bible Study App • ${new Date().toLocaleString()}
          </p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const copyToClipboard = () => {
    const text = `${study?.title || 'Bible Study'}\n\n${study?.description || ''}\n\n${study?.verses?.map(v => `${v?.reference || ''}: ${v?.text || ''}`).join('\n') || ''}`;
    navigator.clipboard.writeText(text)
      .then(() => alert('Copied to clipboard!'))
      .catch(err => console.error('Copy failed:', err));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{study?.title || 'Untitled Study'}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
              <span>Created: {study?.createdAt ? new Date(study.createdAt).toLocaleDateString() : 'Unknown date'}</span>
              {study?.views && (
                <>
                  <span>•</span>
                  <span>{study.views} views</span>
                </>
              )}
              {study?.category && (
                <>
                  <span>•</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    {study.category}
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Copy to clipboard"
            >
              <Copy size={20} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]" id="study-content">
          {study?.verse && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-lg italic text-blue-800">"{study.verse}"</p>
            </div>
          )}

          <div className="prose max-w-none mb-6">
            <h3 className="text-lg font-semibold mb-3">Study Description</h3>
            <div className="text-gray-700 whitespace-pre-line">
              {study?.description || 'No description available.'}
            </div>
          </div>

          {study?.verses && study.verses.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Key Verses</h3>
              <div className="space-y-3">
                {study.verses.map((verse, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-bold text-blue-800 mb-2">{verse?.reference || 'Verse'}</div>
                    <div className="text-gray-700 italic">"{verse?.text || ''}"</div>
                    {verse?.notes && (
                      <div className="mt-2 text-sm text-gray-600">{verse.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {study?.discussionQuestions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Discussion Questions</h3>
              <div className="space-y-2">
                {study.discussionQuestions.map((question, index) => (
                  <div key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {study?.tags && study.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {study.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBookmark}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                isBookmarked 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bookmark size={18} fill={isBookmarked ? "currentColor" : "none"} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            
            <button
              onClick={onShare}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"
            >
              <Share2 size={18} />
              Share
            </button>
            
            <button
              onClick={onDownload}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-2"
            >
              <Download size={18} />
              Download
            </button>
            
            {study?.verses?.[0]?.reference && (
              <button
                onClick={() => window.open(`https://www.biblegateway.com/passage/?search=${study.verses[0].reference}&version=NIV`, '_blank')}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Open in Bible Gateway
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPopup;