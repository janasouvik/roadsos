import { Request, Response } from 'express';
import { contactService } from '../services/contact.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.create(req.user!.id, req.body);
  ApiResponse.created(res, 'Emergency contact added', contact);
});

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const contacts = await contactService.getAll(req.user!.id);
  ApiResponse.success(res, 'Contacts fetched', contacts);
});

export const updateContact = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.update(req.params.id as string, req.user!.id, req.body);
  ApiResponse.success(res, 'Contact updated', contact);
});

export const deleteContact = asyncHandler(async (req: Request, res: Response) => {
  await contactService.delete(req.params.id as string, req.user!.id);
  ApiResponse.success(res, 'Contact deleted');
});
