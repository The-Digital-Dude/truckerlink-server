const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  getUsersValidation,
} = require('../validators/user.validator');

router.get('/', validate(getUsersValidation), userController.getUsers);

router.get('/:id', validate(userIdValidation), userController.getUserById);

router.post('/', validate(createUserValidation), userController.createUser);

router.put('/:id', validate(updateUserValidation), userController.updateUser);

router.delete('/:id', validate(userIdValidation), userController.deleteUser);

module.exports = router;
