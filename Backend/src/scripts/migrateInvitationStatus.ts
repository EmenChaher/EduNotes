import mongoose from 'mongoose';
import Invitation, { InvitationStatus } from '../database/models/Invitation';
import { db } from '../config/envVar';

/**
 * Migration script to add status field to existing invitations
 * This script should be run once after deploying the status-based invitation system
 */
async function migrateInvitationStatus() {
  try {
    // Connect to database
    await mongoose.connect(db.connectionString);
    console.log('Connected to database');

    // Update all invitations that don't have a status field
    const result = await Invitation.updateMany({ status: { $exists: false } }, { $set: { status: InvitationStatus.Pending } });

    console.log(`Migration completed: ${result.modifiedCount} invitations updated`);

    // Show summary
    const statusCounts = await Invitation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('Current invitation status distribution:');
    statusCounts.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateInvitationStatus();
}

export default migrateInvitationStatus;
