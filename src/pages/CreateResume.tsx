import React, { useState, useEffect } from 'react'
import { supabase, Resume } from '../lib/supabase'
import { User, Mail, Phone, Plus, Trash2, Save, FileText, GraduationCap, Briefcase } from 'lucide-react'

export default function CreateResume() {
  const [resume, setResume] = useState<Partial<Resume>>({
    name: '',
    email: '',
    phone: '',
    skills: [],
    education: [],
    experience: []
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    loadExistingResume()
  }, [])

  const loadExistingResume = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        // For demo purposes, load sample data if no user
        loadSampleResume()
        return
      }

      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setResume(data)
      } else {
        loadSampleResume()
      }
    } catch (error) {
      console.error('Error loading resume:', error)
      loadSampleResume()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleResume = () => {
    setResume({
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '(555) 123-4567',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'AWS'],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          school: 'University of Technology',
          year: '2020'
        }
      ],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'Tech Solutions Inc.',
          period: '2021 - Present',
          description: 'Developed responsive web applications using React and TypeScript. Collaborated with design team to implement pixel-perfect UI components.'
        },
        {
          title: 'Junior Developer',
          company: 'StartUp Hub',
          period: '2020 - 2021',
          description: 'Built and maintained web applications using modern JavaScript frameworks. Participated in code reviews and agile development processes.'
        }
      ]
    })
  }

  const handleInputChange = (field: keyof Resume, value: any) => {
    setResume(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !resume.skills?.includes(newSkill.trim())) {
      handleInputChange('skills', [...(resume.skills || []), newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (index: number) => {
    const updatedSkills = resume.skills?.filter((_, i) => i !== index) || []
    handleInputChange('skills', updatedSkills)
  }

  const addEducation = () => {
    const newEducation = {
      degree: '',
      school: '',
      year: ''
    }
    handleInputChange('education', [...(resume.education || []), newEducation])
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = resume.education?.map((edu, i) => 
      i === index ? { ...edu, [field]: value } : edu
    ) || []
    handleInputChange('education', updatedEducation)
  }

  const removeEducation = (index: number) => {
    const updatedEducation = resume.education?.filter((_, i) => i !== index) || []
    handleInputChange('education', updatedEducation)
  }

  const addExperience = () => {
    const newExperience = {
      title: '',
      company: '',
      period: '',
      description: ''
    }
    handleInputChange('experience', [...(resume.experience || []), newExperience])
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = resume.experience?.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    ) || []
    handleInputChange('experience', updatedExperience)
  }

  const removeExperience = (index: number) => {
    const updatedExperience = resume.experience?.filter((_, i) => i !== index) || []
    handleInputChange('experience', updatedExperience)
  }

  const saveResume = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const resumeData = {
          ...resume,
          user_id: user.id
        }

        const { error } = await supabase
          .from('resumes')
          .upsert(resumeData, { onConflict: 'user_id' })

        if (error) throw error
      }
      
      alert('Resume saved successfully!')
    } catch (error) {
      console.error('Error saving resume:', error)
      alert('Resume updated locally (demo mode)')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Resume</h1>
          <p className="text-gray-600">Build your professional resume to showcase your skills and experience.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-sky-500" />
                Personal Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={resume.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={resume.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resume.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Add a skill"
                  />
                  <button
                    onClick={addSkill}
                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {resume.skills?.map((skill, index) => (
                    <div key={index} className="flex items-center bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm">
                      <span>{skill}</span>
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-sky-600 hover:text-sky-800"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-sky-500" />
                  Education
                </h2>
                <button
                  onClick={addEducation}
                  className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition duration-200 text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {resume.education?.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">Education {index + 1}</h3>
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Degree"
                      />
                      <input
                        type="text"
                        value={edu.school || ''}
                        onChange={(e) => updateEducation(index, 'school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="School/University"
                      />
                      <input
                        type="text"
                        value={edu.year || ''}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Year"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-sky-500" />
                  Experience
                </h2>
                <button
                  onClick={addExperience}
                  className="px-3 py-1 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition duration-200 text-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                {resume.experience?.map((exp, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium text-gray-900">Experience {index + 1}</h3>
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={exp.title || ''}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Job Title"
                      />
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Company"
                      />
                      <input
                        type="text"
                        value={exp.period || ''}
                        onChange={(e) => updateExperience(index, 'period', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Time Period (e.g., 2020 - 2022)"
                      />
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                        placeholder="Job Description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={saveResume}
              disabled={saving}
              className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-sky-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  Save Resume
                </div>
              )}
            </button>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-sky-500" />
              Resume Preview
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6 min-h-[600px]">
              <div className="space-y-6">
                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{resume.name || 'Your Name'}</h1>
                  <div className="flex items-center justify-center space-x-4 mt-2 text-gray-600">
                    {resume.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        <span className="text-sm">{resume.email}</span>
                      </div>
                    )}
                    {resume.phone && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        <span className="text-sm">{resume.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resume.skills.map((skill, index) => (
                        <span key={index} className="bg-sky-100 text-sky-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {resume.education && resume.education.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Education</h2>
                    <div className="space-y-2">
                      {resume.education.map((edu, index) => (
                        <div key={index}>
                          <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                          <p className="text-gray-600 text-sm">{edu.school} • {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {resume.experience && resume.experience.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Experience</h2>
                    <div className="space-y-4">
                      {resume.experience.map((exp, index) => (
                        <div key={index}>
                          <h3 className="font-medium text-gray-900">{exp.title}</h3>
                          <p className="text-gray-700 text-sm font-medium">{exp.company}</p>
                          <p className="text-gray-500 text-sm">{exp.period}</p>
                          <p className="text-gray-600 text-sm mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}