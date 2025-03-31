import { Truck, Phone, User, Hash } from 'lucide-react';

export default function LoadInfo({ load }) {
  return (
    <div className="bg-white border border-primary rounded-lg p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{load.load_number}</h1>
          <p className="text-gray-600 mt-1">{load.carrier_name}</p>
        </div>
        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            load.status === 'Completed' 
              ? 'bg-green-100 text-green-800'
              : load.status === 'In Transit'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {load.status}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-medium text-gray-600">Origin</h2>
          <p className="mt-1">{load.origin || 'Not specified'}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-600">Destination</h2>
          <p className="mt-1">{load.destination || 'Not specified'}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-600">Created</h2>
          <p className="mt-1">{new Date(load.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-gray-600">Delivery Date</h2>
          <p className="mt-1">{new Date(load.delivery_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Carrier & Driver Information Section */}
      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-medium mb-4">Carrier & Driver Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <Truck className="h-5 w-5 text-gray-400 mt-1 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Carrier Name</h3>
              <p className="mt-1">{load.carrier_name || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Hash className="h-5 w-5 text-gray-400 mt-1 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">MC Number</h3>
              <p className="mt-1">{load.mc_number || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <User className="h-5 w-5 text-gray-400 mt-1 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Driver Name</h3>
              <p className="mt-1">{load.driver_name || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-5 w-5 text-gray-400 mt-1 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Driver Phone</h3>
              <p className="mt-1">{load.driver_phone || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Truck className="h-5 w-5 text-gray-400 mt-1 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Truck Number</h3>
              <p className="mt-1">{load.truck_number || 'Not specified'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Truck className="h-5 w-5 text-gray-400 mt-1 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-600">Trailer Number</h3>
              <p className="mt-1">{load.trailer_number || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 