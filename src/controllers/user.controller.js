const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/response');
const ApiError = require('../utils/ApiError');

// Sample in-memory data (replace with actual database operations)
let users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'driver' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'dispatcher' },
];

const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;

  let filteredUsers = users;

  if (search) {
    filteredUsers = users.filter(
      user =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  ApiResponse.success(res, {
    users: paginatedUsers,
    pagination: {
      total: filteredUsers.length,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(filteredUsers.length / limit),
    },
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === parseInt(id));

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  ApiResponse.success(res, user);
});

const createUser = asyncHandler(async (req, res) => {
  const { name, email, role } = req.body;

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw ApiError.conflict('User with this email already exists');
  }

  const newUser = {
    id: users.length + 1,
    name,
    email,
    role,
  };

  users.push(newUser);

  ApiResponse.created(res, newUser, 'User created successfully');
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    throw ApiError.notFound('User not found');
  }

  if (email && email !== users[userIndex].email) {
    const emailExists = users.find(u => u.email === email && u.id !== parseInt(id));
    if (emailExists) {
      throw ApiError.conflict('Email already in use');
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(role && { role }),
  };

  ApiResponse.success(res, users[userIndex], 'User updated successfully');
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const userIndex = users.findIndex(u => u.id === parseInt(id));

  if (userIndex === -1) {
    throw ApiError.notFound('User not found');
  }

  users = users.filter(u => u.id !== parseInt(id));

  ApiResponse.success(res, null, 'User deleted successfully');
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
