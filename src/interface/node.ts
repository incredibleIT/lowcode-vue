import { NodeType } from "@/interface/node-type.ts";

/**
 * 节点位置方向枚举（对应后端 Position 枚举）
 */
export enum NodePosition {
    top = 'top',
    bottom = 'bottom',
    left = 'left',
    right = 'right'
}



/**
 * 流程节点实体（对应后端 com.lowcode.workflow.runner.graph.data.struct.template.Node）
 */
export interface Node {
    /**
     * 节点唯一ID，对应 Vue Flow 的 node.id
     */
    id: string;

    /**
     * 所属流程ID
     */
    flowId: string;

    /**
     * 节点 X 坐标
     */
    positionX: number;

    /**
     * 节点 Y 坐标
     */
    positionY: number;

    /**
     * 节点类型：input / output / default / custom 等
     */
    type: string;

    /**
     * 用户自定义数据的 key（用于标识 data 中哪个字段是主业务数据）
     */
    nodeDataFieldKey: string;

    /**
     * 业务数据，存储为 JSON 对象
     */
    data: Record<string, any>;

    /**
     * CSS 样式对象，如 { width: 200, height: 100, backgroundColor: "#f0f0f0" }
     */
    style?: Record<string, any>;

    /**
     * CSS 类名（避免使用 class 关键字）
     */
    className?: string;

    /**
     * 父节点 ID，用于嵌套
     */
    parentNodeId?: string;

    /**
     * 层级顺序
     */
    zIndex?: number;

    /**
     * 是否隐藏
     */
    hidden?: boolean;

    /**
     * 默认输出端口的方向（source handle）
     */
    sourcePosition?: NodePosition;

    /**
     * 默认输入端口的方向（target handle）
     */
    targetPosition?: NodePosition;

    /**
     * 是否可以被选中
     */
    selectable?: boolean;

    /**
     * 是否可以拖拽
     */
    draggable?: boolean;

    /**
     * 是否可以被连接
     */
    connectable?: boolean;

    /**
     * 是否可以通过删除键删除
     */
    deletable?: boolean;

    /**
     * 是否可聚焦
     */
    focusable?: boolean;

    /**
     * 是否参与自动布局测量
     */
    measurable?: boolean;

    /**
     * 当节点位置变化时是否自动扩展父节点
     */
    expandParent?: boolean;

    /**
     * 变换缩放的原点 origin[0]
     */
    originX?: number;

    /**
     * 变换缩放的原点 origin[1]
     */
    originY?: number;

    /**
     * 节点尺寸 width（一般由前端自动计算，但后端可能缓存）
     */
    dimensionsWidth?: number;

    /**
     * 节点尺寸 height
     */
    dimensionsHeight?: number;

    /**
     * 创建时间 (ISO 8601 字符串)
     */
    createdAt?: string;

    /**
     * 更新时间
     */
    updatedAt?: string;

    /**
     * 节点类型元信息（非数据库字段，用于前端渲染组件等）
     */
    nodeType?: NodeType;
}