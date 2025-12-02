import {http} from '@/utils/request';

// 获取所有已定义的流程模版
export const getFlowList = () => {
    return http.get('/flow/list');
};

// 分页获取所有已定义的流程模版
export const getFlowPage = (page: number = 1, size: number = 10) => {
    return http.get('/flow/page', {
        params: {
            page,
            size
        }
    });
};

// 根据流程ID获取流程详情
export const getFlowDetail = (flowId: string) => {
    return http.get(`/flow/detail/${flowId}`);
};

// 创建新的流程模版
export const createFlow = (flowData: any) => {
    return http.post('/flow/create', { flow: flowData });
};

// 更新已存在的流程模版
export const updateFlow = (flowData: any) => {
    return http.put('/flow/update', { flow: flowData });
};

// 删除已存在的流程模版
export const deleteFlow = (flowId: string) => {
    return http.delete(`/flow/delete/${flowId}`);
};

// 运行流程
export const runFlow = (flowData: any) => {
    return http.post('/flow/run', { flow: flowData });
};
