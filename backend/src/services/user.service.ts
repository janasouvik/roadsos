import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { UpdateProfileInput } from '../validators/user.validator';
import { logger } from '../config/logger';
import path from 'path';
import fs from 'fs';

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  async updateProfile(userId: string, data: UpdateProfileInput, avatarFile?: Express.Multer.File) {
    const updateData: typeof data & { avatar?: string } = { ...data };

    if (avatarFile) {
      // Get user to delete old avatar
      const existing = await userRepository.findById(userId);
      if (existing?.avatar) {
        const oldPath = path.join(process.cwd(), existing.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.avatar = `/${avatarFile.path.replace(/\\/g, '/')}`;
    }

    const user = await userRepository.update(userId, updateData);
    logger.info(`Profile updated for user: ${userId}`);
    return user;
  },

  async deleteAccount(userId: string): Promise<void> {
    await userRepository.delete(userId);
    logger.info(`Account deleted for user: ${userId}`);
  },
};
