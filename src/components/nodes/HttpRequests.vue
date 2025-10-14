<template>
  <div class="vue-flow__node-httpRequest">
    <Handle type="target" :position="Position.Top" :connectable="true" />
    
    <div class="node-body">
      <!-- 节点头部，可编辑标题 -->
      <div class="node-header" @dblclick="isEditingTitle = true">
        <span v-if="!isEditingTitle">🌐 {{ localConfig.title }}</span>
        <input
          v-else
          v-model="localConfig.title"
          @blur="saveTitle"
          @keyup.enter="saveTitle"
          autofocus
        />
      </div>
      <div class="config-section">
        <label>请求方法</label>
        <el-select v-model="localConfig.method" size="small">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
        </el-select>
      </div>

      <div class="config-section">
        <label>请求 URL</label>
        <el-input v-model="localConfig.url" placeholder="https://api.example.com/data" size="small" />
      </div>

      <div class="config-section">
        <label>请求头 (JSON)</label>
        <el-input
          v-model="localConfig.headers"
          type="textarea"
          :rows="2"
          placeholder='{"Content-Type": "application/json"}'
          size="small"
        />
      </div>

      <div v-if="['POST', 'PUT', 'PATCH'].includes(localConfig.method)" class="config-section">
        <label>请求体</label>
        <el-input
          v-model="localConfig.body"
          type="textarea"
          :rows="3"
          placeholder='{"key": "value"}'
          size="small"
        />
      </div>
      <div class="node-actions">
        <el-button type="primary" size="small" :loading="isLoading" @click="executeRequest">
          {{ isLoading ? '请求中...' : '发送请求' }}
        </el-button>
      </div>
      <div v-if="localConfig.response" class="result-section">
        <el-collapse>
          <el-collapse-item title="请求响应">
            <div class="response-info">
              <p><strong>状态码:</strong> {{ localConfig.response.status }}</p>
              <p><strong>响应数据:</strong></p>
              <pre>{{ formattedResponse }}</pre>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" :connectable="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Handle, Position, useVueFlow } from '@vue-flow/core'
import { ElMessage } from 'element-plus'
import axios from 'axios'

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

//节点本地配置
const localConfig = ref<HttpRequestConfig>({
  title: 'HTTP Request',
  method: 'GET',
  url: '',
  headers: '',
  body: '',
  ...props.data // 覆盖默认值
})
const isEditingTitle = ref(false)
const isLoading = ref(false)

// 格式化响应数据
const formattedResponse = computed(() => {
  if (!localConfig.value.response) return ''
  const res = localConfig.value.response
  if (typeof res.data === 'object') {
    return JSON.stringify(res.data, null, 2)
  }
  return String(res.data)
})

// 执行 HTTP 请求
const executeRequest = async () => {
  // 基础验证
  if (!localConfig.value.url) {
    ElMessage.warning('请输入请求 URL')
    return
  }

  isLoading.value = true

  try {
    // 准备请求配置
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

    // 处理请求体（针对 POST、PUT 等方法）
    if (['POST', 'PUT', 'PATCH'].includes(localConfig.value.method) && localConfig.value.body) {
      try {
        config.data = JSON.parse(localConfig.value.body)
      } catch (e) {
        // 如果解析失败，作为普通文本发送
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
.vue-flow__node-httpRequest {
  padding: 12px;
  background: #fff;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  min-width: 280px;
  font-size: 12px;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}

.node-header {
  font-weight: bold;
  margin-bottom: 12px;
  cursor: pointer;
  color: #4CAF50;
}

.config-section {
  margin-bottom: 10px;
}

.config-section label {
  display: block;
  font-size: 11px;
  color: #666;
  margin-bottom: 4px;
  font-weight: 500;
}

.node-actions {
  margin-top: 12px;
  text-align: center;
}

.result-section {
  margin-top: 12px;
}

.response-info {
  font-size: 11px;
  line-height: 1.4;
}

.response-info pre {
  background: #f5f5f5;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 6px;
  font-size: 10px;
}
</style>