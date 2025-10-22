import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Job } from '../lib/supabase'
import SearchBar from '../components/SearchBar'
import JobCard from '../components/JobCard'
import { Briefcase, Users, Award, TrendingUp } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchResults, setSearchResults] = useState<Job[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string, location: string, salary: string) => {
    setLoading(true)
    setHasSearched(true)

    try {
      let searchQuery = supabase.from('jobs').select('*')

      if (query) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,company.ilike.%${query}%,description.ilike.%${query}%`)
      }
      
      if (location) {
        searchQuery = searchQuery.ilike('location', `%${location}%`)
      }

      const { data, error } = await searchQuery.order('created_at', { ascending: false })

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching jobs:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (jobId: string) => {
    navigate(`/jobs/${jobId}`)
  }

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '1,200+' },
    { icon: Users, label: 'Companies', value: '350+' },
    { icon: Award, label: 'Success Rate', value: '85%' },
    { icon: TrendingUp, label: 'Avg Salary', value: '$120K' },
  ]

  const displayJobs = hasSearched ? searchResults : jobs

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Find Your <span className="text-sky-400">Dream Job</span>
            </h1>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Connect with top companies and discover opportunities that match your skills and ambitions. 
              Your next career move starts here.
            </p>
            
            <div className="max-w-4xl mx-auto">
              <SearchBar onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-sky-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {hasSearched ? 'Search Results' : 'Featured Opportunities'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {hasSearched 
                ? `Found ${displayJobs.length} job${displayJobs.length !== 1 ? 's' : ''} matching your criteria`
                : 'Discover amazing career opportunities from leading companies'
              }
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : displayJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onClick={() => handleJobClick(job.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria to find more opportunities.</p>
            </div>
          )}

          {!hasSearched && displayJobs.length > 0 && (
            <div className="text-center mt-12">
              <button
                onClick={() => navigate('/jobs')}
                className="bg-sky-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-sky-700 transition duration-200"
              >
                View All Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}