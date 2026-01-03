import { db } from './db';
import { users } from '@shared/schema';

async function getUserId() {
  try {
    const allUsers = await db.select().from(users).limit(5);
    console.log('Users in database:', JSON.stringify(allUsers, null, 2));

    if (allUsers.length > 0) {
      console.log('\nFirst user ID:', allUsers[0].id);
      return allUsers[0].id;
    } else {
      console.log('No users found in database');
      return null;
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    return null;
  }
}

getUserId().then(userId => {
  if (userId) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});
