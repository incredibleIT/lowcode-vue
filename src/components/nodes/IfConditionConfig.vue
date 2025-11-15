<template>
    <div class="vue-flow__node-ifCondition">
      <!-- 上下连线的Handle -->
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
  
      <!-- 非编辑态：显示图标 + 标题 -->
      <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
        <div class="icon-container">
          <!-- 替换为条件判断图标（需提前准备IconIfCondition组件） -->
          <IconConditions class="node-icon" />
          <span class="node-title">{{ localConfig.title || '条件判断' }}</span>
        </div>
      </div>

      <div v-else class="edit-mode">
        <div class="edit-header">
          <span class="edit-title">配置条件判断节点</span>
          <button class="close-button" @click="exitEditMode">×</button>
        </div>
        
        <div class="config-group">
          <!-- 节点标题 -->
          <div class="config-item">
            <label class="section-label">节点标题</label>
            <input
              v-model="localConfig.title"
              @blur="updateNodeData"
              class="title-input"
              placeholder="输入节点标题"
            />
          </div>
  
          <!-- 条件表达式（JavaScript） -->
          <div class="config-section">
            <label class="section-label">条件表达式 (JavaScript)：</label>
            <textarea
              v-model="localConfig.condition"
              rows="3"
              class="config-textarea"
              placeholder="// 编写返回布尔值的条件，如 inputData.age > 18&#10;return inputData.age > 18;"
              @blur="updateNodeData"
            ></textarea>
          </div>
  
          <!-- 输入数据（JSON） -->
          <div class="config-section">
            <label class="section-label">输入数据 (JSON)：</label>
            <textarea 
              v-model="localConfig.inputData" 
              rows="3" 
              class="config-textarea"
              placeholder='{"age": 20}'
              @blur="updateNodeData"
            ></textarea>
          </div>
  
          <!-- 执行/完成按钮 -->
          <div class="action-group">
            <button class="execute-button" @click="executeCondition">执行条件</button>
            <button class="done-button" @click="exitEditMode">完成</button>
          </div>
  
          <!-- 执行结果 -->
          <div v-if="localConfig.executionResult" class="result-section">
            <strong>条件结果：</strong>
            <pre class="result-pre">{{ formattedResult }}</pre>
          </div>
        </div>
      </div>
    </div>
  </template>


  <script setup lang="ts">
  import { ref, computed } from "vue";
  import { Handle, Position, useVueFlow } from "@vue-flow/core";
  import IconConditions from "../icons/IconConditions.vue";
  
  // 定义节点数据类型：新增condition字段，用于条件表达式
  interface IfConditionConfig {
    title: string;
    inputData: string;
    condition: string; // 条件表达式（JavaScript）
    executionResult?: boolean | { error: string }; // 执行结果（布尔或错误）
  }
  
  // 接收画布传递的节点数据
  const props = defineProps<{
    id: string;
    type: string;
    selected: boolean;
    connectable: boolean;
    position: { x: number; y: number };
    data: IfConditionConfig;
    label?: string;
    targetPosition?: string;
    sourcePosition?: string;
  }>();
  
  const { updateNode } = useVueFlow();
  
  // 节点本地配置：默认条件表达式为 `return inputData.age > 18`
  const localConfig = computed<IfConditionConfig>(() => {
    const config: IfConditionConfig = {
      title: props.data.title || "条件判断",
      inputData: props.data.inputData || "{}",
      condition: props.data.condition || "// 编写返回布尔值的条件，如 inputData.age > 18\nreturn inputData.age > 18;",
    };
    if (props.data.executionResult !== undefined) {
      config.executionResult = props.data.executionResult;
    }
    return config;
  });
  
  const isEditing = ref(false);
  
  // 格式化执行结果（布尔转文字，或显示错误）
  const formattedResult = computed(() => {
    if (localConfig.value.executionResult === undefined) return "";
    if (typeof localConfig.value.executionResult === "boolean") {
      return localConfig.value.executionResult ? "条件成立" : "条件不成立";
    }
    return `执行错误: ${localConfig.value.executionResult.error}`;
  });
  
  // 双击进入编辑态
  const enterEditMode = () => {
    isEditing.value = true;
  };
  
  // 退出编辑态，更新节点数据
  const exitEditMode = () => {
    isEditing.value = false;
    updateNodeData();
  };
  
  // 安全执行条件表达式（限制全局变量，捕获错误）
  const safeExecuteCondition = (conditionCode: string, data: any) => {
    const allowedGlobals = {
      inputData: data,
      JSON: JSON,
      Math: Math,
      Date: Date,
      console: { log: console.log },
    };
  
    try {
      const keys = Object.keys(allowedGlobals);
      const values = Object.values(allowedGlobals);
  
      // 动态创建函数，执行条件表达式
      const func = new Function(...keys, `
        "use strict";
        try {
          return !!(${conditionCode}); // 强制转为布尔值
        } catch (e) {
          return { error: e.message };
        }
      `);
  
      return func(...values);
    } catch (error) {
      const errorMsg = (error as Error).message;
      throw new Error(`执行错误: ${errorMsg}`);
    }
  };
  
  // 执行条件判断
  const executeCondition = async () => {
    try {
      const inputData = JSON.parse(localConfig.value.inputData || "{}");
      const result = safeExecuteCondition(localConfig.value.condition, inputData);
      localConfig.value.executionResult = result;
      updateNodeData();
    } catch (error: any) {
      localConfig.value.executionResult = { error: error.message };
      updateNodeData();
    }
  };
  
  // 更新节点数据到画布
  const updateNodeData = () => {
    updateNode(props.id, { data: { ...localConfig.value } });
  };
  </script>


  <style scoped>
  .vue-flow__node-ifCondition {
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
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 20px;
  }
  
  .icon-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    cursor: pointer;
    border: 2px solid #F97316;
    background: white;
    border-radius: 8px;
    transition: all 0.3s ease;
    min-height: 100px;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .icon-display:hover{
    border-color: #EA580C;
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2); 
    transform: translateY(-2px);
    transition: all 0.3s ease;   
  }

  .icon-container {
    display: flex;
    align-items: center;
    flex-direction: column; 
  }
  .node-icon {
    width: 40px;
    height: 40px;
    color: #F97316;
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
    background-color: #f3f4f6;
  }
  
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
    background-color: #F97316;
  }
  .execute-button:hover {
    background-color: #EA580C; /* 加深橙色 */
  }
  .done-button {
    background-color: #FB923C; /* 浅橙色按钮 */
  }
  .done-button:hover {
    background-color: #F97316; /* 主色 hover */
  }
    
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

  .node-handle{
    width: 12px !important;
    height: 12px !important;
    background-color: #FDBA74; /* 浅橙色句柄 */
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    transition: all 0.3s ease;
  }
  .node-handle:hover{
    background-color: #FB923C;
  }
  </style>