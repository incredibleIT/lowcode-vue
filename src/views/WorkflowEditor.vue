<template>
    <div class="workflow-editor">
      <!-- 左侧侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <el-menu default-active="1" class="sidebar-menu">
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
  
      <!-- 主流程画布区域 -->
      <!-- <el-main class="canvas-area">
        <VueFlow
          v-model="elements"
          fit-view
          class="vue-flow-container"
        />
        <el-button type="warning" class="execute-btn">Execute workflow</el-button>
      </el-main> -->
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  //import { VueFlow, useVueFlow, Background, Control } from '@vue-flow/core';
  //import '@vue-flow/core/dist/style.css';
  import { House, Document } from '@element-plus/icons-vue';
  
 
  </script>
  
  <style scoped>
  .workflow-editor {
    display: flex;
    height: 100vh;
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
  
  /* .canvas-area {
    flex: 1;
    position: relative;
  } */
  
  /* .vue-flow-container {
    width: 100%;
    height: calc(100vh - 40px);
  }
   */
  /* .execute-btn {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  } */
  </style>