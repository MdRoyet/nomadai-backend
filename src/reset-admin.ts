import { connectDB } from './config/db';
import { User } from './models/User.model';
import bcrypt from 'bcryptjs';

const resetAdminPassword = async () => {
  await connectDB();

  const email = 'host@nomadai.com';
  const newPassword = 'password123';

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    console.log(`User ${email} not found. Creating...`);
    await User.create({
      name: 'NomadAI Host',
      email,
      password: newPassword,
      role: 'admin',
      authProvider: 'local',
    });
    console.log(`Admin created: ${email} / ${newPassword}`);
  } else {
    user.password = newPassword;
    user.authProvider = 'local';
    await user.save();
    console.log(`Password reset for ${email} → ${newPassword}`);
  }

  process.exit(0);
};

resetAdminPassword();
