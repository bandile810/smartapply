import React, { useState, useEffect } from 'react'
import { supabase, Profile } from '../lib/supabase'
import { User, Mail, MapPin, Globe, Edit2, Save, Camera, FileText, Briefcase } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({})

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (data) {
          setProfile(data)
          setEditedProfile(data)
        } else {
          // Create a new profile if none exists
          const newProfile = {
            id: user.id,
            email: user.email || '',
            full_name: '',
            avatar_url: '',
            bio: '',
            location: '',
            website: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setProfile(newProfile)
          setEditedProfile(newProfile)
        }
      } else {
        // Demo profile for non-authenticated users
        const demoProfile = {
          id: 'demo-user',
          email: 'alex.johnson@email.com',
          full_name: 'Alex Johnson',
          avatar_url: '',
          bio: 'Full-stack developer with 3+ years of experience building web applications. Passionate about creating clean, efficient code and solving complex problems.',
          location: 'San Francisco, CA',
          website: 'https://alexjohnson.dev',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setProfile(demoProfile)
        setEditedProfile(demoProfile)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Profile, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            ...editedProfile,
            id: user.id,
            updated_at: new Date().toISOString()
          })

        if (error) throw error
        
        setProfile({ ...editedProfile } as Profile)
      } else {
        // Demo mode - just update local state
        setProfile({ ...editedProfile } as Profile)
      }
      
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Profile updated locally (demo mode)')
      setProfile({ ...editedProfile } as Profile)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile || {})
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-sky-500 rounded-full flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {editing && (
                  <button className="absolute -bottom-1 -right-1 bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600 transition duration-200">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                {editing ? (
                  <input
                    type="text"
                    value={editedProfile.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="text-3xl font-bold text-white bg-transparent border-b border-gray-400 focus:border-white outline-none mb-2"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.full_name || 'Add your name'}
                  </h1>
                )}
                
                <div className="flex items-center text-gray-300 mb-2">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
                
                {(profile.location || editing) && (
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    {editing ? (
                      <input
                        type="text"
                        value={editedProfile.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="bg-transparent border-b border-gray-400 focus:border-white outline-none text-gray-300"
                        placeholder="Your location"
                      />
                    ) : (
                      <span>{profile.location}</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition duration-200 flex items-center"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition duration-200 flex items-center disabled:opacity-50"
                    >
                      {saving ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              {editing ? (
                <textarea
                  value={editedProfile.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {profile.bio || 'No bio added yet. Click edit to add your professional summary.'}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  {editing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Your location"
                    />
                  ) : (
                    <span className="text-gray-700">{profile.location || 'Location not specified'}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-3" />
                  {editing ? (
                    <input
                      type="url"
                      value={editedProfile.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="https://yourwebsite.com"
                    />
                  ) : profile.website ? (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-700"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <span className="text-gray-700">No website added</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/resume'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition duration-200"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Create Resume
                </button>
                
                <button
                  onClick={() => window.location.href = '/jobs'}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-200"
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Browse Jobs
                </button>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Views</span>
                  <span className="font-semibold text-gray-900">142</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-semibold text-gray-900">8</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Profile Complete</span>
                  <span className="font-semibold text-sky-600">75%</span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Member Since</h3>
              <p className="text-gray-600">
                {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}