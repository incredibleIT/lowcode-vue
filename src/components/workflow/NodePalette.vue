<!-- 所有节点的图标统一放置在 src/components/icons/ 目录下, 文件名 = Icon{PascalCase}.vue-->
<template>
  <div class="node-palette">
    <h3>节点库</h3>
    <el-divider />
      <div v-for="(group, category) in groupedNodeTypes" :key="category" class="node-group">
          <h4>{{ category }}</h4>
          <div
              v-for="nt in group"
              :key="nt.typeKey"
              class="node-item"
              draggable="true"
              @dragstart="onDragStart($event, nt.typeKey)"
          >
              <component
                  :is="iconComponents[nt.icon]"
                  class="node-icon" />

              <span>{{ nt.name }}</span>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { getNodeTypeList } from "@/api/nodeType.ts";
import IconCustomScript from '../icons/IconCustomScript.vue';
import IconHttpRequest from '../icons/IconHttpRequest.vue';
import IconConditions from '../icons/IconConditions.vue';
import IconWebhook from '../icons/IconWebhook.vue';
import IconMySQL from '../icons/IconMySQL.vue';
import IconPostgreSQL from '../icons/IconPostgreSQL.vue';
import IconFilter from '../icons/IconFilter.vue';
import IconSplitter from '../icons/IconSplitter.vue';
import IconCombiner from '../icons/IconCombiner.vue';
import type {NodeComponent, NodeTypesObject} from "@vue-flow/core";
import {computed, defineComponent, markRaw, onMounted, ref} from "vue";
import CustomScriptNode from "@/components/nodes/CustomScriptNodes.vue";
import HttpRequests from "@/components/nodes/HttpRequests.vue";
import type {NodeType} from "@/interface/node-type.ts";
import {loadNodeIcon} from "@/utils/iconLoader.ts";

// 图标映射
const iconMap: Record<string, any> = {
    "user-check": IconCustomScript,
    stop: IconHttpRequest,
    ifCondition: IconConditions,
    default: IconWebhook,
    filter: IconFilter,
    splitter: IconSplitter,
    combiner: IconCombiner,
    database: IconMySQL,
    play: IconPostgreSQL,
}

const iconComponents = ref< Record<string, any> >({})
// 拖拽处理函数，跟WorkflowEditor的onDragOver 和 onDrop 呼应
const onDragStart = (event: DragEvent, nodeType: string) => {
  // 在拖拽开始时，将节点类型信息存入dataTransfer对象
  if (event && event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow-node-type', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }
};
const nodeTypes = ref <NodeType[]>( [] );

// 请求所有的节点类型数据
const loadNodeTypes = async () => {
    try {
        nodeTypes.value = await getNodeTypeList();
        console.log(nodeTypes.value);
    } catch (err) {
        console.error('Failed to load node types:', err);
    }
}


const loadAllIcons = async () => {
    const iconsToLoad = new Set<string>();
    nodeTypes.value.forEach(nt => {
        iconsToLoad.add(<string> nt.icon);
    })

    await Promise.all(
        Array.from(iconsToLoad).map(async k => {
            iconComponents.value[k] = await loadNodeIcon(k);
            console.log(k + ":" + iconComponents.value[k])
        })
    );
}


onMounted(async () => {
    await loadNodeTypes();
    await loadAllIcons();
});


const groupedNodeTypes = computed(() => {
    const groups : Record<string, NodeType[]> = {};
    nodeTypes.value.forEach(nt => {
        const cat = nt.category || "其他";
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(nt);
    });
   return groups;
});
</script>

<style scoped>
.node-palette {
  max-height: calc(100vh - 60px);
  padding: 16px;
  height: 100%;
  overflow-x: hidden;
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

.node-icon {
  width: 20px;
  height: 20px;
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







