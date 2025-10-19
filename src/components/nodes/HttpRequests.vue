<template>
  <div class="vue-flow__node-httpRequest">
    <Handle 
      id="target-top" 
      type="target" 
      :position="Position.Top" 
      :connectable="true"
      class="custom-handle"
    />
    
    <!-- 引入图标 -->
    <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
      <div class="icon-container">
        <IconHttpRequest class="node-icon"/>
        <span class="node-title">{{ localConfig.title || 'HTTP请求' }}</span>
      </div>
    </div>

    <div v-else class="edit-mode">
      <div class="edit-header">
        <span class="edit-title">配置HTTP请求节点</span>
        <button class="close-button" @click="exitEditMode">×</button>
      </div>
      
      <div class="edit-content">
        <!-- 基本配置区域 -->
        <div class="config-section">
          <!-- <label class="section-label">节点标题</label>
          <el-input 
            v-model="localConfig.title" 
            placeholder="输入请求名称" 
            size="small"
            @blur="updateNodeData"
          /> -->
        </div>

        <div class="config-section">
          <div class="config-item">
          <label class="section-label">请求方法</label>
          <el-select v-model="localConfig.method" size="small" @change="updateNodeData">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </div>

        <div class="config-section">
          <label class="section-label">请求URL</label>
          <el-input 
            v-model="localConfig.url" 
            placeholder="https://api.example.com/data" 
            size="small"
            @blur="updateNodeData"
          />
        </div>

        <div class="config-item">
          <label class="section-label">请求头 (JSON格式)</label>
          <el-input
            v-model="localConfig.headers"
            type="textarea"
            :rows="3"
            placeholder='{"Content-Type": "application/json", "Authorization": "Bearer token"}'
            size="small"
            @blur="updateNodeData"
          />
        </div>

        <div v-if="['POST', 'PUT', 'PATCH'].includes(localConfig.method)" class="config-item">
          <label class="section-label">请求体</label>
          <el-input
            v-model="localConfig.body"
            type="textarea"
            :rows="4"
            placeholder='{"key": "value"}'
            size="small"
            @blur="updateNodeData"
          />
        </div>
      </div>
        <div class="action-group">
          <el-button type="primary" size="small" @click="executeRequest" :loading="isLoading">
            {{ isLoading ? '请求中...' : '测试请求' }}
          </el-button>
          <el-button type="success" size="small" @click="exitEditMode">完成</el-button>
        </div>

        <!-- 测试结果 -->
        <div v-if="localConfig.response" class="result-section">
          <el-collapse>
            <el-collapse-item title="请求响应">
              <div class="response-info">
                <p><strong>状态码:</strong> {{ localConfig.response.status }}</p>
                <p><strong>响应数据:</strong></p>
                <pre class="response-pre">{{ formattedResponse }}</pre>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </div>
    </div>

    <Handle 
      id="source-bottom" 
      type="source" 
      :position="Position.Bottom" 
      :connectable="true"
      class="custom-handle"
    />
  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import IconHttpRequest from '../icons/IconHttpRequest.vue'

// 定义节点数据类型
interface HttpRequestConfig {
  title: string
  method: string
  url: string
  headers: string
  body: string
  response?: any
}

const props = defineProps<{
  id: string
  data: HttpRequestConfig
}>()

const { updateNode } = useVueFlow()

// 正常是使用修改后的props覆盖原本的属性，但是会爆红，所以用计算属性来判断是否覆盖
const localConfig = computed<HttpRequestConfig>(() => ({
  title: props.data?.title || 'HTTP Request',
  method: props.data?.method || 'GET',
  url: props.data?.url || '',
  headers: props.data?.headers || '',
  body: props.data?.body || '',
}));
// 给两个响应式变量来进行监测
const isEditingTitle = ref(false)
const isLoading = ref(false)
const isEditing = ref(false)
// 格式化响应数据
const formattedResponse = computed(() => {
  if (!localConfig.value.response) return ''
  const res = localConfig.value.response
  if (typeof res.data === 'object') {
    return JSON.stringify(res.data, null, 2)
  }
  return String(res.data)
})

// 双击进入
const enterEditMode = () => {
  isEditing.value = true;
};

const exitEditMode = () => {
  isEditing.value = false;
  updateNodeData();
};

// 执行 HTTP 请求
const executeRequest = async () => {
  if (!localConfig.value.url) {
    ElMessage.warning('请输入请求 URL')
    return
  }
  isLoading.value = true
  try {
    const config: any = {
      method: localConfig.value.method,
      url: localConfig.value.url
    }
    // 处理请求头
    if (localConfig.value.headers) {
      try {
        config.headers = JSON.parse(localConfig.value.headers)
      } catch (e) {
        throw new Error('请求头必须是有效的 JSON 格式')
      }
    }
    // 请求体 
    if (['POST', 'PUT', 'PATCH'].includes(localConfig.value.method) && localConfig.value.body) {
      try {
        config.data = JSON.parse(localConfig.value.body)
      } catch (e) {
        config.data = localConfig.value.body
      }
    }
    // 发送请求
    const response = await axios(config)
    // 更新节点状态
    localConfig.value.response = {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers
    }
    ElMessage.success(`请求成功: ${response.status}`)
    updateNodeData()

  } catch (error: any) {
    // 错误处理
    localConfig.value.response = {
      error: true,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    }
    ElMessage.error(`请求失败: ${error.message}`)
    updateNodeData()
  } finally {
    isLoading.value = false
  }
}

const updateNodeData = () => {
  updateNode(props.id, { data: { ...localConfig.value } })
}

const saveTitle = () => {
  isEditingTitle.value = false
  updateNodeData()
}
</script>

<style scoped>
/* 节点整体容器 */
.vue-flow__node-httpRequest {
  padding: 16px;
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
  border: 2px solid #4CAF50;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  min-height: 100px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.icon-container {
  display: flex;
  align-items: center;
  flex-direction: column; 
}
.node-icon {
  width: 40px;
  height: 40px;
  color: #4CAF50;
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
  margin-bottom: 5px;
  font-weight: 500;
}

.el-input--small,
.el-select--small {
  width: 100%;
}
.el-textarea__inner {
  font-size: 13px !important;
}

.action-group {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.el-button--small {
  padding: 4px 12px;
  font-size: 13px;
}

.result-section {
  margin-top: 16px;
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
}
.response-info {
  font-size: 13px;
  line-height: 1.5;
}
.response-pre {
  background: #f9fafb;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 6px;
  font-size: 12px;
  border: 1px solid #e5e7eb;
}
</style>