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
  },

  getNodesByFlowId: async (flowId: string) => {
    const response = await apiClient.get(`/node/list/${flowId}`);
    return response.data;
  },

  deleteNode: async (nodeId: string) => {
    const response = await apiClient.delete(`/node/delete/${nodeId}`);
    return response.data;
  },

  resumeNode: async (flowInstanceId: string, nodeInstanceId: string) => {
    const response = await apiClient.post(`/node/resume/${flowInstanceId}/${nodeInstanceId}`);
    return response.data;
  }
};

export const nodeStatusAPI = {
  updateNodeStatus: async (nodeInstanceId: string, nodeId: string, status: string) => {
    const response = await apiClient.post('/node/status/update', { nodeInstanceId, nodeId, status });
    return response.data;
  }
};