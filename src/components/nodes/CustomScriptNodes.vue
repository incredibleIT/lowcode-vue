<template>
  <div class="vue-flow__node-customScript">
    <!-- 输入 Handle：允许上游节点连线到此 -->
    <!-- 问题一 上下都添加了handle但是到浏览器里节点到画布上连不了线。 -->
    <Handle type="target" position="top" :connectable="true" />
    <div class="node-body">
      <div class="node-header" @dblclick="toggleEditing">
        <span v-if="!isEditingTitle">{{ localConfig.title }}</span>
        <input
          v-else
          v-model="localConfig.title"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          autofocus
        />
      </div>

      <div class="config-section">
        <label>输入数据 (JSON)：</label>
        <textarea v-model="localConfig.inputData" rows="3"></textarea>
      </div>

      <div class="config-section">
        <label>JavaScript 代码：</label>
        <textarea
          v-model="localConfig.code"
          rows="6"
          placeholder="// 处理 inputData，返回结果&#10;return inputData;"
        ></textarea>
      </div>

      <div class="node-actions">
        <button @click="executeScript">执行脚本</button>
      </div>

      <div v-if="localConfig.executionResult" class="result-section">
        <strong>输出：</strong>
        <pre>{{ localConfig.executionResult }}</pre>
      </div>
    </div>

    <!-- 输出 Handle：允许从此节点连线到下游 -->
    <Handle type="source" position="bottom" :connectable="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";

// 定义节点类型
interface CustomScriptConfig {
  title: string;
  inputData: string;
  code: string;
  executionResult?: any;
}

// 接收从画布传入的初始数据
const props = defineProps<{
  id: string;
  data: CustomScriptConfig;
}>();

const { updateNode } = useVueFlow();

const localConfig = ref<CustomScriptConfig>({ ...props.data });
// 标题编辑状态
const isEditingTitle = ref(false);

// 主要执行脚本方法 把JSON转成JS 对象类  
const safeExecute = (code: string, data: any) => {
  // 定义允许的全局变量白名单
  const allowedGlobals = {
    inputData: data,
    JSON: JSON,
    Math: Math,
    Date: Date,
    console: { log: console.log } // 仅开放 console.log
  };

  try {
    // 获取允许的全局变量的键和值
    const keys = Object.keys(allowedGlobals);
    const values = Object.values(allowedGlobals);

    // 使用 Function 构造函数，将允许的全局变量作为参数传递
    const func = new Function(...keys, `
      "use strict";
      try {
        ${code}
      } catch (e) {
        return { error: e.message };
      }
    `);

    // 调用函数并传入允许的全局变量值
    return func(...values);
  } catch (error) {
    throw new Error(`执行错误: ${error.message}`);
  }
};

// 执行脚本 调用上面的safeExecute 
const executeScript = async () => {
  try {
    const inputData = JSON.parse(localConfig.value.inputData || "{}");
    const result = safeExecute(localConfig.value.code, inputData);
    // 更新执行结果
    localConfig.value.executionResult = result;
    updateNodeData();
  } catch (error) {
    localConfig.value.executionResult = { error: error.message };
    updateNodeData();
  }
};

// 本地配置同步到画布节点数据
const updateNodeData = () => {
  updateNode(props.id, { data: { ...localConfig.value } });
};
//标题编辑
const toggleEditing = () => {
  isEditingTitle.value = true;
};
const saveTitle = () => {
  isEditingTitle.value = false;
  updateNodeData(); // 标题修改后也同步到画布
};

</script>

<style scoped>
.vue-flow__node-customScript {
  padding: 12px;
  background: #fff;
  border: 2px solid #888;
  border-radius: 8px;
  min-width: 250px;
  font-size: 12px;
}
.node-header {
  font-weight: bold;
  margin-bottom: 8px;
  cursor: pointer;
}
.config-section {
  margin-bottom: 8px;
}
.config-section label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
}
.config-section textarea {
  width: 80%;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  font-family: monospace;
}
.node-actions {
  margin-top: 8px;
  text-align: center;
}
.result-section {
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 11px;
}
pre {
  margin: 4px 0 0 0;
  white-space: pre-wrap;
}
</style>
