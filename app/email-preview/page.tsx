'use client';

import { useState, useEffect, useMemo } from 'react';
import { TemplateName } from '@/lib/email/templates';

interface PreviewData {
  subject: string;
  html: string;
  version: string;
}

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName>('document-upload');
  const [testData, setTestData] = useState<Record<string, any>>({});
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates: TemplateName[] = [
    'document-upload',
    'missing-document'
  ];

  const defaultTestData = useMemo(() => ({
    'document-upload': {
      documentName: 'Bill of Lading',
      documentType: 'BOL',
      uploadDate: new Date().toISOString(),
      status: 'pending'
    },
    'missing-document': {
      documentType: 'BOL',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      loadNumber: 'LOAD-123'
    }
  }), []);

  useEffect(() => {
    setTestData(defaultTestData[selectedTemplate]);
  }, [selectedTemplate, defaultTestData]);

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: selectedTemplate,
          testData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const data = await response.json();
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Template Preview</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as TemplateName)}
                className="w-full p-2 border rounded"
              >
                {templates.map((template) => (
                  <option key={template} value={template}>
                    {template.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Data
              </label>
              <textarea
                value={JSON.stringify(testData, null, 2)}
                onChange={(e) => {
                  try {
                    setTestData(JSON.parse(e.target.value));
                  } catch (err) {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full h-48 p-2 border rounded font-mono text-sm"
              />
            </div>

            <button
              onClick={handlePreview}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating Preview...' : 'Generate Preview'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Preview</h2>
            {preview ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Subject</h3>
                  <p className="mt-1">{preview.subject}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Version</h3>
                  <p className="mt-1">{preview.version}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Content</h3>
                  <div className="border rounded p-4">
                    <iframe
                      srcDoc={preview.html}
                      className="w-full h-[600px]"
                      title="Email Preview"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-12">
                Select a template and generate a preview to see the result
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 