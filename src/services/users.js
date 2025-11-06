import api from './api';

class UsersService {
  async getUsers() {
    return await api.get('/users');
  }

  async getUser(userId) {
    return await api.get(`/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return await api.put(`/users/${userId}`, userData);
  }
}

export default new UsersService();