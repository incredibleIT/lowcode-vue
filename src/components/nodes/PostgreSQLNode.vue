<template>
  <div class="vue-flow__node-postgresql">
    <Handle 
      id="target-top" 
      type="target" 
      :position="Position.Top" 
      :connectable="true" 
      class="node-handle"
    />
    
    <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
      <div class="icon-container">
        <IconPostgreSQL class="node-icon"/>
        <span class="node-title">{{ localConfig.title || 'PostgreSQL查询' }}</span>
      </div>
    </div>

    <div v-else class="edit-mode">
      <div class="edit-header">
        <span class="edit-title">配置PostgreSQL查询节点</span>
        <button class="close-button" @click="exitEditMode">×</button>
      </div>
      
      <div class="edit-content-scroll">
        <div class="edit-content">
          <div class="config-section">
            <label class="section-label">节点标题</label>
            <el-input 
              v-model="localConfig.title" 
              placeholder="PostgreSQL查询" 
              size="small"
              @blur="updateNodeData"
            />
          </div>

          <div class="config-section">
            <label class="section-label">数据库连接</label>
            <el-select v-model="localConfig.connectionType" size="small" @change="onConnectionTypeChange">
              <el-option label="默认连接" value="default" />
              <el-option label="自定义连接" value="custom" />
            </el-select>
          </div>

          <div v-if="localConfig.connectionType === 'custom'" class="config-section">
            <div class="connection-grid">
              <el-input v-model="localConfig.host" placeholder="localhost" size="small" @blur="updateNodeData" />
              <el-input v-model="localConfig.port" placeholder="5432" size="small" @blur="updateNodeData" />
              <el-input v-model="localConfig.database" placeholder="数据库名" size="small" @blur="updateNodeData" />
              <el-input v-model="localConfig.username" placeholder="用户名" size="small" @blur="updateNodeData" />
              <el-input v-model="localConfig.password" type="password" placeholder="密码" size="small" @blur="updateNodeData" />
            </div>
          </div>

          <div class="config-section">
            <label class="section-label">查询类型</label>
            <el-select v-model="localConfig.queryType" size="small" @change="onQueryTypeChange">
              <el-option label="SELECT" value="SELECT" />
              <el-option label="INSERT" value="INSERT" />
              <el-option label="UPDATE" value="UPDATE" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="WITH查询" value="WITH" />
            </el-select>
          </div>

          <div class="config-section">
            <label class="section-label">SQL查询语句</label>
            <el-input
              v-model="localConfig.sql"
              type="textarea"
              :rows="4"
              placeholder="SELECT * FROM table_name WHERE column = $1"
              size="small"
              @blur="updateNodeData"
              resize="none"
            />
            <div class="sql-tips">
              <small>PostgreSQL使用 $1, $2 作为参数占位符</small>
            </div>
          </div>

          <div class="config-section">
            <label class="section-label">查询参数 (JSON格式)</label>
            <el-input
              v-model="localConfig.parameters"
              type="textarea"
              :rows="2"
              placeholder='["value1", "value2"]'
              size="small"
              @blur="validateParameters"
            />
            <div v-if="parametersError" class="error-text">{{ parametersError }}</div>
          </div>

          <el-collapse class="advanced-config">
            <el-collapse-item title="PostgreSQL高级配置">
              <div class="config-section">
                <label class="section-label">超时时间(秒)</label>
                <el-input-number 
                  v-model="localConfig.timeout" 
                  :min="5" 
                  :max="300" 
                  size="small"
                  @change="updateNodeData"
                />
              </div>
              
              <div class="config-section">
                <label class="section-label">最大返回行数</label>
                <el-input-number 
                  v-model="localConfig.maxRows" 
                  :min="1" 
                  :max="10000" 
                  size="small"
                  @change="updateNodeData"
                />
              </div>

              <div class="config-section">
                <label class="section-label">SSL模式</label>
                <el-select v-model="localConfig.sslMode" size="small" @change="updateNodeData">
                  <el-option label="disable" value="disable" />
                  <el-option label="allow" value="allow" />
                  <el-option label="prefer" value="prefer" />
                  <el-option label="require" value="require" />
                </el-select>
              </div>

              <div class="config-section">
                <label class="section-label">连接池大小</label>
                <el-input-number 
                  v-model="localConfig.poolSize" 
                  :min="1" 
                  :max="20" 
                  size="small"
                  @change="updateNodeData"
                />
              </div>
            </el-collapse-item>
          </el-collapse>

          <!-- 测试结果展示 -->
          <div v-if="localConfig.testResult" class="result-section">
            <el-collapse>
              <el-collapse-item title="测试结果">
                <div class="result-content">
                  <p><strong>执行状态:</strong> 
                    <span :class="localConfig.testResult.success ? 'success-text' : 'error-text'">
                      {{ localConfig.testResult.success ? '成功' : '失败' }}
                    </span>
                  </p>
                  <p v-if="localConfig.testResult.duration !== undefined">
                    <strong>执行时间:</strong> {{ localConfig.testResult.duration }}ms
                  </p>
                  <p v-if="localConfig.testResult.affectedRows !== undefined">
                    <strong>影响行数:</strong> {{ localConfig.testResult.affectedRows }}
                  </p>
                  <p v-if="localConfig.testResult.data">
                    <strong>返回数据 (前10行):</strong>
                  </p>
                  <pre class="result-pre" v-if="localConfig.testResult.data">{{ formattedTestResult }}</pre>
                  <p v-if="localConfig.testResult.error" class="error-message">
                    <strong>错误信息:</strong> {{ localConfig.testResult.error }}
                  </p>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" size="small" @click="testConnection" :loading="isTestingConnection">
          {{ isTestingConnection ? '测试中...' : '测试连接' }}
        </el-button>
        <el-button type="warning" size="small" @click="testQuery" :loading="isTestingQuery">
          {{ isTestingQuery ? '执行中...' : '测试查询' }}
        </el-button>
        <el-button type="success" size="small" @click="saveConfig">保存配置</el-button>
        <el-button size="small" @click="exitEditMode">完成</el-button>
      </div>
    </div>

    <Handle 
      id="source-bottom" 
      type="source" 
      :position="Position.Bottom" 
      :connectable="true" 
      class="node-handle"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
import { ElMessage } from "element-plus";
import { postgresqlAPI, nodeAPI } from "@/api/interface";
import IconPostgreSQL from "../icons/IconPostgreSQL.vue";

interface PostgreSQLConfig {
  title: string;
  connectionType: 'default' | 'custom';
  host: string;
  port: string;
  database: string;
  username: string;
  password: string;
  queryType: string;
  sql: string;
  parameters: string;
  timeout: number;
  maxRows: number;
  sslMode: string;
  poolSize: number;
  position?: { x: number; y: number };
  fromBackend?: boolean;
  testResult?: {
    success: boolean;
    affectedRows?: number;
    data?: any;
    error?: string;
    duration?: number;
  };
}

const props = defineProps<{
  id: string;
  data: PostgreSQLConfig;
}>();

const { updateNode, updateNodeInternals } = useVueFlow();

// 默认配置
const getDefaultPostgreSQLConfig = (): PostgreSQLConfig => ({
  title: "PostgreSQL查询",
  connectionType: "default",
  host: "localhost",
  port: "5432",
  database: "",
  username: "postgres",
  password: "",
  queryType: "SELECT",
  sql: "SELECT * FROM table_name WHERE column = $1",
  parameters: "[]",
  timeout: 30,
  maxRows: 1000,
  sslMode: "prefer",
  poolSize: 5
});

const localConfig = ref<PostgreSQLConfig>({
  ...getDefaultPostgreSQLConfig(),
  ...props.data
});

const isEditing = ref(false);
const isTestingConnection = ref(false);
const isTestingQuery = ref(false);
const parametersError = ref("");

const formattedTestResult = computed(() => {
  if (!localConfig.value.testResult || !localConfig.value.testResult.data) return '';
  try {
    const data = localConfig.value.testResult.data;
    const displayData = Array.isArray(data) ? data.slice(0, 10) : data;
    return JSON.stringify(displayData, null, 2);
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

const onConnectionTypeChange = () => {
  updateNodeData();
};

const onQueryTypeChange = () => {
  switch (localConfig.value.queryType) {
    case 'SELECT':
      localConfig.value.sql = localConfig.value.sql || 'SELECT * FROM table_name WHERE column = $1';
      break;
    case 'INSERT':
      localConfig.value.sql = localConfig.value.sql || 'INSERT INTO table_name (col1, col2) VALUES ($1, $2)';
      break;
    case 'UPDATE':
      localConfig.value.sql = localConfig.value.sql || 'UPDATE table_name SET col1 = $1 WHERE col2 = $2';
      break;
    case 'DELETE':
      localConfig.value.sql = localConfig.value.sql || 'DELETE FROM table_name WHERE column = $1';
      break;
    case 'WITH':
      localConfig.value.sql = localConfig.value.sql || 'WITH cte AS (SELECT * FROM table) SELECT * FROM cte';
      break;
  }
  updateNodeData();
};

const validateParameters = () => {
  parametersError.value = "";
  if (!localConfig.value.parameters.trim()) {
    localConfig.value.parameters = "[]";
    updateNodeData();
    return;
  }

  try {
    const params = JSON.parse(localConfig.value.parameters);
    if (!Array.isArray(params)) {
      parametersError.value = "参数必须是JSON数组格式";
      return;
    }
    updateNodeData();
  } catch (error) {
    parametersError.value = "JSON格式错误，请检查参数格式";
  }
};

// 测试数据库连接
const testConnection = async () => {
  isTestingConnection.value = true;

  try {
    const connectionConfig = {
      host: localConfig.value.host,
      port: parseInt(localConfig.value.port) || 5432,
      database: localConfig.value.database,
      username: localConfig.value.username,
      password: localConfig.value.password,
      sslMode: localConfig.value.sslMode
    }
    const result = await postgresqlAPI.testConnection(connectionConfig);
    
    localConfig.value.testResult = {
      success: result.success,
      error: result.error,
      duration: result.duration
    };

    if (result.success) {
      ElMessage.success(`连接成功: ${result.message || '数据库连接正常'}`);
    } else {
      ElMessage.error(`连接失败: ${result.error}`);
    }
    
    updateNodeData();

  } catch (error: any) {
    localConfig.value.testResult = {
      success: false,
      error: error.message || '连接测试异常'
    };
    ElMessage.error(`测试失败: ${error.message}`);
    updateNodeData();
  } finally {
    isTestingConnection.value = false;
  }
};

const testQuery = async () => {
  if (!localConfig.value.sql.trim()) {
    ElMessage.warning('请输入SQL查询语句');
    return;
  }

  isTestingQuery.value = true;

  try {
    const queryConfig = {
      connection: localConfig.value.connectionType === 'custom' ? {
        host: localConfig.value.host,
        port: parseInt(localConfig.value.port) || 5432,
        database: localConfig.value.database,
        username: localConfig.value.username,
        password: localConfig.value.password,
        sslMode: localConfig.value.sslMode
      } : undefined,
      query: {
        sql: localConfig.value.sql,
        parameters: JSON.parse(localConfig.value.parameters || '[]'),
        timeout: localConfig.value.timeout,
        maxRows: localConfig.value.maxRows
      }
    };
    const result = await postgresqlAPI.executeQuery(queryConfig);
    
    localConfig.value.testResult = {
      success: result.success,
      affectedRows: result.affectedRows,
      data: result.data,
      error: result.error,
      duration: result.duration
    };

    if (result.success) {
      const rowsText = result.affectedRows !== undefined ? `，影响行数: ${result.affectedRows}` : '';
      ElMessage.success(`查询成功: 耗时${result.duration}ms${rowsText}`);
    } else {
      ElMessage.error(`查询失败: ${result.error}`);
    }
    
    updateNodeData();

  } catch (error: any) {
    localConfig.value.testResult = {
      success: false,
      error: error.message || '查询执行异常'
    };
    ElMessage.error(`测试失败: ${error.message}`);
    updateNodeData();
  } finally {
    isTestingQuery.value = false;
  }
};

// 保存节点配置到后端
const saveConfig = async () => {
  try {
    const nodeData = {
      id: props.id,
      type: 'postgresql',
      position: props.data.position || { x: 0, y: 0 },
      data: localConfig.value
    };

    if (props.id && props.id.startsWith('postgresql-')) {
      // 更新现有节点
      await nodeAPI.updateNode(nodeData);
      ElMessage.success('节点配置已更新');
    } else {
      // 创建新节点
      await nodeAPI.createNode(nodeData);
      ElMessage.success('节点配置已保存');
    }
  } catch (error: any) {
    ElMessage.error(`保存失败: ${error.message}`);
  }
};

// 更新节点数据到画布
const updateNodeData = () => {
  updateNode(props.id, { 
    data: { 
      ...localConfig.value,
      // 确保包含必要的基础字段
      label: localConfig.value.title,
      type: 'postgresql'
    } 
  });
  
  // 确保连接点状态同步更新
  nextTick(() => {
    updateNodeInternals([props.id]);
  });
};

// 组件挂载时初始化
onMounted(() => {
  // 如果从props传入的数据包含后端数据，可以在这里处理
  if (props.data.fromBackend) {
    console.log('PostgreSQL节点已从后端加载配置');
  }
});
</script>


<style scoped>
.vue-flow__node-postgresql {
  position: relative;
  min-width: 80px;
  min-height: 80px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.node-handle {
  width: 12px;
  height: 12px;
  background-color: #336791; /* PostgreSQL主题色 */
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;
}

.node-handle:hover {
  transform: scale(1.2);
  background-color: #4a7fa5;
}

.icon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border: 2px solid #336791;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  min-height: 80px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(51, 103, 145, 0.1);
  position: relative;
}

.icon-display:hover {
  border-color: #4a7fa5;
  box-shadow: 0 4px 12px rgba(74, 127, 165, 0.2);
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
  color: #336791;
}

.node-title {
  font-size: 12px;
  color: #336791;
  font-weight: 600;
  text-align: center;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-indicator {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.success {
  background-color: #52c41a;
}

.status-indicator.error {
  background-color: #f56c6c;
}

.status-indicator.running {
  background-color: #1890ff;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

.edit-mode {
  min-width: 320px;
  border: 2px solid #336791;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: 70vh;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #336791;
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
  line-height: 1;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.edit-content-scroll {
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
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

.connection-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
}

.sql-tips {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  font-style: italic;
}

.error-text {
  font-size: 11px;
  color: #f56c6c;
  margin-top: 4px;
}

.advanced-config {
  margin-top: 8px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #eaeaea;
  background: #f8f9fa;
  justify-content: flex-end;
}

.result-section {
  margin-top: 16px;
  border-top: 1px solid #eaeaea;
  padding-top: 16px;
}

.result-content {
  font-size: 12px;
  line-height: 1.4;
}

.result-pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
}

.success-text {
  color: #52c41a;
  font-weight: 600;
}

.error-message {
  color: #f56c6c;
  font-size: 11px;
  margin-top: 4px;
}

@media (max-width: 480px) {
  .edit-mode {
    min-width: 280px;
    max-width: 90vw;
  }
  
  .connection-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}

.edit-content-scroll::-webkit-scrollbar {
  width: 6px;
}

.edit-content-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.edit-content-scroll::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.edit-content-scroll::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>