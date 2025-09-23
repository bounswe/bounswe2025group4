import { apiClient } from './api';
import { User } from '../types/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

class UserService {
  async createUser(userData: User): Promise<User> {
    const response = await apiClient.post<User>('/users', userData);
    return response.data;
  }

  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  }

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, userData: User): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    const id = localStorage.getItem('id');
    if (token) {
      try {
        const response = await apiClient.get<User>(`/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            id: id,
          },
        });
        return response.data;
      } catch (e) {
        console.error('Failed to parse token or mock user:', e);
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  }
}

export const userService = new UserService();

/* React Query Hooks */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getUsers(),
  });
};

export const useUserById = (id: number) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => userService.getUserById(id),
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: User) => userService.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userData: User) => userService.updateUser(id, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
};

export const useDeleteUser = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
};

export const useCurrentUser = () => {
  return useQuery<User | null, Error>({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
  });
};
