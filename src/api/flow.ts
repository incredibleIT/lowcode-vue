import {http} from '@/utils/request';


export const getFlowList = (limit: number, page: number) => {
    return http.get('/flow', {
        params: {
            limit: limit,
            page: page,
        }
    });
}
