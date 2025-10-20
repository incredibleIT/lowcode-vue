<template>
  <div class="vue-flow__node-mysql">
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
        <IconMySQL class="node-icon"/>
        <span class="node-title">{{ localConfig.title || 'MySQL查询' }}</span>
      </div>
    </div>

    <div v-else class="edit-mode">
      <div class="edit-header">
        <span class="edit-title">配置MySQL查询节点</span>
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

        <!-- 数据库连接配置 -->
        <div class="config-section">
          <label class="section-label">数据库连接</label>
          <el-select v-model="localConfig.connectionType" size="small" @change="updateNodeData">
            <el-option label="默认连接" value="default" />
            <el-option label="自定义连接" value="custom" />
          </el-select>
        </div>

        <div v-if="localConfig.connectionType === 'custom'" class="config-section">
          <div class="connection-grid">
            <el-input v-model="localConfig.host" placeholder="主机地址" size="small" @blur="updateNodeData" />
            <el-input v-model="localConfig.port" placeholder="端口" size="small" @blur="updateNodeData" />
            <el-input v-model="localConfig.database" placeholder="数据库名" size="small" @blur="updateNodeData" />
            <el-input v-model="localConfig.username" placeholder="用户名" size="small" @blur="updateNodeData" />
            <el-input v-model="localConfig.password" type="password" placeholder="密码" size="small" @blur="updateNodeData" />
          </div>
        </div>

        <!-- 查询配置 -->
        <div class="config-section">
          <label class="section-label">查询类型</label>
          <el-select v-model="localConfig.queryType" size="small" @change="onQueryTypeChange">
            <el-option label="SELECT" value="SELECT" />
            <el-option label="INSERT" value="INSERT" />
            <el-option label="UPDATE" value="UPDATE" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="存储过程" value="PROCEDURE" />
          </el-select>
        </div>

        <div class="config-section">
          <label class="section-label">SQL查询语句</label>
          <el-input
            v-model="localConfig.sql"
            type="textarea"
            :rows="4"
            placeholder="SELECT * FROM table WHERE condition = ?"
            size="small"
            @blur="updateNodeData"
          />
        </div>

        <div class="config-section">
          <label class="section-label">查询参数 (JSON格式)</label>
          <el-input
            v-model="localConfig.parameters"
            type="textarea"
            :rows="2"
            placeholder='["value1", "value2"]'
            size="small"
            @blur="updateNodeData"
          />
        </div>

        <!-- 高级配置 -->
        <el-collapse class="advanced-config">
          <el-collapse-item title="高级配置">
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
          </el-collapse-item>
        </el-collapse>
    </div>
        <!-- 按钮 -->
        <div class="action-buttons">
          <el-button type="primary" size="small" @click="testQuery" :loading="isTesting">
            {{ isTesting ? '测试中...' : '测试查询' }}
          </el-button>
          <el-button type="success" size="small" @click="exitEditMode">完成</el-button>
        </div>

        <!-- 测试结果展示 -->
        <div v-if="localConfig.testResult" class="result-section">
          <el-collapse>
            <el-collapse-item title="测试结果">
              <div class="result-content">
                <p><strong>执行状态:</strong> {{ localConfig.testResult.success ? '成功' : '失败' }}</p>
                <p v-if="localConfig.testResult.affectedRows !== undefined">
                  <strong>影响行数:</strong> {{ localConfig.testResult.affectedRows }}
                </p>
                <p v-if="localConfig.testResult.data">
                  <strong>返回数据:</strong>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { Handle, Position, useVueFlow } from "@vue-flow/core";
import { ElMessage } from "element-plus";

// 定义MySQL节点配置数据类型
interface MySQLConfig {
  title: string;
  connectionType: string;
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
  data: MySQLConfig;
}>();

const { updateNode, updateNodeInternals } = useVueFlow();

// 首先完善MySQLConfig接口定义
interface MySQLConfig {
  title: string;
  connectionType: 'default' | 'custom';
  host: string;
  port: string; // 保持字符串类型，更灵活
  database: string;
  username: string;
  password: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'PROCEDURE';
  sql: string;
  parameters: string; // JSON字符串存储查询参数
  timeout: number;
  maxRows: number;
  testResult?: {
    success: boolean;
    data?: any[];
    affectedRows?: number;
    error?: string;
    duration?: number;
  };
}

// 默认配置
const getDefaultMySQLConfig = (): MySQLConfig => ({
  title: "MySQL查询",
  connectionType: "default",
  host: "localhost",
  port: "3306",
  database: "",
  username: "",
  password: "",
  queryType: "SELECT",
  sql: "SELECT * FROM table_name WHERE condition = ?",
  parameters: "[]",
  timeout: 30,
  maxRows: 1000
});

const localConfig = ref<MySQLConfig>({
  ...getDefaultMySQLConfig(),
  ...props.data
});

const isEditing = ref(false);
const isTesting = ref(false);

const formattedTestResult = computed(() => {
  if (!localConfig.value.testResult || !localConfig.value.testResult.data) return '';
  try {
    if (typeof localConfig.value.testResult.data === 'object') {
      return JSON.stringify(localConfig.value.testResult.data, null, 2);
    }
    return String(localConfig.value.testResult.data);
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

const onQueryTypeChange = () => {
  switch (localConfig.value.queryType) {
    case 'SELECT':
      localConfig.value.sql = localConfig.value.sql || 'SELECT * FROM table_name WHERE condition = ?';
      break;
    case 'INSERT':
      localConfig.value.sql = localConfig.value.sql || 'INSERT INTO table_name (col1, col2) VALUES (?, ?)';
      break;
    case 'UPDATE':
      localConfig.value.sql = localConfig.value.sql || 'UPDATE table_name SET col1 = ? WHERE condition = ?';
      break;
    case 'DELETE':
      localConfig.value.sql = localConfig.value.sql || 'DELETE FROM table_name WHERE condition = ?';
      break;
    case 'PROCEDURE':
      localConfig.value.sql = localConfig.value.sql || 'CALL procedure_name(?, ?)';
      break;
  }
  updateNodeData();
};

// 测试 节点
const testQuery = async () => {
  if (!localConfig.value.sql.trim()) {
    ElMessage.warning('请输入SQL查询语句');
    return;
  }

  isTesting.value = true;

  try {
    // 准备测试请求数据
    const testData = {
      connection: localConfig.value.connectionType === 'custom' ? {
        host: localConfig.value.host,
        port: localConfig.value.port,
        database: localConfig.value.database,
        username: localConfig.value.username,
        password: localConfig.value.password
      } : undefined,
      query: {
        type: localConfig.value.queryType,
        sql: localConfig.value.sql,
        parameters: JSON.parse(localConfig.value.parameters || '[]'),
        timeout: localConfig.value.timeout,
        maxRows: localConfig.value.maxRows
      }
    };

    // 这里应该调用后端API执行测试查询 后面再改。
    // 模拟API响应（实际项目中应替换为真实API调用）
    const mockResponse = await simulateMySQLQuery(testData);
    
    localConfig.value.testResult = {
      success: mockResponse.success,
      affectedRows: mockResponse.affectedRows,
      data: mockResponse.data,
      error: mockResponse.error,
      duration: mockResponse.duration
    };

    if (mockResponse.success) {
      ElMessage.success(`查询成功: 耗时${mockResponse.duration}ms`);
    } else {
      ElMessage.error(`查询失败: ${mockResponse.error}`);
    }
    
    updateNodeData();

  } catch (error: any) {
    localConfig.value.testResult = {
      success: false,
      error: error.message
    };
    ElMessage.error(`测试失败: ${error.message}`);
    updateNodeData();
  } finally {
    isTesting.value = false;
  }
};

// 模拟MySQL查询执行（实际项目中应调用真实后端API）
const simulateMySQLQuery = async (testData: any): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟成功响应
      if (Math.random() > 0.3) { // 70%成功率
        resolve({
          success: true,
          affectedRows: testData.query.type === 'SELECT' ? undefined : Math.floor(Math.random() * 10) + 1,
          data: testData.query.type === 'SELECT' ? [
            { id: 1, name: '示例数据1', value: '值1' },
            { id: 2, name: '示例数据2', value: '值2' }
          ] : undefined,
          duration: Math.floor(Math.random() * 500) + 100
        });
      } else {
        // 模拟失败响应
        resolve({
          success: false,
          error: '连接数据库失败或SQL语法错误'
        });
      }
    }, 1000);
  });
};

// 更新节点数据到画布
const updateNodeData = () => {
  updateNode(props.id, { data: { ...localConfig.value } });
  // 确保连接点状态同步更新
  nextTick(() => {
    updateNodeInternals([props.id]);
  });
};
</script>

<style scoped>
.vue-flow__node-mysql {
  position: relative;
  min-width: 80px;
  min-height: 80px;
}

/* 连接点样式 */
.node-handle {
  width: 12px;
  height: 12px;
  background-color: #00758F;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transition: all 0.3s ease;
}

.node-handle:hover {
  transform: scale(1.2);
  background-color: #0096B7;
}

/* 图标显示模式 */
.icon-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  cursor: pointer;
  border: 2px solid #00758F;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  min-height: 80px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 117, 143, 0.1);
}

.icon-display:hover {
  border-color: #0096B7;
  box-shadow: 0 4px 12px rgba(0, 150, 183, 0.2);
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
  color: #00758F;
}

.node-title {
  font-size: 12px;
  color: #00758F;
  font-weight: 600;
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 编辑模式 */
.edit-mode {
  min-width: 320px;
  border: 2px solid #00758F;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #00758F;
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
  max-height: 500px;
  overflow-y: auto;
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
}

.advanced-config {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin: 20px 0 12px 0;
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
}

.error-message {
  color: #f56c6c;
  font-size: 11px;
}
</style>