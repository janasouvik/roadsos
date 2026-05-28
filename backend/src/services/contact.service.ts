import { contactRepository } from '../repositories/contact.repository';
import { ApiError } from '../utils/ApiError';
import { CreateContactInput, UpdateContactInput } from '../validators/contact.validator';

const MAX_CONTACTS = 10;

export const contactService = {
  async create(userId: string, data: CreateContactInput) {
    const count = await contactRepository.countByUser(userId);
    if (count >= MAX_CONTACTS) {
      throw ApiError.badRequest(`You can only have up to ${MAX_CONTACTS} emergency contacts`);
    }
    return contactRepository.create({ userId, ...data });
  },

  async getAll(userId: string) {
    return contactRepository.findByUser(userId);
  },

  async update(id: string, userId: string, data: UpdateContactInput) {
    const contact = await contactRepository.findById(id, userId);
    if (!contact) throw ApiError.notFound('Emergency contact not found');
    return contactRepository.update(id, userId, data);
  },

  async delete(id: string, userId: string) {
    const contact = await contactRepository.findById(id, userId);
    if (!contact) throw ApiError.notFound('Emergency contact not found');
    await contactRepository.delete(id, userId);
  },
};
