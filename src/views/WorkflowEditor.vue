<template>
    <div class="main-workflow-editor">
        <div class="c" @dragover="onDragOver" @drop="onDrop">
            <VueFlow
                :nodes="nodes"
                :edges="edges"
                :node-types="nodeTypes"
                fit-view-on-init
                @connect="handleConnect"
            >
                <Background pattern-color="#aaa" :gap="16"/>
                <Controls/>
            </VueFlow>
        </div>

        <div>
            <RightsideBar/>
        </div>

    </div>
</template>

<script setup lang="ts">
import {nextTick, ref} from "vue";
import {
    VueFlow,
    useVueFlow,
    type NodeComponent,
    type NodeTypesObject,
    type Node,
    type Edge,
    type Connection
} from "@vue-flow/core"; //  核心组件
import {Background} from "@vue-flow/background"; // 背景组件
import {Controls} from "@vue-flow/controls"; // 控制组件
import "@vue-flow/core/dist/style.css";
import {markRaw} from "vue";
import {useRoute, useRouter} from "vue-router";
import RightsideBar from "@/components/workflow/RightSidebar.vue";
import CustomScriptNode from "@/components/nodes/CustomScriptNodes.vue";
import HttpRequests from "@/components/nodes/HttpRequests.vue";
import IfConditionConfig from "@/components/nodes/IfConditionConfig.vue";
import Webhook from "@/components/nodes/Webhook.vue";
import MySQLNode from "@/components/nodes/MySQLNode.vue";
import FilterNode from "@/components/nodes/FilterNode.vue";
import PostgreSQLNode from "@/components/nodes/PostgreSQLNode.vue";
import SplitterNode from "@/components/nodes/SplitterNode.vue";
import CombinerNode from "@/components/nodes/CombinerNode.vue";

const route = useRoute();
const router = useRouter();

const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

const nodeTypes: NodeTypesObject = {
    customScript: markRaw(CustomScriptNode) as NodeComponent,
    httpRequest: markRaw(HttpRequests) as NodeComponent,
    IfConditionConfig: markRaw(IfConditionConfig) as NodeComponent,
    Webhook: markRaw(Webhook) as NodeComponent,
    mysql: markRaw(MySQLNode) as NodeComponent,
    FilterNode: markRaw(FilterNode) as NodeComponent,
    postgresql: markRaw(PostgreSQLNode) as NodeComponent,
    splitter: markRaw(SplitterNode) as NodeComponent,
    combiner: markRaw(CombinerNode) as NodeComponent,
};

const currentWorkflowName = ref("");

const isExecuting = ref(false);
const executionResult = ref(null);
const {addNodes, addEdges, project} = useVueFlow();

const handleConnect = (connection: Connection) => {
    if (connection.source === connection.target) {
        return;
    }
    const newEdge: Edge = {
        id: `${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'smoothstep',
        style: {stroke: '#555', strokeWidth: 2}
    };
    addEdges([newEdge]);
};


const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
    }
}
// 放置的逻辑
const onDrop = async (event: DragEvent) => {
    event.preventDefault();
    const nodeType = event.dataTransfer?.getData('application/vueflow-node-type');
    if (nodeType && nodeTypes[nodeType as keyof typeof nodeTypes]) {
        // 计算鼠标在画布上的位置
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const position = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        const projectedPosition = project(position);

        // 根据节点类型提供合适的初始数据结构
        let initialData: any = {};

        switch (nodeType) {
            case 'customScript':
                initialData = {
                    title: '自定义脚本',
                    inputData: '{}',
                    code: '// 处理 inputData，返回结果\nreturn inputData;'
                };
                break;
            case 'httpRequest':
                initialData = {
                    title: 'HTTP请求',
                    method: 'GET',
                    url: '',
                    headers: [],
                    params: [],
                    body: '',
                    bodyType: 'json'
                };
                break;
            case 'IfConditionConfig':
                initialData = {
                    title: '条件判断',
                    condition: '',
                    trueBranch: [],
                    falseBranch: []
                };
                break;
            case 'Webhook':
                initialData = {
                    title: 'Webhook',
                    endpoint: '',
                    method: 'POST',
                    secret: ''
                };
                break;
            case 'mysql':
                initialData = {
                    title: 'MySQL查询',
                    connection: '',
                    query: 'SELECT * FROM table',
                    parameters: []
                };
                break;
            case 'FilterNode':
                initialData = {
                    title: '过滤器',
                    filterMode: 'keep',
                    conditionType: 'and',
                    conditions: [{
                        field: 'data.value',
                        operator: 'eq',
                        value: ''
                    }],
                    emptyDataBehavior: 'passEmpty'
                };
                break;
            case 'postgresql':
                initialData = {
                    title: 'PostgreSQL',
                    connection: '',
                    query: 'SELECT * FROM table',
                    parameters: []
                };
                break;
            case 'splitter':
                initialData = {
                    title: '拆分器',
                    splitBy: 'array',
                    field: ''
                };
                break;
            case 'combiner':
                initialData = {
                    title: '合并器',
                    combineBy: 'array',
                    fields: []
                };
                break;
            default:
                initialData = {label: `${nodeType} Node`};
        }

        const newNode = {
            id: `${nodeType}-${Date.now()}`,
            type: nodeType,
            position: projectedPosition,
            data: initialData
        };
        addNodes([newNode]);
        await nextTick();
    }
};


</script>

<style scoped>
.main-workflow-editor {
    height: 100vh;
}

.c {
    width: 80%;
    height: 100%;
    border: 1px solid #e5e7eb;
    float: left;
}
</style>
