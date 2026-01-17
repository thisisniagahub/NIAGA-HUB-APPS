-- WOCS (WhatsApp OPS Control System) Database Schema
-- For Abang Colek Brand OS

-- Users & Roles
CREATE TABLE IF NOT EXISTS wocs_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'agent', 'viewer')) NOT NULL,
  wa_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- WhatsApp Sessions
CREATE TABLE IF NOT EXISTS wocs_wa_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES wocs_users(id) ON DELETE CASCADE,
  session_data JSONB,
  last_active TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) CHECK (status IN ('connected', 'disconnected', 'banned')) DEFAULT 'disconnected',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS wocs_tasks (
  id VARCHAR(20) PRIMARY KEY, -- TASK-XXXX
  type VARCHAR(50) NOT NULL, -- agent_task, landing_create, tiktok_post, etc.
  command_raw TEXT NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'awaiting_approval', 'running', 'done', 'failed', 'cancelled', 'rolled_back')) DEFAULT 'pending',
  priority VARCHAR(10) CHECK (priority IN ('high', 'normal', 'low')) DEFAULT 'normal',
  requested_by UUID REFERENCES wocs_users(id),
  assigned_to UUID REFERENCES wocs_users(id),
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT,
  result JSONB,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Task Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS wocs_task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(20) REFERENCES wocs_tasks(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- created, approved, started, completed, failed, retried
  actor_id UUID REFERENCES wocs_users(id),
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Attachments
CREATE TABLE IF NOT EXISTS wocs_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(20) REFERENCES wocs_tasks(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('image', 'video', 'audio', 'document')) NOT NULL,
  original_name VARCHAR(255),
  storage_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  size_bytes BIGINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Landing Page Versions
CREATE TABLE IF NOT EXISTS wocs_landing_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug VARCHAR(100) NOT NULL,
  version INT NOT NULL,
  content JSONB NOT NULL,
  status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at TIMESTAMP,
  created_by UUID REFERENCES wocs_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(page_slug, version)
);

-- App Config
CREATE TABLE IF NOT EXISTS wocs_app_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_name VARCHAR(50) NOT NULL,
  config_key VARCHAR(100) NOT NULL,
  config_value JSONB NOT NULL,
  updated_by UUID REFERENCES wocs_users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(app_name, config_key)
);

-- Customer Chats
CREATE TABLE IF NOT EXISTS wocs_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_chat_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100),
  customer_number VARCHAR(20) NOT NULL,
  assigned_agent UUID REFERENCES wocs_users(id),
  status VARCHAR(20) CHECK (status IN ('open', 'pending', 'closed')) DEFAULT 'open',
  last_message_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS wocs_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES wocs_chats(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) CHECK (sender_type IN ('customer', 'agent', 'bot')) NOT NULL,
  sender_id UUID,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Tasks
CREATE TABLE IF NOT EXISTS wocs_scheduled_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  command_template TEXT NOT NULL,
  cron_expression VARCHAR(100),
  next_run_at TIMESTAMP,
  last_run_at TIMESTAMP,
  status VARCHAR(20) CHECK (status IN ('active', 'paused', 'completed')) DEFAULT 'active',
  created_by UUID REFERENCES wocs_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Task Templates
CREATE TABLE IF NOT EXISTS wocs_task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  commands JSONB NOT NULL, -- Array of command templates
  variables JSONB, -- Array of variable names
  created_by UUID REFERENCES wocs_users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wocs_tasks_status ON wocs_tasks(status);
CREATE INDEX IF NOT EXISTS idx_wocs_tasks_assigned_to ON wocs_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_wocs_tasks_created_at ON wocs_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wocs_task_logs_task_id ON wocs_task_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_wocs_chats_status ON wocs_chats(status);
CREATE INDEX IF NOT EXISTS idx_wocs_messages_chat_id ON wocs_messages(chat_id);

-- Insert default admin user
INSERT INTO wocs_users (name, role, wa_number) 
VALUES 
  ('Admin 1', 'admin', '01168444656'),
  ('Admin 2', 'admin', '0178245667')
ON CONFLICT (wa_number) DO NOTHING;
