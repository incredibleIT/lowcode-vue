<template>
  <div class="vue-flow__node-combiner">
    <!-- 连接点 -->
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

    <!-- 显示图标 -->
    <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
      <div class="icon-container">
        <IconCombiner class="node-icon"/>
        <span class="node-title">{{ localConfig.title || '合并器' }}</span>
      </div>
    </div>

    <div v-else class="edit-mode">
      <div class="edit-header">
        <span class="edit-title">配置合并器节点</span>
        <button class="close-button" @click="exitEditMode">×</button>
      </div>
      <div class="edit-content-scroll">
        <div class="edit-content">
          <!-- 基本配置 -->
          <div class="config-section">
            <label class="section-label">节点标题</label>
            <el-input 
              v-model="localConfig.title" 
              placeholder="输入节点标题" 
              size="small"
              @blur="updateNodeData"
            />
          </div>

          <!-- 合并模式配置 -->
          <div class="config-section">
            <label class="section-label">合并模式</label>
            <el-select v-model="localConfig.combineMode" size="small" @change="updateNodeData">
              <el-option label="简单合并" value="simple" />
              <el-option label="按字段合并" value="byField" />
              <el-option label="自定义合并" value="custom" />
            </el-select>
          </div>

          <!-- 按字段合并配置 -->
          <div v-if="localConfig.combineMode === 'byField'" class="config-section">
            <label class="section-label">合并字段</label>
            <el-input 
              v-model="localConfig.mergeField" 
              placeholder="合并字段路径 (如: data.id)" 
              size="small"
              @blur="updateNodeData"
            />
          </div>

          <!-- 自定义合并配置 -->
          <div v-if="localConfig.combineMode === 'custom'" class="config-section">
            <label class="section-label">合并函数</label>
            <el-input 
              v-model="localConfig.mergeFunction" 
              type="textarea" 
              :rows="6" 
              placeholder="JavaScript合并函数\n(如: function(data1, data2) { return [...data1, ...data2]; })" 
              size="small"
              @blur="updateNodeData"
            />
          </div>

          <!-- 高级配置 -->
          <el-collapse class="advanced-config">
            <el-collapse-item title="高级配置">
              <div class="config-section">
                <label class="section-label">空数据处理</label>
                <el-select v-model="localConfig.emptyDataBehavior" size="small" @change="updateNodeData">
                  <el-option label="传递空数组" value="passEmpty" />
                  <el-option label="阻止下游执行" value="stopExecution" />
                  <el-option label="抛出错误" value="throwError" />
                </el-select>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
      <!-- 按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="testCombiner" :loading="isTesting">
          {{ isTesting ? '测试中...' : '测试合并' }}
        </el-button>
        <el-button type="success" size="small" @click="exitEditMode">完成</el-button>
      </div>

      <!-- 测试结果展示 -->
      <div v-if="localConfig.testResult" class="result-section">
        <el-collapse>
          <el-collapse-item title="测试结果">
            <div class="result-content">
              <p><strong>执行状态:</strong> {{ localConfig.testResult.success ? '成功' : '失败' }}</p>
              <p>
                <strong>合并前组数:</strong> {{ localConfig.testResult.inputCount }} 组
              </p>
              <p>
                <strong>合并后数量:</strong> {{ localConfig.testResult.outputCount }} 条
              </p>
              <p v-if="localConfig.testResult.sampleData">
                <strong>示例结果:</strong>
              </p>
              <pre class="result-pre" v-if="localConfig.testResult.sampleData">{{ formattedTestResult }}</pre>
              <p v-if="localConfig.testResult.error" class="error-message">
                <strong>错误信息:</strong> {{ localConfig.testResult.error }}
              </p>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
import { ElMessage } from "element-plus";
import IconCombiner from "../icons/IconCombiner.vue";

interface CombinerConfig {
  title: string;
  combineMode: 'simple' | 'byField' | 'custom';
  mergeField?: string;
  mergeFunction?: string;
  emptyDataBehavior: 'passEmpty' | 'stopExecution' | 'throwError';
  testResult?: {
    success: boolean;
    inputCount: number;
    outputCount: number;
    sampleData?: any;
    error?: string;
    duration?: number;
  };
}

const props = defineProps<{
  id: string;
  data: CombinerConfig;
}>();

const { updateNode, updateNodeInternals } = useVueFlow();

const getDefaultCombinerConfig = (): CombinerConfig => ({
  title: "合并器",
  combineMode: "simple",
  mergeField: "data.id",
  mergeFunction: "",
  emptyDataBehavior: "passEmpty"
});

const localConfig = ref<CombinerConfig>({
  ...getDefaultCombinerConfig(),
  ...props.data
});

const isEditing = ref(false);
const isTesting = ref(false);

const formattedTestResult = computed(() => {
  if (!localConfig.value.testResult?.sampleData) return '';
  try {
    return JSON.stringify(localConfig.value.testResult.sampleData, null, 2);
  } catch {
    return '无法显示结果';
  }
});

const enterEditMode = () => {
  isEditing.value = true;
};

const exitEditMode = () => {
  isEditing.value = false;
  updateNodeData();
};

const updateNodeData = () => {
  updateNode(props.id, { data: { ...localConfig.value } });
  nextTick(() => {
    updateNodeInternals([props.id]);
  });
};

const testCombiner = async () => {
  // 验证必要配置
  if (localConfig.value.combineMode === 'byField' && !localConfig.value.mergeField?.trim()) {
    ElMessage.warning('请输入合并字段');
    return;
  }
  
  if (localConfig.value.combineMode === 'custom' && !localConfig.value.mergeFunction?.trim()) {
    ElMessage.warning('请输入合并函数');
    return;
  }

  isTesting.value = true;
  
  try {
    // 模拟测试数据
    const testData = [
      [
        { id: 1, name: 'Item 1', category: 'A', value: 50 },
        { id: 2, name: 'Item 2', category: 'B', value: 150 }
      ],
      [
        { id: 3, name: 'Item 3', category: 'A', value: 75 },
        { id: 4, name: 'Item 4', category: 'C', value: 200 }
      ],
      [
        { id: 5, name: 'Item 5', category: 'B', value: 125 }
      ]
    ];

    let result;
    const startTime = Date.now();

    switch (localConfig.value.combineMode) {
      case 'simple':
        result = combineSimple(testData);
        break;
      case 'byField':
        result = combineByField(testData, localConfig.value.mergeField!);
        break;
      case 'custom':
        result = combineCustom(testData, localConfig.value.mergeFunction!);
        break;
      default:
        throw new Error('未知的合并模式');
    }

    const endTime = Date.now();

    // 更新测试结果
    localConfig.value.testResult = {
      success: true,
      inputCount: testData.length,
      outputCount: result.length,
      sampleData: result,
      duration: endTime - startTime,
    };

    ElMessage.success(`合并成功: ${testData.length} 组数据合并为 ${result.length} 条`);
    updateNodeData();
  } catch (error: any) {
    // 更新测试结果
    localConfig.value.testResult = {
      success: false,
      inputCount: 0,
      outputCount: 0,
      error: error.message,
    };

    ElMessage.error(`测试失败: ${error.message}`);
    updateNodeData();
  } finally {
    isTesting.value = false;
  }
};

// 简单合并
const combineSimple = (dataGroups: any[][]): any[] => {
  return dataGroups.flat();
};

// 按字段合并
const combineByField = (dataGroups: any[][], field: string): any[] => {
  const resultMap = new Map();
  
  dataGroups.forEach(group => {
    group.forEach(item => {
      const key = getNestedValue(item, field);
      if (key !== null) {
        resultMap.set(key, item);
      }
    });
  });
  
  return Array.from(resultMap.values());
};

// 自定义合并
const combineCustom = (dataGroups: any[][], mergeFunction: string): any[] => {
  try {
    // 动态执行合并函数
    const func = eval(mergeFunction);
    if (typeof func !== 'function') {
      throw new Error('合并函数必须是一个有效的JavaScript函数');
    }
    
    return func.apply(null, dataGroups);
  } catch (error) {
    throw new Error(`合并函数执行错误: ${error}`);
  }
};

// 获取嵌套字段值
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : null;
  }, obj);
};
</script>

<style scoped>
/* 合并器节点样式 */
.vue-flow__node-combiner {
  padding: 4px;
    background: transparent;
    /* border: 1px solid #e5e7eb; */
    border-radius: 4px;
    min-width: 80px;
    width: auto;
    font-size: 13px;
    position: relative;
    min-height: 80px;
}

.node-handle {
  width: 10px;
  height: 10px;
  background-color:  #1890ff; 
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(24, 144, 255, 0.5); 
  z-index: 1000;
  transition: all 0.2s ease;
}

.node-handle:hover {
  transform: scale(1.2);
  background-color: #40a9ff;
}

.icon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border: 2px solid  #722ed1;
  border-radius: 6px; 
  background: white;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(114, 46, 209, 0.1); 
  width: auto;
}

.icon-display:hover {
  border-color: #9254de;
  box-shadow: 0 2px 8px rgba(114, 46, 209, 0.2);
  transform: translateY(-1px);
}

.icon-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px; 
}

.node-icon {
  width: 36px; 
  height: 36px;
}

.node-title {
  font-size: 12px;
  color: #333;
  font-weight: 500;
  text-align: center;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-mode {
  min-width: 400px; 
  border: 1px solid #e5e7eb; 
  border-radius: 6px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f8fafc; 
  color: #333; 
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid #e5e7eb;
}

.edit-title {
  font-weight: 600;
  font-size: 14px;
}

.close-button {
  background: none;
  border: none;
  color: #9ca3af; 
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}

.close-button:hover {
  background: #e5e7eb;
  color: #333;
}

.edit-content-scroll {
  max-height: 450px;
  overflow-y: auto;
}

.edit-content {
  padding: 16px;
}

.config-section {
  margin-bottom: 18px;
}

.section-label {
  display: block;
  font-size: 13px;
  color: #4b5563; 
  font-weight: 500;
}

.advanced-config {
  margin-top: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 100px;
  margin-top: 16px;
}

.result-section {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  padding-left: 16px;
}

.result-content {
  font-size: 13px;
  line-height: 1.5;
}

.result-pre {
  background: #f9fafb;
  padding: 10px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
}

/* Element组件样式适配 */
.el-input--small,
.el-select--small {
  width: 100%;
}

.el-textarea__inner {
  font-size: 13px !important;
}

.el-button--small {
  padding: 4px 12px;
  font-size: 13px;
}
</style>