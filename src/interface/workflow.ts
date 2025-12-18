import {Node} from "@/interface/node.ts";
import {Edge} from "@/interface/edge.ts";

/**
 * 流程状态枚举
 */
export enum FlowStatus {
    draft = 'draft',
    published = 'published',
    archived = 'archived',
    disabled = 'disabled'
}

/**
 * 流程定义实体（对应后端 com.lowcode.workflow.runner.graph.data.struct.template.Flow）
 */
export interface Flow {
    /**
     * 流程唯一ID，全局唯一
     */
    id: string;

    /**
     * 流程名称，如“请假审批流”
     */
    name: string;

    /**
     * 流程描述
     */
    description: string;

    /**
     * 语义化版本号，如 "1.0.0"
     */
    version: string;

    /**
     * 流程状态：draft / published / archived / disabled
     */
    status: FlowStatus;

    /**
     * 流程所有者ID（用户/团队/租户ID）
     */
    ownerId?: string;

    /**
     * 多租户场景下的租户ID
     */
    tenantId?: string;

    /**
     * 触发方式：manual / api / schedule / event
     */
    triggerType: string;

    /**
     * 执行模式：sync / async / step-by-step
     */
    executionMode: string;

    /**
     * 扩展元数据，如分类标签、图标、颜色等
     */
    metadata?: Record<string, any>;

    /**
     * 流程级配置，如超时时间、重试策略、全局变量定义等
     */
    config?: Record<string, any>;

    /**
     * 创建时间 (ISO 8601 格式字符串，如 "2025-12-18T10:00:00")
     */
    createdAt?: string;

    /**
     * 最后更新时间
     */
    updatedAt?: string;

    /**
     * 发布时间（当 status = published 时记录）
     */
    publishedAt?: string;

    /**
     * 节点列表（非数据库字段，用于流程图渲染）
     */
    nodes?: Node[];

    /**
     * 边列表（非数据库字段）
     */
    edges?: Edge[];
}