<template>
  <div class="workflow-editor">
    <!-- 左侧侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <el-menu default-active="1" class="sidebar-menu" router>
        <el-menu-item index="1">
          <el-icon><House /></el-icon>
          <span>Overview</span>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon><Document /></el-icon>
          <span>Personal</span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-footer">
        <el-button type="text">
          <el-icon><Grid /></el-icon>
          <span>Template</span>
        </el-button>
        <el-button type="text">
          <el-icon><DataLine /></el-icon>
          <span>Variables</span>
        </el-button>
        <el-button type="text">
          <el-icon><PieChart /></el-icon>
          <span>Insights</span>
        </el-button>
        <el-button type="text">
          <el-icon><QuestionFilled /></el-icon>
          <span>Help</span>
        </el-button>
        <el-button type="text">
          <el-icon><Notification /></el-icon>
          <span>What's New</span>
        </el-button>
      </div>
    </el-aside>
    <!-- 主要内容部分 包含导航栏和画布区域 -->
    <section class="main-content">
      <!-- 顶部导航部分  -->
      <el-card class="nav-bar" shadow="never">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">
            <el-icon><House /></el-icon>
            Overview
          </el-breadcrumb-item>
          <el-breadcrumb-item>Workflow Editor</el-breadcrumb-item>
          <el-breadcrumb-item v-if="currentWorkflowName">{{currentWorkflowName }}</el-breadcrumb-item>
        </el-breadcrumb>
      </el-card>
      <el-main class="canvas-area" @dragover="onDragOver" @drop="onDrop">
        <VueFlow
        :node="nodes"
        :edges="edges" 
        :node-types="nodeTypes" 
        fit-view-on-init
        class="vue-flow-container"
        @connect="handleConnect"
        @nodes-change="onNodesChange"
        @edges-change="onEdgesChange"
        >
          <Background pattern-color="#aaa" gap="16" />
          <Controls />
        </VueFlow>
        <el-button type="warning" class="execute-btn">Execute workflow</el-button>
      </el-main>
    </section>
    <RightsideBar />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";
import { VueFlow, useVueFlow, type NodeComponent, type NodeTypesObject, type Node, type Edge, type Connection} from "@vue-flow/core"; //  核心组件
import { Background } from "@vue-flow/background"; // 背景组件
import { Controls } from "@vue-flow/controls"; // 控制组件
import "@vue-flow/core/dist/style.css";
import { markRaw } from "vue";
import { House, Document, Grid, DataLine, PieChart } from "@element-plus/icons-vue";
import { useRoute, useRouter } from "vue-router"; 
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
    customScript : markRaw(CustomScriptNode) as NodeComponent,
    httpRequest : markRaw(HttpRequests) as NodeComponent,
    IfConditionConfig : markRaw(IfConditionConfig) as NodeComponent,
    Webhook : markRaw(Webhook) as NodeComponent,
    mysql : markRaw(MySQLNode) as NodeComponent,
    FilterNode : markRaw(FilterNode) as NodeComponent,
    postgresql : markRaw(PostgreSQLNode) as NodeComponent,
    splitter : markRaw(SplitterNode) as NodeComponent,
    combiner : markRaw(CombinerNode) as NodeComponent,
};

const currentWorkflowName = ref(""); 

const isExecuting = ref(false);
const executionResult = ref(null);
const { addNodes, addEdges, project } = useVueFlow();

const handleConnect = (connection : Connection) =>{
  if(connection.source === connection.target){
    return;
  }
   const newEdge: Edge = {
    id: `${connection.source}-${connection.target}-${Date.now()}`,
    source: connection.source!,
    target: connection.target!,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep',
    style: { stroke: '#555', strokeWidth: 2 }
  };
  addEdges([newEdge]);
};


const onDragOver = (event:DragEvent) => {
  event.preventDefault();
  if(event.dataTransfer){
    event.dataTransfer.dropEffect = 'move';
  }
}
// 放置的逻辑
const onDrop = async (event:DragEvent) => {
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
    
    const newNode = {
      id: `${nodeType}-${Date.now()}`, 
      type: nodeType, 
      position: projectedPosition,
      data: { label: `${nodeType} Node` } 
    };
    addNodes([newNode]);
    await nextTick();
  }
};


</script>

<style scoped>
.workflow-editor {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #f5f7fa;
}

.sidebar {
  background: #fff;
  border-right: 1px solid #e5e7eb;
}

.sidebar-menu {
  border-right: none;
}

.sidebar-footer {
  position: absolute;
  bottom: 24px; 
  padding: 0 16px;
  box-sizing: border-box; 
  display: flex;
  flex-direction: column; 
  gap: 8px; 
}

.sidebar-footer .el-button {
  color: #666666;
  padding: 6px 12px; 
}

.sidebar-footer .el-button:hover {
  color: #4096ff; 
}
.el-menu-item {
  color: #333333; 
  padding: 12px 16px;
}

.el-menu-item.is-active {
  color: #4096ff; 
  background-color: #e6f7ff;
}
/* 主要区域 保证画布占据所有屏幕 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏样式 */
.nav-bar {
  margin: 0;
  border-radius: 0;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 16px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.canvas-area {
  flex: 1;
  position: relative;
  height: 100%;
  background-color: #ffffff;
}

.vue-flow-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #f9fafb;
}

.execute-btn {
  position: absolute;
  bottom: 24px; 
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: #f25f5f;
  color: #ffffff;
  border: none;
}

.execute-btn:hover {
  background-color: #e53935;
}
</style>
