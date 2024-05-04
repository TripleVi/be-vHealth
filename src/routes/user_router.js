import express from 'express';

import userController from '../controllers/user_controller.js';
import userValidators from '../utils/validators/user_validators.js';

const router = express.Router()

router.get('/', userValidators.validateUserOptions, userController.getUsers)
router.get('/:id', userController.getUserById)
router.post('/', userValidators.validateUserCreation, userController.createUser)
router.put('/:id', userController.editProfile)
// router.put('/:id', userValidators.validateUserDeletion, userController.deleteUser)
// router.patch('/:id', userController.updateMetadata)

export default router