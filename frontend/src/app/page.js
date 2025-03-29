import Link from 'next/link'

// Mock data
const loads = [
  { id: 1, load_number: 'LOAD-001', carrier_name: 'Example Carrier', delivery_date: '2024-03-29' },
  { id: 2, load_number: 'LOAD-002', carrier_name: 'Another Carrier', delivery_date: '2024-03-30' },
]

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Loads</h1>
        <Link 
          href="/loads/new" 
          className="px-4 py-2 border border-primary hover:bg-primary hover:text-background transition-colors"
        >
          New Load
        </Link>
      </div>

      <div className="border border-primary divide-y divide-primary">
        {loads.map((load) => (
          <Link 
            key={load.id} 
            href={`/loads/${load.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{load.load_number}</h2>
                <p className="text-sm text-gray-600">{load.carrier_name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{load.delivery_date}</p>
                <p className="text-sm text-gray-600">View Details →</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 