import { useState } from 'react'
import toast from 'react-hot-toast'

const DOCUMENT_TYPES = {
  BOL: 'Bill of Lading',
  POD: 'Proof of Delivery',
  INVOICE: 'Invoice'
}

export default function DocumentStatus({ documents, onClassificationUpdate }) {
  const [editingDoc, setEditingDoc] = useState(null)

  const getDocumentStatus = (type) => {
    const doc = documents.find(d => d.type === type)
    if (!doc) return { status: 'missing', label: 'Missing' }
    if (doc.status === 'processing') return { status: 'processing', label: 'Processing' }
    return { status: 'completed', label: 'Present' }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleClassificationChange = (docId, newType) => {
    onClassificationUpdate(docId, newType)
    setEditingDoc(null)
  }

  return (
    <div className="bg-white border border-primary rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Document Status</h2>
      
      <div className="space-y-4">
        {Object.entries(DOCUMENT_TYPES).map(([type, label]) => {
          const doc = documents.find(d => d.type === type)
          const status = getDocumentStatus(type)
          
          return (
            <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                  {status.label}
                </span>
                <span className="font-medium">{label}</span>
              </div>

              {doc && (
                <div className="flex items-center space-x-4">
                  {doc.classification_confidence && (
                    <div className="text-sm text-gray-600">
                      Confidence: {(doc.classification_confidence * 100).toFixed(1)}%
                    </div>
                  )}
                  
                  {doc.is_manual_classification && (
                    <span className="text-xs text-blue-600">Manually classified</span>
                  )}

                  {editingDoc === doc.id ? (
                    <div className="flex items-center space-x-2">
                      <select
                        value={doc.type}
                        onChange={(e) => handleClassificationChange(doc.id, e.target.value)}
                        className="text-sm border border-primary rounded px-2 py-1"
                      >
                        {Object.entries(DOCUMENT_TYPES).map(([t, l]) => (
                          <option key={t} value={t}>{l}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingDoc(null)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingDoc(doc.id)}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Edit Classification
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Overall Completion</span>
          <span>
            {Math.round((documents.filter(d => d.status === 'completed').length / Object.keys(DOCUMENT_TYPES).length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ 
              width: `${(documents.filter(d => d.status === 'completed').length / Object.keys(DOCUMENT_TYPES).length) * 100}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  )
} 