import axios from 'axios';

const api = axios.create({
	baseURL: 'http://34.210.83.46:8080', 
	timeout: 10000,
});

// Exemplo de função para buscar dados
export async function getData(endpoint: string) {
	try {
		const response = await api.get(endpoint);
		return response.data;
	} catch (error) {
		throw error;
	}
}

// Exemplo de função para enviar dados
export async function postData(endpoint: string, data: any) {
	try {
		const response = await api.post(endpoint, data);
		return response.data;
	} catch (error) {
		throw error;
	}
}

export default api;
