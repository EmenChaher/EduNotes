# Invitation Status Migration Guide

## Overview
This migration implements a status-based invitation system that fixes the issue where deleted users couldn't be re-invited. The system now uses explicit status management instead of deleting invitation records.

## What Changed

### 1. New Invitation Status
- **Pending**: New invitations (default)
- **Accepted**: User has registered using the invitation
- **Expired**: User was deleted, invitation is no longer valid

### 2. Enhanced Logic
- **Re-invitation**: Deleted users can now be re-invited
- **Data Preservation**: All invitation history is preserved
- **Clear Status**: Each invitation has an explicit status

## Migration Steps

### Step 1: Run the Migration Script
```bash
npm run migrate:invitation-status
```

This script will:
- Add `status: "Pending"` to all existing invitations
- Show a summary of the migration results

### Step 2: Verify Migration
Check that all existing invitations now have a status:
```javascript
// In MongoDB shell or admin panel
db.invitations.find({ status: { $exists: false } }).count() // Should return 0
```

### Step 3: Test the Fix
1. Create a test user
2. Delete the test user
3. Try to re-invite the same email
4. Verify it works without "already invited" error

## How It Works

### Before (Problem)
```
1. User invited → Invitation created
2. User registers → Invitation remains
3. User deleted → User soft-deleted, invitation remains
4. Re-invite attempt → "Email already invited" error ❌
```

### After (Fixed)
```
1. User invited → Invitation created (status: Pending)
2. User registers → Invitation status: Accepted
3. User deleted → Invitation status: Expired
4. Re-invite attempt → New invitation created ✅
```

## Database Schema Changes

### Invitation Model
```typescript
export enum InvitationStatus {
  Pending = 'Pending',    // New invitation
  Accepted = 'Accepted',  // User registered
  Expired = 'Expired',    // User was deleted
}
```

### Validation Logic
- Only checks for non-expired invitations
- Allows re-inviting users with expired invitations
- Preserves all historical data

## Benefits

1. **✅ Fixes Re-invitation Issue**: Deleted users can be re-invited
2. **✅ Preserves Data**: All invitation history is maintained
3. **✅ Clear Status**: Easy to understand invitation states
4. **✅ Audit Trail**: Complete history of all invitations
5. **✅ Future-Proof**: Easy to add more statuses later

## Rollback Plan

If needed, you can rollback by:
1. Removing the status field from the schema
2. Reverting the validation logic
3. The data will remain intact

## Testing Checklist

- [ ] Migration script runs successfully
- [ ] All existing invitations have status
- [ ] New invitations work normally
- [ ] Re-inviting deleted users works
- [ ] Registration with expired invitations shows proper error
- [ ] Registration with accepted invitations shows proper error

## Support

If you encounter any issues:
1. Check the migration script output
2. Verify database connection
3. Ensure all dependencies are installed
4. Contact the development team if needed
