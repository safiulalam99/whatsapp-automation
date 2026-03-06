-- Add conversation summary and status tracking to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS conversation_summary TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS conversation_status TEXT DEFAULT 'pending' CHECK (conversation_status IN ('pending', 'in_progress', 'done', 'follow_up'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS needs_action BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent'));

-- Add message count to track conversation activity
ALTER TABLE clients ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;

-- Create follow_ups table for reminders
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on follow_ups
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;

-- RLS policy for follow_ups
CREATE POLICY "tenant isolation on follow_ups" ON follow_ups
  FOR ALL USING (tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid()));

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_clients_last_message ON clients(tenant_id, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(tenant_id, conversation_status);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due ON follow_ups(tenant_id, due_date, status);

-- Update existing clients with default values
UPDATE clients
SET last_message_at = created_at,
    message_count = 1
WHERE last_message_at IS NULL;
