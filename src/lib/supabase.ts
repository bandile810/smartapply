import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Job = {
  id: string
  title: string
  company: string
  location: string
  salary: string
  description: string
  requirements: string
  created_at: string
}

export type Resume = {
  id: string
  user_id: string
  name: string
  email: string
  phone: string
  skills: string[]
  education: Array<{
    degree: string
    school: string
    year: string
  }>
  experience: Array<{
    title: string
    company: string
    period: string
    description: string
  }>
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url: string
  bio: string
  location: string
  website: string
  created_at: string
  updated_at: string
}