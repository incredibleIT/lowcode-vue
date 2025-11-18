<template>
    <div class="vue-flow__node-filter">
      <!-- 连接点 -->
      <Handle 
        id="target-top" 
        type="target" 
        :position="Position.Top" 
        :connectable="true" 
        class="node-handle"
      />
  
      <!-- 显示图标 -->
      <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
        <div class="icon-container">
          <IconFilter class="node-icon"/>
          <span class="node-title">{{ localConfig.title || '过滤器' }}</span>
        </div>
      </div>
  
      <div v-else class="edit-mode">
        <div class="edit-header">
          <span class="edit-title">配置过滤器节点</span>
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
  
          <!-- 过滤条件配置 -->
          <div class="config-section">
            <label class="section-label">过滤模式</label>
            <el-select v-model="localConfig.filterMode" size="small" @change="updateNodeData">
              <el-option label="保留符合条件的条目" value="keep" />
              <el-option label="排除符合条件的条目" value="exclude" />
            </el-select>
          </div>
  
          <div class="config-section">
            <label class="section-label">条件组合方式</label>
            <el-select v-model="localConfig.conditionType" size="small" @change="updateNodeData">
              <el-option label="所有条件都满足 (AND)" value="and" />
              <el-option label="任一条件满足 (OR)" value="or" />
            </el-select>
          </div>
  
          <!-- 条件列表 -->
          <div class="config-section">
            <div class="section-header">
              <label class="section-label">过滤条件</label>
              <el-button type="text" size="small" @click="addCondition">
                <i class="el-icon-plus" /> 添加条件
              </el-button>
            </div>
  
            <div v-for="(condition, index) in localConfig.conditions" :key="index" class="condition-item">
              <div class="condition-row">
                <el-input 
                  v-model="condition.field" 
                  placeholder="数据字段路径 (如: data.id)" 
                  size="small"
                  @blur="updateNodeData"
                  class="condition-field"
                />
                
                <el-select 
                  v-model="condition.operator" 
                  size="small" 
                  @change="updateNodeData"
                  class="condition-operator"
                >
                  <el-option label="等于" value="eq" />
                  <el-option label="不等于" value="ne" />
                  <el-option label="大于" value="gt" />
                  <el-option label="小于" value="lt" />
                  <el-option label="大于等于" value="gte" />
                  <el-option label="小于等于" value="lte" />
                  <el-option label="包含" value="includes" />
                  <el-option label="不包含" value="notIncludes" />
                  <el-option label="存在" value="exists" />
                  <el-option label="不存在" value="notExists" />
                </el-select>
                
                <el-input 
                  v-model="condition.value" 
                  placeholder="比较值" 
                  size="small"
                  @blur="updateNodeData"
                  class="condition-value"
                />
                
                <el-button 
                  type="text" 
                  size="small" 
                  @click="removeCondition(index)"
                  class="condition-remove"
                >
                  <i class="el-icon-delete" />
                </el-button>
              </div>
            </div>
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
            <el-button type="primary" size="small" @click="testFilter" :loading="isTesting">
              {{ isTesting ? '测试中...' : '测试过滤' }}
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
                    <strong>过滤后:</strong> {{ localConfig.testResult.filteredCount }} 条
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

      <Handle 
        id="source-bottom" 
        type="source" 
        :position="Position.Bottom" 
        :connectable="true" 
        class="node-handle"
      />
  </template>
  
  <script setup lang="ts">
  import { ref, computed, nextTick } from "vue";
  import { Handle, Position, useVueFlow } from "@vue-flow/core";
  import { ElMessage } from "element-plus";
  import IconFilter from "../icons/IconFilter.vue";

  interface FilterCondition {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'includes' | 'notIncludes' | 'exists' | 'notExists';
    value: string;
  }
  
  interface FilterConfig {
    title: string;
    filterMode: 'keep' | 'exclude'; // 保留或排除符合条件的条目
    conditionType: 'and' | 'or'; // 条件组合方式
    conditions: FilterCondition[]; // 过滤条件列表
    emptyDataBehavior: 'passEmpty' | 'stopExecution' | 'throwError'; // 空数据处理方式
    testResult?: {
      success: boolean;
      originalCount: number;
      filteredCount: number;
      sampleData?: any[];
      error?: string;
      duration?: number;
    };
  }
  
  const props = defineProps<{
    id: string;
    data: FilterConfig;
  }>();
  
  const { updateNode, updateNodeInternals } = useVueFlow();
  
  const getDefaultFilterConfig = (): FilterConfig => ({
    title: "过滤器",
    filterMode: "keep",
    conditionType: "and",
    conditions: [{
      field: "data.value",
      operator: "eq",
      value: ""
    }],
    emptyDataBehavior: "passEmpty"
  });
  
  const localConfig = ref<FilterConfig>({
    ...getDefaultFilterConfig(),
    ...props.data
  });
  
  const isEditing = ref(false);
  const isTesting = ref(false);
  
  const formattedTestResult = computed(() => {
    if (!localConfig.value.testResult || !localConfig.value.sampleData) return '';
    try {
      return JSON.stringify(localConfig.value.sampleData, null, 2);
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
  
  const addCondition = () => {
    localConfig.value.conditions.push({
      field: "",
      operator: "eq",
      value: ""
    });
    updateNodeData();
  };
  
  // 移除过滤条件
  const removeCondition = (index: number) => {
    if (localConfig.value.conditions.length <= 1) {
      ElMessage.warning('至少保留一个过滤条件');
      return;
    }
    localConfig.value.conditions.splice(index, 1);
    updateNodeData();
  };
  
  // 测试过滤效果
  const testFilter = async () => {
    if (localConfig.value.conditions.some(c => !c.field.trim())) {
      ElMessage.warning('请完善过滤条件中的字段设置');
      return;
    }
  
    isTesting.value = true;
  
    try {
      // 准备测试数据
      const testData = {
        filterMode: localConfig.value.filterMode,
        conditionType: localConfig.value.conditionType,
        conditions: localConfig.value.conditions,
        sampleInput: [
          { id: 1, data: { value: 10, status: 'active' } },
          { id: 2, data: { value: 20, status: 'inactive' } },
          { id: 3, data: { value: 30, status: 'active' } },
          { id: 4, data: { value: 10, status: 'inactive' } },
          { id: 5, data: { value: 50, status: 'active' } }
        ]
      };
  
      // 模拟过滤执行
      const mockResponse = await simulateFilter(testData);
      
      localConfig.value.testResult = {
        success: mockResponse.success,
        originalCount: testData.sampleInput.length,
        filteredCount: mockResponse.filteredData?.length || 0,
        sampleData: mockResponse.filteredData,
        error: mockResponse.error,
        duration: mockResponse.duration
      };
  
      if (mockResponse.success) {
        ElMessage.success(`过滤成功: 从 ${testData.sampleInput.length} 条中筛选出 ${mockResponse.filteredData?.length || 0} 条`);
      } else {
        ElMessage.error(`过滤失败: ${mockResponse.error}`);
      }
      
      updateNodeData();
  
    } catch (error: any) {
      localConfig.value.testResult = {
        success: false,
        originalCount: 0,
        filteredCount: 0,
        error: error.message
      };
      ElMessage.error(`测试失败: ${error.message}`);
      updateNodeData();
    } finally {
      isTesting.value = false;
    }
  };
  
  // 模拟过滤处理
  const simulateFilter = async (testData: any): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          // 简单的过滤逻辑实现
          const filteredData = testData.sampleInput.filter((item: any) => {
            const conditionResults = testData.conditions.map((cond: any) => {
              // 解析字段路径 (如 data.value)
              const fieldValue = cond.field.split('.').reduce((obj: any, key: string) => {
                return obj ? obj[key] : undefined;
              }, item);
  
              // 根据操作符判断条件
              switch (cond.operator) {
                case 'eq': return fieldValue === cond.value;
                case 'ne': return fieldValue !== cond.value;
                case 'gt': return fieldValue > cond.value;
                case 'lt': return fieldValue < cond.value;
                case 'gte': return fieldValue >= cond.value;
                case 'lte': return fieldValue <= cond.value;
                case 'includes': return fieldValue?.includes(cond.value) || false;
                case 'notIncludes': return !(fieldValue?.includes(cond.value) || false);
                case 'exists': return fieldValue !== undefined && fieldValue !== null;
                case 'notExists': return fieldValue === undefined || fieldValue === null;
                default: return false;
              }
            });
  
            // 根据条件组合方式返回结果
            return testData.conditionType === 'and' 
              ? conditionResults.every(Boolean)
              : conditionResults.some(Boolean);
          });
  
          // 根据过滤模式处理结果
          const finalData = testData.filterMode === 'keep' 
            ? filteredData 
            : testData.sampleInput.filter((item: any) => !filteredData.includes(item));
  
          resolve({
            success: true,
            filteredData: finalData,
            duration: Math.floor(Math.random() * 300) + 50
          });
        } catch (error: any) {
          resolve({
            success: false,
            error: error.message || '过滤逻辑执行错误'
          });
        }
      }, 800);
    });
  };
  
  const updateNodeData = () => {
    updateNode(props.id, { data: { ...localConfig.value } });
    nextTick(() => {
      updateNodeInternals([props.id]);
    });
  };
  </script>
  
  <style scoped>
.vue-flow__node-filter {
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
  background-color:  #13c2c2; 
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(19, 194, 194, 0.5); 
  z-index: 1000;
  transition: all 0.2s ease;
}

.node-handle:hover {
  transform: scale(1.2);
  background-color: #096dd9; 

}

.icon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  border: 2px solid  #13c2c2;
  border-radius: 6px; 
  background: white;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(19, 194, 194, 0.1); 
  width: auto;
}

.icon-display:hover {
  border-color: #096dd9;
  box-shadow: 0 2px 8px rgba(19, 194, 194, 0.2);
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

.condition-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.condition-item {
  margin-bottom: 10px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  transition: border-color 0.2s ease; 
}

.condition-item:hover {
  border-color: #a7f3d0;
}

.condition-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.condition-field,
.condition-operator,
.condition-value {
  flex: 1;
}
.condition-remove {
  color: #ef4444;
  padding: 0 4px;
  transition: color 0.2s ease; 
}


.condition-remove:hover {
  color: #dc2626;
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
  border: 1px solid #e5e7eb; /* 修复原样式中10px边框的错误 */
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