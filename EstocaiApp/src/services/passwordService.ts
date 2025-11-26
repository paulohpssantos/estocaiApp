import api from './api';


export async function passwordForgot(email: string) {
  const response = await api.post(
    '/auth/forgot',
    { email },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}