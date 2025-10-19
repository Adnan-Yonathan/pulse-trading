'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Image as ImageIcon } from 'lucide-react';

interface ProofImageViewerProps {
  proofUrl?: string;
  username: string;
  percentageGain: number;
}

export default function ProofImageViewer({ 
  proofUrl, 
  username, 
  percentageGain 
}: ProofImageViewerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!proofUrl) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded bg-robinhood-border text-robinhood-text-secondary">
        <ImageIcon className="w-4 h-4" />
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="relative group w-8 h-8 rounded overflow-hidden border border-robinhood-border hover:border-robinhood-green transition-colors"
        title={`View proof for ${username}'s ${percentageGain > 0 ? '+' : ''}${percentageGain.toFixed(2)}% trade`}
      >
        <img
          src={proofUrl}
          alt={`${username}'s trade proof`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to icon if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-robinhood-border"><svg class="w-4 h-4 text-robinhood-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
          }}
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-4 h-4 text-white" />
        </div>
      </button>

      {/* Full-size Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative max-w-4xl max-h-[90vh] bg-robinhood-card-bg rounded-robinhood overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-robinhood-border">
                  <div>
                    <h3 className="text-robinhood-h3 text-robinhood-text-primary">
                      Trade Proof
                    </h3>
                    <p className="text-robinhood-text-secondary text-sm">
                      {username} • {percentageGain > 0 ? '+' : ''}{percentageGain.toFixed(2)}%
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-robinhood-text-secondary" />
                  </button>
                </div>

                {/* Image */}
                <div className="p-4">
                  <div className="relative">
                    <img
                      src={proofUrl}
                      alt={`${username}'s trade proof`}
                      className="max-w-full max-h-[70vh] object-contain rounded-robinhood border border-robinhood-border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-64 flex flex-col items-center justify-center bg-robinhood-border rounded-robinhood border border-robinhood-border">
                            <ImageIcon class="w-12 h-12 text-robinhood-text-secondary mb-2" />
                            <p class="text-robinhood-text-secondary">Failed to load image</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-robinhood-border">
                  <div className="flex items-center justify-between text-sm text-robinhood-text-secondary">
                    <span>View-only • Cannot be modified</span>
                    <span>Click outside to close</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
