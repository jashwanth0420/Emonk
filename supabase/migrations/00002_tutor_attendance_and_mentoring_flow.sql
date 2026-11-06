-- Migration: 00002_tutor_attendance_and_mentoring_flow.sql
-- Enables Tutor Self-Attendance (4:00 PM - 8:00 PM), Real-Time Student Presence,
-- Dynamic "Take Student" Topic Assignment, and Centralized Admin Reporting.

-- 1. Create Tutor Attendance Table for 4-8 PM Daily Sessions
CREATE TABLE IF NOT EXISTS tutor_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out_time TIMESTAMPTZ,
  availability_status TEXT NOT NULL DEFAULT 'available' 
    CHECK (availability_status IN ('available', 'busy_mentoring', 'break', 'completed')),
  total_students_taken INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tutor_id, attendance_date)
);

-- Enable RLS
ALTER TABLE tutor_attendance ENABLE ROW LEVEL SECURITY;

-- Tutor Attendance RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tutor_attendance' AND policyname = 'Tutors can view own attendance'
  ) THEN
    CREATE POLICY "Tutors can view own attendance"
      ON tutor_attendance FOR SELECT
      USING (auth.uid() = tutor_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tutor_attendance' AND policyname = 'Tutors can manage own attendance'
  ) THEN
    CREATE POLICY "Tutors can manage own attendance"
      ON tutor_attendance FOR ALL
      USING (auth.uid() = tutor_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tutor_attendance' AND policyname = 'Admins can manage all tutor attendance'
  ) THEN
    CREATE POLICY "Admins can manage all tutor attendance"
      ON tutor_attendance FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
        )
      );
  END IF;
END $$;

-- 2. Extend Profiles with Live Presence and Session Status
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS current_session_status TEXT DEFAULT 'idle';

-- 3. Extend Attendance with Assigned Tutor and Custom Task Instructions
ALTER TABLE attendance 
  ADD COLUMN IF NOT EXISTS assigned_tutor_id UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_topic_ids UUID[],
  ADD COLUMN IF NOT EXISTS assigned_task_instructions TEXT,
  ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'evening_lab';

-- 4. Create Index for Fast Lookups
CREATE INDEX IF NOT EXISTS idx_tutor_attendance_date ON tutor_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_tutor_attendance_tutor ON tutor_attendance(tutor_id);
CREATE INDEX IF NOT EXISTS idx_attendance_assigned_tutor ON attendance(assigned_tutor_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_online ON profiles(is_online, role);
