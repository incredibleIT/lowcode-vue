import type {NodeType} from "@/interface/node-type.ts";
import request from "@/utils/request.ts";

export const getNodeTypeList = () : Promise<NodeType[]> => {
    return request.get("/nodeType/list");
};

export const getNodeTypeDetail = (typeKey : string) : Promise<NodeType> => {
    return request.get(`/nodeType/detail/${typeKey}`);
}


export const createNodeType = (nodeType: NodeType): Promise<NodeType> => {
    return request.post("/nodeType/create", nodeType);
}

export const updateNodeType = (typeKey : string, nodeType: Partial<NodeType>) : Promise<NodeType> => {
    return request.put(`/nodeType/update/${typeKey}`, nodeType);
}

export const deleteNodeType = (typeKey : string) : Promise<void> => {
    return request.delete(`/nodeType/delete/${typeKey}`);
}