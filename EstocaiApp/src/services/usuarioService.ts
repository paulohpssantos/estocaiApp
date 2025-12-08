import { UpdatePlanoRequest } from '../models/usuario';
import api from './api';

export async function atualizarPlanoUsuario(data: UpdatePlanoRequest) {
  const response = await api.put('/usuario/atualizar-plano', data);
  return response.data;
}