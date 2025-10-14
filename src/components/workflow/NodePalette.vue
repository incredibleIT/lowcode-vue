<template>
  <div class="node-palette">
    <h3>节点库</h3>
    <el-divider />

    <!-- 写了一个放置节点的节点库的右边栏 节点可以写在components的nodes目录下 -->
    <!-- 放了一个自定义脚本节点，没写其他节点 -->
    <div class="node-group">
      <h4>脚本节点</h4>
      <div class="node-item" draggable="true"@dragstart="onDragStart($event, 'customScript')">
        <span>自定义脚本节点</span>
      </div>

      <h4>http请求</h4>
      <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'httpRequest')">
        
        <span>http请求节点</span>
      </div>
    </div>

    <el-divider />

    <div class="node-group">
      <h4>数据库操作</h4>
      <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'pgsql')">
        <el-icon><Postcard /></el-icon>
        <span>PostgreSQL</span>
      </div>
      <div class="node-item" draggable="true" @dragstart="onDragStart($event, 'mysql')">
        <el-icon><Document /></el-icon>
        <span>MySQL</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock, Document, Postcard } from '@element-plus/icons-vue';
// 拖拽处理函数，跟WorkflowEditor的onDragOver 和 onDrop 呼应
const onDragStart = (event: DragEvent, nodeType: string) => {
  // 在拖拽开始时，将节点类型信息存入dataTransfer对象
  if (event && event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow-node-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }
};
</script>

<style scoped>
.node-palette {
  padding: 16px;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
  border-right: 1px solid #eaeaea;
}

.node-group {
  margin-bottom: 20px;
}

.node-group h4 {
  margin: 8px 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.node-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  margin: 6px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: grab;
  background-color: #f5f7fa;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.node-item:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(32, 160, 255, 0.15);
}

.node-item:active {
  cursor: grabbing;
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.node-item .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.node-item span {
  font-size: 13px;
  color: #606266;
}
</style>