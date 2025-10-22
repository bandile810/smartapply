import React from 'react'
import { MapPin, DollarSign, Clock, Building2 } from 'lucide-react'
import { Job } from '../lib/supabase'

interface JobCardProps {
  job: Job
  onClick: () => void
}

export default function JobCard({ job, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 cursor-pointer hover:border-sky-200 transform hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {job.title}
          </h3>
          <div className="flex items-center text-gray-600 mb-2">
            <Building2 className="w-4 h-4 mr-2" />
            <span className="font-medium">{job.company}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-sky-500" />
          <span>{job.location}</span>
        </div>
        
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-4 h-4 mr-2 text-green-500" />
          <span className="font-semibold text-green-700">{job.salary}</span>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="w-4 h-4 mr-2" />
          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {job.description}
      </p>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          View Details →
        </div>
      </div>
    </div>
  )
}