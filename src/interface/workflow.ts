/** 流程状态，与后端 FlowStatus 对齐 */
export type FlowStatus =
    | 'draft'
    | 'published'
    | 'archived'
    | 'disabled'

/** Flow 前端领域模型 */
export interface Workflow {
    id: string
    name: string
    description: string
    version: string
    status: FlowStatus

    ownerId?: string
    tenantId?: string

    triggerType: string
    executionMode: string

    metadata?: Record<string, any>
    config?: Record<string, any>

    createdAt: string
    updatedAt: string
    publishedAt?: string
}
