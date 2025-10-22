import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase, Job } from '../lib/supabase'
import JobCard from '../components/JobCard'
import { ArrowLeft, MapPin, DollarSign, Building2, Calendar, CheckCircle, ExternalLink } from 'lucide-react'

export default function Jobs() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (jobId && jobs.length > 0) {
      const job = jobs.find(j => j.id === jobId)
      setSelectedJob(job || null)
    }
  }, [jobId, jobs])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    navigate(`/jobs/${job.id}`)
  }

  const handleApply = async () => {
    setApplying(true)
    // Simulate application process
    setTimeout(() => {
      setApplying(false)
      alert('Application submitted successfully! We\'ll be in touch soon.')
    }, 2000)
  }

  const handleBackToJobs = () => {
    setSelectedJob(null)
    navigate('/jobs')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </div>
    )
  }

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={handleBackToJobs}
            className="flex items-center text-sky-600 hover:text-sky-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </button>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12">
              <h1 className="text-3xl font-bold text-white mb-4">{selectedJob.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-300">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  <span className="font-medium">{selectedJob.company}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="font-semibold text-green-400">{selectedJob.salary}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Posted {new Date(selectedJob.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Job Description</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </section>

                  {selectedJob.requirements && (
                    <section>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Requirements</h2>
                      <div className="space-y-2">
                        {selectedJob.requirements.split(',').map((req, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{req.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="bg-sky-50 rounded-xl p-6 border border-sky-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Apply?</h3>
                    <p className="text-gray-600 mb-6 text-sm">
                      Join {selectedJob.company} and take your career to the next level.
                    </p>
                    <button
                      onClick={handleApply}
                      disabled={applying}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {applying ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Applying...
                        </div>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Company</span>
                        <p className="text-gray-900">{selectedJob.company}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Location</span>
                        <p className="text-gray-900">{selectedJob.location}</p>
                      </div>
                      <div>
                        <a
                          href="#"
                          className="inline-flex items-center text-sky-600 hover:text-sky-700 text-sm font-medium"
                        >
                          View Company Profile
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Jobs</h1>
          <p className="text-gray-600">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onClick={() => handleJobClick(job)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-600">Check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  )
}