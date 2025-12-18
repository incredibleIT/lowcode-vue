/**
 * 流程边（连接线）实体（对应后端 com.lowcode.workflow.runner.graph.data.struct.template.Edge）
 */
export interface Edge {
    /**
     * 边唯一ID
     */
    id: string;

    /**
     * 所属流程ID
     */
    flowId: string;

    /**
     * 源节点 ID
     */
    source: string;

    /**
     * 目标节点 ID
     */
    target: string;

    /**
     * 边类型：default / smoothstep / straight / custom 等
     */
    type?: string;

    /**
     * 业务数据中用户自定义数据的 key
     */
    edgeDataFieldKey?: string;

    /**
     * 业务数据（JSON 对象）
     */
    data?: Record<string, any>;

    /**
     * 边的样式，如 { stroke: "#ff0000", strokeWidth: 2 }
     */
    style?: Record<string, any>;

    /**
     * 自定义 CSS 类名
     */
    className?: string;

    /**
     * 起始箭头标记（如 'arrowopen'）
     */
    markerStart?: string;

    /**
     * 结束箭头标记，默认为 'arrowclosed'
     */
    markerEnd?: string;

    /**
     * 标签文本（字符串形式，复杂结构需 JSON 序列化）
     */
    label?: string;

    /**
     * 标签样式
     */
    labelStyle?: Record<string, any>;

    /**
     * 是否显示标签背景
     */
    labelShowBg?: boolean;

    /**
     * 标签背景样式
     */
    labelBgStyle?: Record<string, any>;

    /**
     * 标签背景内边距 X
     */
    labelBgPaddingX?: number;

    /**
     * 标签背景内边距 Y
     */
    labelBgPaddingY?: number;

    /**
     * 标签背景圆角
     */
    labelBgBorderRadius?: number;

    /**
     * 是否显示流动动画
     */
    animated?: boolean;

    /**
     * 可更新性：true / false / "source" / "target"
     */
    updatable?: string | boolean;

    /**
     * 是否可以选中
     */
    selectable?: boolean;

    /**
     * 是否可以删除
     */
    deletable?: boolean;

    /**
     * 是否可以聚焦
     */
    focusable?: boolean;

    /**
     * 是否隐藏此边
     */
    hidden?: boolean;

    /**
     * 层级顺序
     */
    zIndex?: number;

    /**
     * 起始节点的 Handle ID（用于多端口连接）
     */
    sourceHandle?: string;

    /**
     * 目标节点的 Handle ID
     */
    targetHandle?: string;

    /**
     * 边的可交互区域宽度，默认 20
     */
    interactionWidth?: number;

    /**
     * 创建时间 (ISO 8601 字符串)
     */
    createdAt?: string;

    /**
     * 更新时间
     */
    updatedAt?: string;
}