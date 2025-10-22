import React, { useState } from 'react'
import { Search, MapPin, DollarSign } from 'lucide-react'

interface SearchBarProps {
  onSearch: (query: string, location: string, salary: string) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query, location, salary)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Job title or keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
            >
              <option value="">Any salary</option>
              <option value="50000">$50,000+</option>
              <option value="75000">$75,000+</option>
              <option value="100000">$100,000+</option>
              <option value="125000">$125,000+</option>
              <option value="150000">$150,000+</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
        >
          Search Jobs
        </button>
      </form>
    </div>
  )
}