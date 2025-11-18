import axios from 'axios';
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export const postgresqlAPI = {

  testConnection: async (config: any) => {
    const response = await apiClient.post('/database/postgresql/test-connection', config);
    return response.data;
  },


  executeQuery: async (config: any) => {
    const response = await apiClient.post('/database/postgresql/execute', config);
    return response.data;
  },

  validateSQL: async (sql: string) => {
    const response = await apiClient.post('/database/postgresql/validate-sql', { sql });
    return response.data;
  }
};

// 接口文档 
export const nodeAPI = {
  createNode: async (nodeData: any) => {
    const response = await apiClient.post('/node/create', { node: nodeData });
    return response.data;
  },

  updateNode: async (nodeData: any) => {
    const response = await apiClient.put('/node/update', { node: nodeData });
    return response.data;
  },

  getNodeDetail: async (nodeId: string) => {
    const response = await apiClient.get(`/node/detail/${nodeId}`);
    return response.data;
  }
};