-- Add group invitations table

CREATE TABLE IF NOT EXISTS group_invitations (
    invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    invitee_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, invitee_id)
);

CREATE INDEX IF NOT EXISTS idx_group_invitations_invitee ON group_invitations(invitee_id, status);
CREATE INDEX IF NOT EXISTS idx_group_invitations_group ON group_invitations(group_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_group_invitations_updated_at ON group_invitations;
CREATE TRIGGER update_group_invitations_updated_at
  BEFORE UPDATE ON group_invitations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
