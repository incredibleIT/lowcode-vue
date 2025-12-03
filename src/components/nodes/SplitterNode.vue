<template>
    <div class="vue-flow__node-splitter">
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
                <IconSplitter class="node-icon"/>
                <span class="node-title">{{ localConfig.title || '拆分器' }}</span>
            </div>
        </div>

        <div v-else class="edit-mode">
            <div class="edit-header">
                <span class="edit-title">配置拆分器节点</span>
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

                    <!-- 拆分模式配置 -->
                    <div class="config-section">
                        <label class="section-label">拆分模式</label>
                        <el-select v-model="localConfig.splitMode" size="small" @change="updateNodeData">
                            <el-option label="按字段拆分" value="byField" />
                            <el-option label="按数量拆分" value="byCount" />
                            <el-option label="按条件拆分" value="byCondition" />
                        </el-select>
                    </div>

                    <!-- 按字段拆分配置 -->
                    <div v-if="localConfig.splitMode === 'byField'" class="config-section">
                        <label class="section-label">拆分字段</label>
                        <el-input 
                            v-model="localConfig.field" 
                            placeholder="数据字段路径 (如: data.category)" 
                            size="small"
                            @blur="updateNodeData"
                        />
                    </div>

                    <!-- 按数量拆分配置 -->
                    <div v-if="localConfig.splitMode === 'byCount'" class="config-section">
                        <label class="section-label">每组数量</label>
                        <el-input-number 
                            v-model="localConfig.batchSize" 
                            :min="1" 
                            :max="1000" 
                            size="small"
                            @change="updateNodeData"
                        />
                    </div>

                    <!-- 按条件拆分配置 -->
                    <div v-if="localConfig.splitMode === 'byCondition'" class="config-section">
                        <label class="section-label">拆分条件</label>
                        <el-input 
                            v-model="localConfig.condition" 
                            type="textarea" 
                            :rows="3" 
                            placeholder="JavaScript条件表达式 (如: item.value > 100)" 
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
                <!-- 按钮 -->
                <div class="action-buttons">
                    <el-button type="primary" size="small" @click="testSplitter" :loading="isTesting">
                        {{ isTesting ? '测试中...' : '测试拆分' }}
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
                                    <strong>原始数据:</strong> {{ localConfig.testResult.originalCount }} 条
                                </p>
                                <p>
                                    <strong>拆分后组数:</strong> {{ localConfig.testResult.groupCount }} 组
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
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
import { ElMessage } from "element-plus";
import IconSplitter from "../icons/IconSplitter.vue";

interface SplitterConfig {
  title: string;
  splitMode: 'byField' | 'byCount' | 'byCondition';
  field?: string;
  batchSize?: number;
  condition?: string;
  emptyDataBehavior: 'passEmpty' | 'stopExecution' | 'throwError';
  testResult?: {
    success: boolean;
    originalCount: number;
    groupCount: number;
    sampleData?: any;
    error?: string;
    duration?: number;
  };
}

const props = defineProps<{
  id: string;
  data: SplitterConfig;
}>();

const { updateNode, updateNodeInternals } = useVueFlow();

const getDefaultSplitterConfig = (): SplitterConfig => ({
  title: "拆分器",
  splitMode: "byField",
  field: "data.category",
  batchSize: 10,
  condition: "",
  emptyDataBehavior: "passEmpty"
});

const localConfig = ref<SplitterConfig>({
  ...getDefaultSplitterConfig(),
  ...props.data
});

const isEditing = ref(false);
const isTesting = ref(false);

const formattedTestResult = computed(() => {
  if (!localConfig.value.testResult || !localConfig.value.sampleData) return '';
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

const testSplitter = async () => {
  // 验证必要配置
  if (localConfig.value.splitMode === 'byField' && !localConfig.value.field.trim()) {
    ElMessage.warning('请输入拆分字段');
    return;
  }
  
  if (localConfig.value.splitMode === 'byCondition' && !localConfig.value.condition.trim()) {
    ElMessage.warning('请输入拆分条件');
    return;
  }

  isTesting.value = true;
  
  try {
    // 模拟测试数据
    const testData = [
      { id: 1, name: 'Item 1', category: 'A', value: 50 },
      { id: 2, name: 'Item 2', category: 'B', value: 150 },
      { id: 3, name: 'Item 3', category: 'A', value: 75 },
      { id: 4, name: 'Item 4', category: 'C', value: 200 },
      { id: 5, name: 'Item 5', category: 'B', value: 125 },
    ];

    let result;
    const startTime = Date.now();

    switch (localConfig.value.splitMode) {
      case 'byField':
        result = splitByField(testData, localConfig.value.field!);
        break;
      case 'byCount':
        result = splitByCount(testData, localConfig.value.batchSize || 10);
        break;
      case 'byCondition':
        result = splitByCondition(testData, localConfig.value.condition!);
        break;
      default:
        throw new Error('未知的拆分模式');
    }

    const endTime = Date.now();

    // 更新测试结果
    localConfig.value.testResult = {
      success: true,
      originalCount: testData.length,
      groupCount: result.length,
      sampleData: result,
      duration: endTime - startTime,
    };

    ElMessage.success(`拆分成功: 将 ${testData.length} 条数据拆分为 ${result.length} 组`);
    updateNodeData();
  } catch (error: any) {
    // 更新测试结果
    localConfig.value.testResult = {
      success: false,
      originalCount: 0,
      groupCount: 0,
      error: error.message,
    };

    ElMessage.error(`测试失败: ${error.message}`);
    updateNodeData();
  } finally {
    isTesting.value = false;
  }
};

// 按字段拆分
const splitByField = (data: any[], field: string): any[][] => {
  const groups: Record<string, any[]> = {};
  
  data.forEach(item => {
    const value = getNestedValue(item, field);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
  });
  
  return Object.values(groups);
};

// 按数量拆分
const splitByCount = (data: any[], batchSize: number): any[][] => {
  const result: any[][] = [];
  
  for (let i = 0; i < data.length; i += batchSize) {
    result.push(data.slice(i, i + batchSize));
  }
  
  return result;
};

// 按条件拆分
const splitByCondition = (data: any[], condition: string): any[][] => {
  const group1: any[] = [];
  const group2: any[] = [];
  
  data.forEach(item => {
    try {
      // 使用eval执行条件表达式
      const shouldGroup1 = eval(`(item) => { return ${condition} }`)(item);
      if (shouldGroup1) {
        group1.push(item);
      } else {
        group2.push(item);
      }
    } catch (error) {
      throw new Error(`条件表达式执行错误: ${error}`);
    }
  });
  
  return [group1, group2];
};

// 获取嵌套字段值
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => {
    return acc && acc[key] !== undefined ? acc[key] : null;
  }, obj);
};
</script>

<style scoped>
.vue-flow__node-splitter {
  position: relative;
  min-width: 80px; 
  width: auto;
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
  border: 2px solid  #ff7875;
  border-radius: 6px; 
  background: white;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(255, 120, 117, 0.1); 
  width: auto;
}

.icon-display:hover {
  border-color: #ff4d4f;
  box-shadow: 0 2px 8px rgba(255, 120, 117, 0.2);
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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
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