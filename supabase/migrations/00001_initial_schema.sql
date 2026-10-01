-- Phase 2: Initial Schema, RLS, and Triggers for Emonk Attendance System

-- 1. Create Core Tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  register_number TEXT,
  department TEXT,
  year INTEGER,
  section TEXT,
  bio TEXT,
  profile_image_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  leetcode_url TEXT,
  hackerrank_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'tutor', 'student')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tutor_student_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES profiles(id),
  student_id UUID NOT NULL REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tutor_id, student_id)
);

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  topic_id UUID REFERENCES topics(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_by UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'coding', 'scenario', 'conceptual', 'debugging', 'multiple_choice', 'short_answer'
  )),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  options JSONB,
  correct_answer TEXT,
  expected_concepts TEXT[],
  solution_reference TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated')),
  review_status TEXT NOT NULL DEFAULT 'active' CHECK (review_status IN (
    'ai_generated', 'pending_review', 'approved', 'rejected', 'active', 'inactive'
  )),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  attendance_date DATE NOT NULL,
  check_in_at TIMESTAMPTZ,
  question_id UUID REFERENCES questions(id),
  question_attempt_id UUID,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started', 'checked_in', 'question_assigned', 'answer_submitted',
    'pending_review', 'approved', 'rejected', 'expired', 'cancelled'
  )),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  tutor_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, schedule_id)
);

CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  attendance_id UUID NOT NULL REFERENCES attendance(id),
  schedule_id UUID NOT NULL REFERENCES schedules(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE student_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_session_id UUID NOT NULL REFERENCES learning_sessions(id),
  topic_id UUID NOT NULL REFERENCES topics(id),
  student_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id),
  question_id UUID NOT NULL REFERENCES questions(id),
  attendance_id UUID NOT NULL REFERENCES attendance(id),
  answer_text TEXT NOT NULL,
  is_correct BOOLEAN,
  ai_evaluation JSONB,
  evaluation_status TEXT NOT NULL DEFAULT 'pending' CHECK (evaluation_status IN (
    'pending', 'evaluated', 'failed', 'not_required'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN (
    'announcement', 'resource', 'event', 'deadline', 'general'
  )),
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES profiles(id),
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Indexes
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_schedule ON attendance(schedule_id);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_assignments_tutor ON tutor_student_assignments(tutor_id);
CREATE INDEX idx_assignments_student ON tutor_student_assignments(student_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_active ON questions(is_active, review_status);
CREATE INDEX idx_attempts_student ON question_attempts(student_id);
CREATE INDEX idx_attempts_question ON question_attempts(question_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_posts_published ON posts(is_published, published_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- 3. Create Update Timestamp Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_topics_updated BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tutor_assignments_updated BEFORE UPDATE ON tutor_student_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_schedules_updated BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_questions_updated BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_learning_sessions_updated BEFORE UPDATE ON learning_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_question_attempts_updated BEFORE UPDATE ON question_attempts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_student_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Core RLS Policies

-- Profiles
CREATE POLICY "Students can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Tutors can view assigned students" ON profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutor_student_assignments
    WHERE tutor_id = auth.uid() AND student_id = profiles.id AND status = 'active'
  )
);
CREATE POLICY "Tutors can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super admins can view all profiles" ON profiles FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super admins can update profiles" ON profiles FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super admins can insert profiles" ON profiles FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Attendance
CREATE POLICY "Students view own attendance" ON attendance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students insert own check-in" ON attendance FOR INSERT WITH CHECK (auth.uid() = student_id AND status = 'checked_in');
CREATE POLICY "Tutors view assigned student attendance" ON attendance FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutor_student_assignments
    WHERE tutor_id = auth.uid() AND student_id = attendance.student_id AND status = 'active'
  )
);
CREATE POLICY "Tutors can update assigned student attendance" ON attendance FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM tutor_student_assignments
    WHERE tutor_id = auth.uid() AND student_id = attendance.student_id AND status = 'active'
  )
);
CREATE POLICY "Super admins can view all attendance" ON attendance FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super admins can update all attendance" ON attendance FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Posts
CREATE POLICY "Anyone can view published posts" ON posts FOR SELECT USING (is_published = true);
CREATE POLICY "Super admins can view all posts" ON posts FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super admins can insert posts" ON posts FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super admins can update posts" ON posts FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Questions (Basic reading for students/tutors, full access for admins)
CREATE POLICY "Students can view active questions" ON questions FOR SELECT USING (is_active = true AND review_status = 'active');
CREATE POLICY "Tutors can view active questions" ON questions FOR SELECT USING (is_active = true AND review_status = 'active');
CREATE POLICY "Admins have full access to questions" ON questions FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Topics (Basic reading for students/tutors, full access for admins)
CREATE POLICY "Students can view active topics" ON topics FOR SELECT USING (is_active = true);
CREATE POLICY "Tutors can view active topics" ON topics FOR SELECT USING (is_active = true);
CREATE POLICY "Admins have full access to topics" ON topics FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Schedules (Basic reading for students/tutors, full access for admins)
CREATE POLICY "Students can view active schedules" ON schedules FOR SELECT USING (status = 'active');
CREATE POLICY "Tutors can view active schedules" ON schedules FOR SELECT USING (status = 'active');
CREATE POLICY "Admins have full access to schedules" ON schedules FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Question Attempts
CREATE POLICY "Students view own attempts" ON question_attempts FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert own attempts" ON question_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Tutors view assigned student attempts" ON question_attempts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tutor_student_assignments
    WHERE tutor_id = auth.uid() AND student_id = question_attempts.student_id AND status = 'active'
  )
);
CREATE POLICY "Admins have full access to attempts" ON question_attempts FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Audit Logs (Only accessible by admins)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Admins can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System/Admins can insert notifications" ON notifications FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 6. Initial Seed Data (Topics)
INSERT INTO topics (name, description, category) VALUES
  ('Arrays', 'Array data structure and operations', 'DSA'),
  ('Binary Search', 'Binary search algorithm and variants', 'DSA'),
  ('Linked Lists', 'Singly and doubly linked lists', 'DSA'),
  ('Trees', 'Binary trees, BST, traversals', 'DSA'),
  ('Dynamic Programming', 'Memoization and tabulation', 'DSA'),
  ('SQL', 'SQL queries and database concepts', 'Database'),
  ('Java', 'Core Java programming', 'Programming'),
  ('Python', 'Python programming fundamentals', 'Programming')
ON CONFLICT (name) DO NOTHING;
