/**
 * 节点类型元数据（对应后端 com.lowcode.workflow.runner.graph.data.struct.template.NodeType）
 */



export interface NodeType {
    /**
     * 节点类型唯一标识，如 "http_request", "condition"
     */
    typeKey: string;

    /**
     * 显示名称，如 "HTTP 请求", "条件分支"
     */
    name: string;

    /**
     * 描述信息
     */
    description: string;

    /**
     * 分类，如 "基础", "网络", "数据库"
     */
    category: string;

    /**
     * 配置结构的 JSON Schema（用于动态表单生成）
     * 示例：
     * {
     *   url: { type: 'string', required: true },
     *   method: { type: 'string', enum: ['GET', 'POST'] }
     * }
     */
    configSchema: Record<string, any>;

    /**
     * 前端图标（可以是 icon class 名，如 'icon-http'，或 URL）
     */
    icon?: string;

    /**
     * 前端自定义渲染组件名称（如 'HttpRequestNodeView'）
     */
    component?: string;

    /**
     * 后端执行器全限定类名（仅用于管理/调试，前端通常不使用）
     */
    executorClass: string;

    /**
     * 是否支持重试
     */
    supportsRetry?: boolean;

    /**
     * 是否为异步执行节点
     */
    isAsync?: boolean;

    /**
     * 是否为终止节点（流程在此结束）
     */
    isTerminal?: boolean;

    /**
     * 创建时间 (ISO 8601 字符串)
     */
    createdAt?: string;

    /**
     * 更新时间
     */
    updatedAt?: string;
}