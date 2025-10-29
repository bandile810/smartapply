@@ .. @@
 import React, { useState, useEffect } from 'react'
+import { useNavigate } from 'react-router-dom'
 import { supabase } from '../lib/supabase'
-import { Briefcase, Clock, CheckCircle, XCircle, Calendar, MapPin, DollarSign, User, FileText } from 'lucide-react'
+import { Briefcase, Clock, CheckCircle, XCircle, Calendar, MapPin, DollarSign, User, FileText, MessageCircle } from 'lucide-react'

 interface Application {
@@ .. @@
   interview_details?: InterviewDetails
 }

+interface JobChat {
+  id: string
+  application_id: string
+  job_title: string
+  company_name: string
+  other_participant_name: string
+  last_message?: string
+  last_message_time?: string
+  unread_count: number
+}
+
 interface InterviewDetails {
   id: string
@@ .. @@
 }

 export default function Dashboard() {
+  const navigate = useNavigate()
   const [applications, setApplications] = useState<Application[]>([])
+  const [chats, setChats] = useState<JobChat[]>([])
   const [loading, setLoading] = useState(true)
   const [user, setUser] = useState<any>(null)

@@ .. @@
   useEffect(() => {
     getCurrentUser()
     loadApplications()
+    loadChats()
   }, [])

@@ .. @@
     } finally {
       setLoading(false)
     }
   }

+  const loadChats = async () => {
+    try {
+      const { data: { user } } = await supabase.auth.getUser()
+      if (!user) return
+
+      const { data, error } = await supabase
+        .from('job_chats')
+        .select(`
+          id,
+          application_id,
+          employer_id,
+          candidate_id,
+          jobs!inner(title, company),
+          employer:employer_id(full_name),
+          candidate:candidate_id(full_name),
+          chat_messages(message, created_at, sender_id, read_by_employer, read_by_candidate)
+        `)
+        .or(`employer_id.eq.${user.id},candidate_id.eq.${user.id}`)
+        .order('updated_at', { ascending: false })
+
+      if (error) throw error
+
+      const chatsWithDetails = data.map(chat => {
+        const isEmployer = user.id === chat.employer_id
+        const otherParticipantName = isEmployer 
+          ? chat.candidate?.full_name || 'Candidate'
+          : chat.employer?.full_name || 'Employer'
+
+        // Get last message
+        const lastMessage = chat.chat_messages?.[chat.chat_messages.length - 1]
+        
+        // Count unread messages
+        const unreadCount = chat.chat_messages?.filter(msg => {
+          if (isEmployer) {
+            return !msg.read_by_employer && msg.sender_id !== user.id
+          } else {
+            return !msg.read_by_candidate && msg.sender_id !== user.id
+          }
+        }).length || 0
+
+        return {
+          id: chat.id,
+          application_id: chat.application_id,
+          job_title: chat.jobs.title,
+          company_name: chat.jobs.company,
+          other_participant_name: otherParticipantName,
+          last_message: lastMessage?.message,
+          last_message_time: lastMessage?.created_at,
+          unread_count
+        }
+      })
+
+      setChats(chatsWithDetails)
+    } catch (error) {
+      console.error('Error loading chats:', error)
+    }
+  }
+
   const getStatusIcon = (status: string) => {
     switch (status) {
@@ .. @@
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
           <p className="text-gray-600">
-            Welcome back! Here's an overview of your job applications.
+            Welcome back! Here's an overview of your job applications and messages.
           </p>
         </div>

-        {loading ? (
+        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
+          {/* Applications Section */}
+          <div className="lg:col-span-2">
+            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Applications</h2>
+            
+            {loading ? (
+              <div className="space-y-4">
+                {[...Array(3)].map((_, i) => (
+                  <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
+                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
+                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
+                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
+                  </div>
+                ))}
+              </div>
+            ) : applications.length > 0 ? (
+              <div className="space-y-4">
+                {applications.map((application) => (
+                  <div key={application.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
+                    <div className="flex items-start justify-between mb-4">
+                      <div className="flex-1">
+                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
+                          {application.job_title}
+                        </h3>
+                        <div className="flex items-center text-gray-600 mb-2">
+                          <Briefcase className="w-4 h-4 mr-2" />
+                          <span className="font-medium">{application.company_name}</span>
+                        </div>
+                        <div className="flex items-center text-gray-600 mb-2">
+                          <MapPin className="w-4 h-4 mr-2" />
+                          <span>{application.job_location}</span>
+                        </div>
+                        <div className="flex items-center text-gray-600">
+                          <DollarSign className="w-4 h-4 mr-2" />
+                          <span className="font-semibold text-green-700">{application.job_salary}</span>
+                        </div>
+                      </div>
+                      
+                      <div className="flex items-center space-x-2">
+                        {getStatusIcon(application.status)}
+                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
+                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
+                        </span>
+                      </div>
+                    </div>
+                    
+                    <div className="flex items-center text-gray-500 text-sm mb-4">
+                      <Clock className="w-4 h-4 mr-2" />
+                      <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
+                    </div>
+
+                    {/* Interview Details */}
+                    {application.status === 'interview' && application.interview_details && (
+                      <div className="bg-sky-50 rounded-lg p-4 border border-sky-200 mb-4">
+                        <h4 className="font-semibold text-sky-900 mb-2 flex items-center">
+                          <Calendar className="w-4 h-4 mr-2" />
+                          Interview Scheduled
+                        </h4>
+                        <div className="space-y-2 text-sm text-sky-800">
+                          <p><strong>Date:</strong> {new Date(application.interview_details.interview_date).toLocaleDateString()}</p>
+                          <p><strong>Time:</strong> {application.interview_details.interview_time}</p>
+                          <p><strong>Location:</strong> {application.interview_details.location}</p>
+                          {application.interview_details.dress_code && (
+                            <p><strong>Dress Code:</strong> {application.interview_details.dress_code}</p>
+                          )}
+                          {application.interview_details.items_to_bring && (
+                            <p><strong>Items to Bring:</strong> {application.interview_details.items_to_bring}</p>
+                          )}
+                          {application.interview_details.additional_instructions && (
+                            <p><strong>Additional Instructions:</strong> {application.interview_details.additional_instructions}</p>
+                          )}
+                        </div>
+                      </div>
+                    )}
+                  </div>
+                ))}
+              </div>
+            ) : (
+              <div className="text-center py-12 bg-white rounded-xl shadow-md">
+                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
+                  <Briefcase className="w-12 h-12 text-gray-400" />
+                </div>
+                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
+                <p className="text-gray-600 mb-4">Start applying to jobs to see your applications here.</p>
+                <button
+                  onClick={() => window.location.href = '/jobs'}
+                  className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-200"
+                >
+                  Browse Jobs
+                </button>
+              </div>
+            )}
+          </div>

-          <div className="space-y-4">
-            {[...Array(3)].map((_, i) => (
-              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
-                <div className="h-6 bg-gray-200 rounded mb-4"></div>
-                <div className="h-4 bg-gray-200 rounded mb-2"></div>
-                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
+          {/* Chat Section */}
+          <div>
+            <h2 className="text-xl font-semibold text-gray-900 mb-4">Messages</h2>
+            
+            {chats.length > 0 ? (
+              <div className="space-y-3">
+                {chats.map((chat) => (
+                  <div
+                    key={chat.id}
+                    onClick={() => navigate(`/chat/${chat.id}`)}
+                    className="bg-white rounded-lg shadow-md p-4 border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-200"
+                  >
+                    <div className="flex items-start justify-between mb-2">
+                      <div className="flex items-center space-x-3">
+                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
+                          <MessageCircle className="w-5 h-5 text-sky-600" />
+                        </div>
+                        <div className="flex-1">
+                          <h4 className="font-medium text-gray-900">{chat.other_participant_name}</h4>
+                          <p className="text-sm text-gray-600">{chat.job_title}</p>
+                        </div>
+                      </div>
+                      {chat.unread_count > 0 && (
+                        <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
+                          {chat.unread_count}
+                        </div>
+                      )}
+                    </div>
+                    
+                    {chat.last_message && (
+                      <div className="text-sm text-gray-600 mb-1">
+                        <p className="truncate">{chat.last_message}</p>
+                      </div>
+                    )}
+                    
+                    {chat.last_message_time && (
+                      <div className="text-xs text-gray-500">
+                        {new Date(chat.last_message_time).toLocaleDateString()}
+                      </div>
+                    )}
+                  </div>
+                ))}
               </div>
-            ))}
-          </div>
-        ) : applications.length > 0 ? (
-          <div className="space-y-6">
-            {applications.map((application) => (
-              <div key={application.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
-                <div className="flex items-start justify-between mb-4">
-                  <div className="flex-1">
-                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
-                      {application.job_title}
-                    </h3>
-                    <div className="flex items-center text-gray-600 mb-2">
-                      <Briefcase className="w-4 h-4 mr-2" />
-                      <span className="font-medium">{application.company_name}</span>
-                    </div>
-                    <div className="flex items-center text-gray-600 mb-2">
-                      <MapPin className="w-4 h-4 mr-2" />
-                      <span>{application.job_location}</span>
-                    </div>
-                    <div className="flex items-center text-gray-600">
-                      <DollarSign className="w-4 h-4 mr-2" />
-                      <span className="font-semibold text-green-700">{application.job_salary}</span>
-                    </div>
-                  </div>
-                  
-                  <div className="flex items-center space-x-2">
-                    {getStatusIcon(application.status)}
-                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
-                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
-                    </span>
-                  </div>
+            ) : (
+              <div className="text-center py-8 bg-white rounded-lg shadow-md">
+                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
+                  <MessageCircle className="w-8 h-8 text-gray-400" />
                 </div>
-                
-                <div className="flex items-center text-gray-500 text-sm mb-4">
-                  <Clock className="w-4 h-4 mr-2" />
-                  <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
-                </div>
-
-                {/* Interview Details */}
-                {application.status === 'interview' && application.interview_details && (
-                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-200 mb-4">
-                    <h4 className="font-semibold text-sky-900 mb-2 flex items-center">
-                      <Calendar className="w-4 h-4 mr-2" />
-                      Interview Scheduled
-                    </h4>
-                    <div className="space-y-2 text-sm text-sky-800">
-                      <p><strong>Date:</strong> {new Date(application.interview_details.interview_date).toLocaleDateString()}</p>
-                      <p><strong>Time:</strong> {application.interview_details.interview_time}</p>
-                      <p><strong>Location:</strong> {application.interview_details.location}</p>
-                      {application.interview_details.dress_code && (
-                        <p><strong>Dress Code:</strong> {application.interview_details.dress_code}</p>
-                      )}
-                      {application.interview_details.items_to_bring && (
-                        <p><strong>Items to Bring:</strong> {application.interview_details.items_to_bring}</p>
-                      )}
-                      {application.interview_details.additional_instructions && (
-                        <p><strong>Additional Instructions:</strong> {application.interview_details.additional_instructions}</p>
-                      )}
-                    </div>
-                  </div>
-                )}
+                <h3 className="font-medium text-gray-900 mb-1">No messages yet</h3>
+                <p className="text-sm text-gray-600">Messages will appear here when your applications are accepted.</p>
               </div>
-            ))}
-          </div>
-        ) : (
-          <div className="text-center py-12">
-            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
-              <Briefcase className="w-12 h-12 text-gray-400" />
-            </div>
-            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
-            <p className="text-gray-600 mb-4">Start applying to jobs to see your applications here.</p>
-            <button
-              onClick={() => window.location.href = '/jobs'}
-              className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition duration-200"
-            >
-              Browse Jobs
-            </button>
+            )}
           </div>
-        )}
+        </div>
       </div>
     </div>
   )