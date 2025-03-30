'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { API_ENDPOINTS, getApiHeaders } from '@/config/api';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_RETRIES = 3;

/**
 * DocumentUpload component for handling file uploads in the freight management system.
 * Supports drag-and-drop and click-to-upload functionality with file validation.
 * 
 * @param {Object} props - Component props
 * @param {string} props.loadId - ID of the load to associate documents with
 * @param {Function} props.onUploadComplete - Callback function called after successful upload
 * @returns {JSX.Element} Document upload component
 */
export default function DocumentUpload({ loadId, onUploadComplete }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  // Memoize accepted file types to prevent unnecessary re-renders
  const ACCEPTED_FILE_TYPES = useMemo(() => ({
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  }), []);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Memoize formatFileSize function
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  /**
   * Uploads a single file to Supabase storage and records it in the database
   * @param {File} file - The file to upload
   * @param {number} retryCount - Current retry attempt number
   * @returns {Promise<Object>} Upload result with success status and file info
   */
  const uploadFile = async (file, retryCount = 0) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `documents/${user.id}/${loadId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Record document in database
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          load_id: loadId,
          path: filePath,
          uploaded_by: user.id,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size
        });

      if (dbError) throw dbError;

      // Trigger classification
      const response = await fetch(API_ENDPOINTS.documents.classify, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          documentPath: filePath,
          loadId: loadId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to classify document');
      }

      return { success: true, filePath };
    } catch (error) {
      console.error('Upload error:', error);
      if (retryCount < MAX_RETRIES) {
        // Retry after exponential backoff
        // eslint-disable-next-line no-undef
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return uploadFile(file, retryCount + 1);
      }
      throw error;
    }
  };

  /**
   * Handles the upload of all selected files
   */
  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results = [];

    try {
      // Upload files sequentially for better control
      for (const file of files) {
        const result = await uploadFile(file);
        results.push(result);
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        toast.success(`Successfully uploaded ${successful} document${successful > 1 ? 's' : ''}`);
      }
      if (failed > 0) {
        toast.error(`Failed to upload ${failed} document${failed > 1 ? 's' : ''}`);
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      toast.error('Failed to upload documents');
      console.error('Upload error:', error);
    } finally {
      setFiles([]);
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the files here ...</p>
        ) : (
          <div>
            <p className="text-gray-600">Drag and drop files here, or click to select files</p>
            <p className="text-sm text-gray-500 mt-2">
              Accepted files: PDF, JPG, JPEG, PNG (max 10MB)
            </p>
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`mt-4 w-full py-2 px-4 rounded-md text-white font-medium
              ${uploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
              }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Uploading...
              </span>
            ) : (
              'Upload Files'
            )}
          </button>
        </div>
      )}
    </div>
  );
} 