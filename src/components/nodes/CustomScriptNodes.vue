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
      
      <div class="config-group">
        <!--可以编辑标题-->
        <div class="config-item">
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

        <div class="action-group">
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
/* 节点整体容器 */
.vue-flow__node-customScript {
  padding: 4px;
  background: transparent;
  /* border: 1px solid #e5e7eb; */
  border-radius: 4px;
  min-width: 280px;
  font-size: 13px;
  position: relative;
  min-width: 80px;
  min-height: 80px;
}
.edit-mode {
  background: rgb(246, 245, 245);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
 border: 2px solid #6b7280;
}

.icon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border: 2px solid #6b7280;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon-display:hover{
   border-color: #4b5563;
}

.icon-container {
  display: flex;
  align-items: center;
  flex-direction: column; 
}
.node-icon {
  margin-right: 0;
  color: #4b5563;
  font-size: 24px; 
  margin-bottom: 4px; 
}
.node-title {
  font-weight: 500;
  color: #1f2937;
}


.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}
.edit-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.close-button {
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.close-button:hover {
  background-color: #5f6164;
}

/* 配置项分组 */
.config-group {
  margin-bottom: 16px;
}
.config-item {
  margin-bottom: 12px;
}
.section-label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  font-weight: 500;
}
/* 输入框/文本域 统一小尺寸 */
.title-input,
.config-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}
.config-textarea {
  font-family: monospace;
  resize: vertical;
}

/* 按钮组 */
.action-group {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.execute-button,
.done-button {
  padding: 4px 12px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
}
.execute-button {
  background-color: #306933;
}
.done-button {
  background-color: #409EFF;
}
.execute-button:hover {
  background-color: #45a049;
}
.done-button:hover {
  background-color: #3385ff;
}

/* 结果区域 */
.result-section {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}
.result-pre {
  background: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 6px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
  white-space: pre-wrap;
}

.node-handle {
  width: 12px !important;
  height: 12px !important;
  background-color: #8d949e; 
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  transition: all 0.3s ease;
}
.node-handle:hover {
  background-color: #6b7280; 
  transform: scale(1.2);
}

</style>