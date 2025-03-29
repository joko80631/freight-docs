// Mock data
const load = {
  id: 1,
  load_number: 'LOAD-001',
  carrier_name: 'Example Carrier',
  delivery_date: '2024-03-29',
  documents: [
    { type: 'POD', confidence: 0.95, file_name: 'pod.pdf' },
    { type: 'BOL', confidence: 0.88, file_name: 'bol.pdf' },
  ],
  missing_documents: ['Invoice'],
  completeness_percentage: 66.67,
}

export default function LoadDetailPage({ params }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{load.load_number}</h1>
        <div className="text-sm">
          <span className="font-medium">Status:</span>{' '}
          <span className={load.completeness_percentage === 100 ? 'text-green-600' : 'text-yellow-600'}>
            {load.completeness_percentage}% Complete
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-primary p-6">
          <h2 className="text-lg font-semibold mb-4">Load Details</h2>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-gray-600">Carrier</dt>
              <dd className="font-medium">{load.carrier_name}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600">Delivery Date</dt>
              <dd className="font-medium">{load.delivery_date}</dd>
            </div>
          </dl>
        </div>

        <div className="border border-primary p-6">
          <h2 className="text-lg font-semibold mb-4">Documents</h2>
          <div className="space-y-4">
            {load.documents.map((doc) => (
              <div key={doc.type} className="flex justify-between items-center">
                <span className="font-medium">{doc.type}</span>
                <span className="text-sm text-gray-600">{doc.file_name}</span>
              </div>
            ))}
            {load.missing_documents.map((doc) => (
              <div key={doc} className="flex justify-between items-center text-gray-400">
                <span>{doc}</span>
                <span className="text-sm">Missing</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 