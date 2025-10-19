'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { cn, validatePercentage, formatPercentage } from '@/lib/utils';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { percentage: number; proofFile?: File }) => Promise<void>;
  currentSubmission?: { percentage_gain: number; proof_url?: string };
  isLoading?: boolean;
}

export default function SubmissionModal({
  isOpen,
  onClose,
  onSubmit,
  currentSubmission,
  isLoading = false,
}: SubmissionModalProps) {
  const [percentage, setPercentage] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string }>({ isValid: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const percentageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Pre-fill with current submission if editing
      if (currentSubmission) {
        setPercentage(currentSubmission.percentage_gain.toString());
        setValidation({ isValid: true });
      }
      
      // Focus on percentage input
      setTimeout(() => {
        percentageInputRef.current?.focus();
      }, 100);
    } else {
      // Reset form when modal closes
      setPercentage('');
      setProofFile(null);
      setValidation({ isValid: false });
      setIsSubmitting(false);
    }
  }, [isOpen, currentSubmission]);

  const handlePercentageChange = (value: string) => {
    setPercentage(value);
    const validationResult = validatePercentage(value);
    setValidation(validationResult);
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
      alert('Please upload a JPG, PNG, or PDF file');
      return;
    }
    
    setProofFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!validation.isValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        percentage: parseFloat(percentage),
        proofFile: proofFile || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && validation.isValid && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-robinhood-card-bg rounded-t-robinhood-lg z-50 max-h-[80vh] overflow-y-auto"
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-robinhood-border rounded-full" />
            </div>
            
            {/* Header */}
            <div className="px-6 pb-4 border-b border-robinhood-border">
              <div className="flex items-center justify-between">
                <h2 className="text-robinhood-h2 text-robinhood-text-primary">
                  {currentSubmission ? 'Edit Performance' : 'Submit Today\'s Performance'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-robinhood-hover rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-robinhood-text-secondary" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Percentage Input */}
              <div>
                <label className="block text-robinhood-text-primary font-medium mb-3">
                  Enter your % gain/loss
                </label>
                <div className="relative">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseFloat(percentage) || 0;
                        handlePercentageChange((current - 0.25).toString());
                      }}
                      className="px-4 py-3 bg-robinhood-input-bg border border-robinhood-border rounded-l-lg hover:bg-robinhood-hover transition-colors"
                    >
                      -
                    </button>
                    <input
                      ref={percentageInputRef}
                      type="number"
                      step="0.01"
                      value={percentage}
                      onChange={(e) => handlePercentageChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      className="flex-1 px-4 py-3 bg-robinhood-input-bg border-t border-b border-robinhood-border text-robinhood-text-primary text-center font-mono text-lg focus:outline-none focus:border-robinhood-green"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseFloat(percentage) || 0;
                        handlePercentageChange((current + 0.25).toString());
                      }}
                      className="px-4 py-3 bg-robinhood-input-bg border border-robinhood-border rounded-r-lg hover:bg-robinhood-hover transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-robinhood-text-secondary font-mono">
                    %
                  </div>
                </div>
                
                {/* Validation Message */}
                {percentage && !validation.isValid && (
                  <div className="flex items-center mt-2 text-robinhood-red">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm">{validation.error}</span>
                  </div>
                )}
                
                {validation.isValid && (
                  <div className="flex items-center mt-2 text-robinhood-green">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {formatPercentage(parseFloat(percentage))} - Ready to submit
                    </span>
                  </div>
                )}
              </div>
              
              {/* Proof Upload */}
              <div>
                <label className="block text-robinhood-text-primary font-medium mb-3">
                  Add Proof (Optional)
                </label>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                    dragActive
                      ? 'border-robinhood-green bg-robinhood-green/10'
                      : 'border-robinhood-border hover:border-robinhood-text-secondary'
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  
                  {proofFile ? (
                    <div className="space-y-2">
                      <Check className="w-8 h-8 text-robinhood-green mx-auto" />
                      <p className="text-robinhood-text-primary font-medium">
                        {proofFile.name}
                      </p>
                      <p className="text-robinhood-text-secondary text-sm">
                        {(proofFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        onClick={() => setProofFile(null)}
                        className="text-robinhood-red text-sm hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-robinhood-text-secondary mx-auto" />
                      <p className="text-robinhood-text-primary">
                        Drag & drop or{' '}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="text-robinhood-green hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-robinhood-text-secondary text-sm">
                        JPG, PNG, or PDF (max 10MB)
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-robinhood-text-secondary text-xs mt-2">
                  Only admins can view proof files
                </p>
              </div>
              
              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!validation.isValid || isSubmitting}
                className={cn(
                  'w-full py-4 rounded-robinhood-lg font-semibold text-robinhood-text-primary transition-all',
                  validation.isValid && !isSubmitting
                    ? 'bg-robinhood-green hover:bg-robinhood-green/90 active:scale-95'
                    : 'bg-robinhood-border text-robinhood-text-secondary cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-robinhood-text-primary border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </div>
                ) : (
                  currentSubmission ? 'Update Performance' : 'Submit Performance'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
