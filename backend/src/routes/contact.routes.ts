import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createContactSchema, updateContactSchema } from '../validators/contact.validator';

const router = Router();

router.use(authenticateUser);

router.post('/', validate(createContactSchema), contactController.createContact);
router.get('/', contactController.getContacts);
router.patch('/:id', validate(updateContactSchema), contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

export default router;
