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
          <el-button type="text">Help</el-button>
          <el-button type="text">What's New</el-button>
        </div>
      </el-aside>
      <!-- 主要内容部分 包含导航栏和画布区域 -->
      <section class="main-content">
        <!-- 顶部导航部分  -->
        <el-card class="nav-bar" shadow="never">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{path: '/' }">
              <el-icon><House /></el-icon>
              Overview
            </el-breadcrumb-item>
            <el-breadcrumb-item>Workflow Editor</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentWorkflowName">{{ currentWorkflowName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </el-card>
        <!-- 主流程画布区域 -->
        <el-main class="canvas-area">
          <VueFlow
            fit-view-on-init
            class="vue-flow-container">
            <Background pattern-color="#aaa" gap="16" />
            <Controls />
            </VueFlow>
          <el-button type="warning" class="execute-btn">Execute workflow</el-button>
        </el-main>
      </section>
      <RightsideBar/>
    </div>
</template>
  
<script setup lang="ts">
  import { ref } from 'vue';
  // 修改导入组件 
  import { VueFlow,useVueFlow} from '@vue-flow/core'; //  核心组件
  import { Background } from '@vue-flow/background' // 背景组件
  import { Controls } from '@vue-flow/controls'     // 控制组件
  import '@vue-flow/core/dist/style.css';
  import { House, Document } from '@element-plus/icons-vue';
  import { useRoute,useRouter } from 'vue-router';// 导入使用路由 
  import RightsideBar from '@/components/workflow/RightsideBar.vue';

  // 获取当前的路由信息，读取URL传参
  const route = useRoute();
  const router = useRouter();
  
  const currentWorkflowName = ref(''); // 初始值为空字符串

  // useVueFlow   使用几个示例节点 
  const {addNodes,addEdges,onInit} = useVueFlow();
  onInit(() => {
    addNodes([
      {
          id: '1',
          type: 'input',
          label: 'Schedule Trigger',
          position: { x: 100, y: 100 },
          class: 'light',
      },
      {
          id: '2',
          type: 'default',
          label: 'AI Agent',
          position: { x: 400, y: 100 },
          class: 'light',
      }
    ])
    addEdges([
      { id: 'e1-2', source: '1', target: '2' }
    ]);
  });
</script>
  
<style scoped>
  .workflow-editor {
    display: flex;
    height: 100vh;
    width:100vw;
  }
  
  .sidebar {
    background: #fff;
    border-right: 1px solid #eee;
  }
  
  .sidebar-menu {
    border-right: none;
  }
  
  .sidebar-footer {
    position: absolute;
    bottom: 20px;
    left: 20px;
  }
  
  /* 主要区域 保证画布占据所有屏幕 */
  .main-content{
    flex: 1;
    display: flex;
    flex-direction: column; 
  }

  /* 新增：顶部导航栏样式 */
  .nav-bar {
      margin: 0;
      border-radius: 0;
      border-bottom: 1px solid #e4e7ed;
      padding: 16px 20px;
      background-color: #ffffff;
  }

  .canvas-area {
    flex: 1;
    position: relative;
    height : 100%;
    background-color: #1f1f1f;
  }
  
  .vue-flow-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
  }

  .execute-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }
</style>