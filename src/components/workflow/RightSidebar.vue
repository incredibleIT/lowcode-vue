<template>
  <div class="right-sidebar">
    <el-tabs 
      v-model="activeTab" 
      type="border-card" 
      stretch 
      class="sidebar-tabs"
    >
      <el-tab-pane name="nodes">
        <template #label>
          <span class="tab-label">
            <el-icon><Grid /></el-icon>
            <span>节点库</span>
          </span>
        </template>
        <NodePalette />
      </el-tab-pane>

      <!-- 属性面板标签页 (为未来预留) -->
      <el-tab-pane name="properties">
        <template #label>
          <span class="tab-label">
            <el-icon><Setting /></el-icon>
            <span>属性</span>
          </span>
        </template>
        <div class="property-panel-placeholder">
          <p>选择画布上的节点以编辑属性</p>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Grid, Setting } from '@element-plus/icons-vue';
import NodePalette from './NodePalette.vue'; // 导入节点库

const activeTab = ref('nodes'); 
</script>

<style scoped>
.right-sidebar {
  width: 320px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.sidebar-tabs {
  flex: 1;
  border: none;
  border-radius: 0;
}

.sidebar-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.sidebar-tabs :deep(.el-tabs__content) {
  padding: 0;
  height: calc(100% - 40px);
  overflow-y: auto;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.property-panel-placeholder {
  padding: 20px;
  text-align: center;
  color: #4f5053;
}
</style>