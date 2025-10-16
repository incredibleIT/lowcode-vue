<template>
  <div class="vue-flow__node-customScript">
    <!-- 上下连线的准备 -->
    <Handle 
      id="target-top" 
      type="target" 
      :position="Position.Top" 
      :connectable="true" 
      class="node-handle"
    />
    <Handle 
      id="source-bottom" 
      type="source" 
      :position="Position.Bottom" 
      :connectable="true" 
      class="node-handle"
    />

    <!-- 图标显示 -->
    <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
      <div class="icon-container">
        <!-- 引入Icon -->
        <IconCustomScript class="node-icon" />
        <span class="node-title">{{ localConfig.title || '自定义脚本' }}</span>
      </div>
    </div>

    <!-- 配置信息 -->
    <div v-else class="edit-mode">
      <div class="edit-header">
        <span class="edit-title">配置脚本节点</span>
        <button class="close-button" @click="exitEditMode">×</button>
      </div>
      
      <div class="edit-content">
        <!--可以编辑标题-->
        <div class="config-section">
          <label class="section-label">节点标题</label>
          <input
            v-model="localConfig.title"
            @blur="updateNodeData"
            class="title-input"
            placeholder="输入节点标题"
          />
        </div>

        <div class="config-section">
          <label class="section-label">输入数据 (JSON) : </label>
          <textarea 
            v-model="localConfig.inputData" 
            rows="3" 
            class="config-textarea"
            placeholder='{"example": "data"}'
            @blur="updateNodeData"
          ></textarea>
        </div>

        <div class="config-section">
          <label class="section-label">JavaScript 代码：</label>
          <textarea
            v-model="localConfig.code"
            rows="6"
            class="config-textarea"
            placeholder="// 处理 inputData，返回结果&#10;return inputData;"
            @blur="updateNodeData"
          ></textarea>
        </div>

        <div class="node-actions">
          <button class="execute-button" @click="executeScript">执行脚本</button>
          <button class="done-button" @click="exitEditMode">完成</button>
        </div>

        <div v-if="localConfig.executionResult" class="result-section">
          <strong>输出：</strong>
          <pre class="result-pre">{{ formattedResult }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
// 导入Icon
import IconCustomScript from "@/components/icons/IconCustomScript.vue";

// 定义节点数据类型
interface CustomScriptConfig {
  title: string;
  inputData: string;
  code: string;
  executionResult?: any;
}

// 接收从画布初始数据
const props = defineProps<{
  id: string;
  type: string;
  selected: boolean;
  connectable: boolean;
  position: { x: number; y: number };
  data: CustomScriptConfig;
  label?: string;
  targetPosition?: string;
  sourcePosition?: string;
}>();

const { updateNode } = useVueFlow();

// 节点本地配置
const localConfig = computed<CustomScriptConfig>(() => {
  const config: CustomScriptConfig = {
    title: props.data.title || "自定义脚本",
    inputData: props.data.inputData || "{}",
    code: props.data.code || "// 处理 inputData，返回结果\nreturn inputData;",
  };
  if (props.data.executionResult !== undefined) {
    config.executionResult = props.data.executionResult;
  }
  return config;
});


const isEditing = ref(false);

const formattedResult = computed(() => {
  if (!localConfig.value.executionResult) return '';
  try {
    if (typeof localConfig.value.executionResult === 'object') {
      return JSON.stringify(localConfig.value.executionResult, null, 2);
    }
    return String(localConfig.value.executionResult);
  } catch {
    return '无法显示结果';
  }
});

// 双击进入
const enterEditMode = () => {
  isEditing.value = true;
};


const exitEditMode = () => {
  isEditing.value = false;
  updateNodeData();
};

const safeExecute = (code: string, data: any) => {
  const allowedGlobals = {
    inputData: data,
    JSON: JSON,
    Math: Math,
    Date: Date,
    console: { log: console.log }
  };

  try {
    const keys = Object.keys(allowedGlobals);
    const values = Object.values(allowedGlobals);

    const func = new Function(...keys, `
      "use strict";
      try {
        ${code}
      } catch (e) {
        return { error: e.message };
      }
    `);

    return func(...values);
  } catch (error) {
    const ErrorMsg = (error as Error).message
    throw new Error(`执行错误: ${ErrorMsg}`);
  }
};

// 执行脚本
const executeScript = async () => {
  try {
    const inputData = JSON.parse(localConfig.value.inputData || "{}");
    const result = safeExecute(localConfig.value.code, inputData);
    localConfig.value.executionResult = result;
    updateNodeData();
  } catch (error: any) {
    localConfig.value.executionResult = { error: error.message };
    updateNodeData();
  }
};

const updateNodeData = () => {
  updateNode(props.id, { data: { ...localConfig.value } });
};
</script>

<style scoped>
.vue-flow__node-customScript {
  position: relative;
  min-width: 80px;
  min-height: 80px;
}

.node-handle {
  opacity: 0.7;
  transition: opacity 0.2s;
}

.vue-flow__node-customScript:hover .node-handle {
  opacity: 1;
}

.icon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-display:hover {
  border-color: #2E7D32;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  transform: scale(1.05);
}

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.node-icon {
  width: 40px;
  height: 40px;
  color: #4CAF50;
}

.node-title {
  font-size: 12px;
  color: #4CAF50;
  font-weight: 600;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-mode {
  min-width: 280px;
  border: 2px solid #409EFF;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #409EFF;
  color: white;
  border-radius: 6px 6px 0 0;
}

.edit-title {
  font-weight: 600;
  font-size: 14px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-content {
  padding: 16px;
}

.config-section {
  margin-bottom: 16px;
}

.section-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}

.title-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.config-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 6px 8px;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}

.node-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 8px;
}

.execute-button {
  padding: 6px 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.done-button {
  padding: 6px 12px;
  background: #409EFF;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.execute-button:hover {
  background: #45a049;
}

.done-button:hover {
  background: #3385ff;
}

.result-section {
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 11px;
}

.result-pre {
  margin: 4px 0 0 0;
  white-space: pre-wrap;
  background: white;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>