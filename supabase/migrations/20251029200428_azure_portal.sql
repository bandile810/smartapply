/*
  # Create job-based chat system

  1. New Tables
    - `job_chats`
      - `id` (uuid, primary key)
      - `application_id` (uuid, foreign key to applications, unique)
      - `employer_id` (uuid, foreign key to auth.users)
      - `candidate_id` (uuid, foreign key to auth.users)
      - `job_id` (uuid, foreign key to jobs)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `chat_id` (uuid, foreign key to job_chats)
      - `sender_id` (uuid, foreign key to auth.users)
      - `message` (text)
      - `message_type` (text, default 'text')
      - `read_by_employer` (boolean, default false)
      - `read_by_candidate` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for chat participants only
    - Add function to auto-create chat when application is accepted

  3. Realtime
    - Enable realtime on chat_messages table
*/

-- Create job_chats table
CREATE TABLE IF NOT EXISTS job_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
  employer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE job_chats ENABLE ROW LEVEL SECURITY;

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES job_chats(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  read_by_employer boolean DEFAULT false,
  read_by_candidate boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- RLS Policies for job_chats
CREATE POLICY "Chat participants can view their chats"
  ON job_chats
  FOR SELECT
  TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = candidate_id);

CREATE POLICY "System can create chats"
  ON job_chats
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for chat_messages
CREATE POLICY "Chat participants can view messages"
  ON chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_chats 
      WHERE job_chats.id = chat_messages.chat_id 
      AND (job_chats.employer_id = auth.uid() OR job_chats.candidate_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants can send messages"
  ON chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM job_chats 
      WHERE job_chats.id = chat_messages.chat_id 
      AND (job_chats.employer_id = auth.uid() OR job_chats.candidate_id = auth.uid())
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Chat participants can update message read status"
  ON chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM job_chats 
      WHERE job_chats.id = chat_messages.chat_id 
      AND (job_chats.employer_id = auth.uid() OR job_chats.candidate_id = auth.uid())
    )
  );

-- Function to create chat when application is accepted
CREATE OR REPLACE FUNCTION create_job_chat_on_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create chat if status changed to 'accepted' and chat doesn't exist
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    -- Create the chat room
    INSERT INTO job_chats (application_id, employer_id, candidate_id, job_id)
    SELECT 
      NEW.id,
      jobs.employer_id,
      NEW.user_id,
      NEW.job_id
    FROM jobs 
    WHERE jobs.id = NEW.job_id
    ON CONFLICT (application_id) DO NOTHING;

    -- Send welcome message
    INSERT INTO chat_messages (chat_id, sender_id, message, message_type)
    SELECT 
      jc.id,
      jc.employer_id,
      'Congratulations! Your application has been accepted. Feel free to ask any questions about the position or next steps.',
      'system'
    FROM job_chats jc
    WHERE jc.application_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for auto-creating chats
CREATE TRIGGER create_chat_on_application_acceptance
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION create_job_chat_on_acceptance();

-- Create trigger to auto-update updated_at for job_chats
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER update_job_chats_updated_at
      BEFORE UPDATE ON job_chats
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;