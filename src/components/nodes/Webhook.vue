<template>
    <div class="vue-flow__node-webhook">
      <Handle 
        id="target-top" 
        type="target" 
        :position="Position.Top" 
        :connectable="true"
        class="custom-handle"
      />
      
      <!-- 未编辑时的节点显示 -->
      <div v-if="!isEditing" class="icon-display" @dblclick="enterEditMode">
        <div class="icon-container">
          <IconWebhook class="node-icon"/>
          <span class="node-title">{{ localConfig.title || 'Webhook' }}</span>
        </div>
      </div>
  
      <!-- 编辑模式 -->
      <div v-else class="edit-mode">
        <div class="edit-header">
          <span class="edit-title">配置Webhook节点</span>
          <button class="close-button" @click="exitEditMode">×</button>
        </div>
        
        <div class="edit-content">
          <!-- 基本配置区域 -->
          <div class="config-section">
            <label class="section-label">节点标题</label>
            <el-input 
              v-model="localConfig.title" 
              placeholder="输入节点名称" 
              size="small"
              @blur="updateNodeData"
            />
          </div>
  
          <!-- Webhook URL 区域 -->
          <div class="config-section">
            <label class="section-label">Webhook URL</label>
            <div class="url-group">
              <el-input 
                v-model="localConfig.url" 
                placeholder="https://example.com/webhook" 
                size="small"
                @blur="updateNodeData"
              />
              <el-button size="small" type="text" @click="copyUrl">复制URL</el-button>
            </div>
          </div>
  
          <!-- HTTP 方法选择 -->
          <div class="config-section">
            <label class="section-label">HTTP Method</label>
            <el-select v-model="localConfig.method" size="small" @change="updateNodeData">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
              <el-option label="PATCH" value="PATCH" />
            </el-select>
          </div>
  
          <!-- Path 配置 -->
          <div class="config-section">
            <label class="section-label">Path</label>
            <el-input 
              v-model="localConfig.path" 
              placeholder="输入路径" 
              size="small"
              @blur="updateNodeData"
            />
          </div>
  
          <!-- Authentication 配置 -->
          <div class="config-section">
            <label class="section-label">Authentication</label>
            <el-select v-model="localConfig.authentication" size="small" @change="updateNodeData">
              <el-option label="None" value="None" />
              <el-option label="Basic Auth" value="Basic Auth" />
              <el-option label="API Key" value="API Key" />
            </el-select>
            <div v-if="localConfig.authentication === 'Basic Auth'" class="auth-detail">
              <el-input 
                v-model="localConfig.username" 
                placeholder="用户名" 
                size="small"
                @blur="updateNodeData"
              />
              <el-input 
                v-model="localConfig.password" 
                type="password"
                placeholder="密码" 
                size="small"
                @blur="updateNodeData"
              />
            </div>
            <div v-if="localConfig.authentication === 'API Key'" class="auth-detail">
              <el-input 
                v-model="localConfig.apiKey" 
                placeholder="API Key" 
                size="small"
                @blur="updateNodeData"
              />
              <el-input 
                v-model="localConfig.apiKeyName" 
                placeholder="API Key 名称" 
                size="small"
                @blur="updateNodeData"
              />
            </div>
          </div>
  
          <!-- Respond 配置 -->
          <div class="config-section">
            <label class="section-label">Respond</label>
            <el-input
              v-model="localConfig.respond"
              type="textarea"
              :rows="3"
              placeholder='{"status": "ok"}'
              size="small"
              @blur="updateNodeData"
            />
          </div>
  
          <div class="action-group">
            <el-button type="primary" size="small" @click="testWebhook" :loading="isLoading">
              {{ isLoading ? '测试中...' : '测试Webhook' }}
            </el-button>
            <el-button type="success" size="small" @click="exitEditMode">完成</el-button>
          </div>
  
          <!-- 测试结果 -->
          <div v-if="localConfig.response" class="result-section">
            <el-collapse>
              <el-collapse-item title="Webhook响应">
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
  import IconWebhook from '../icons/IconWebhook.vue'
  
  // 定义Webhook节点数据类型
  interface WebhookConfig {
    title: string
    url: string
    method: string
    path: string
    authentication: string
    username: string
    password: string
    apiKey: string
    apiKeyName: string
    respond: string
    response?: any
  }
  
  const props = defineProps<{
    id: string
    data: WebhookConfig
  }>()
  
  const { updateNode } = useVueFlow()
  
  // 计算属性，处理props数据
  const localConfig = computed<WebhookConfig>(() => ({
    title: props.data?.title || 'Webhook',
    url: props.data?.url || '',
    method: props.data?.method || 'GET',
    path: props.data?.path || '',
    authentication: props.data?.authentication || 'None',
    username: props.data?.username || '',
    password: props.data?.password || '',
    apiKey: props.data?.apiKey || '',
    apiKeyName: props.data?.apiKeyName || '',
    respond: props.data?.respond || '',
  }));
  
  const isEditing = ref(false)
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
  
  // 双击进入编辑模式
  const enterEditMode = () => {
    isEditing.value = true;
  };
  
  // 退出编辑模式
  const exitEditMode = () => {
    isEditing.value = false;
    updateNodeData();
  };
  
  // 复制URL
  const copyUrl = () => {
    navigator.clipboard.writeText(localConfig.value.url).then(() => {
      ElMessage.success('URL已复制到剪贴板');
    }).catch(() => {
      ElMessage.error('复制URL失败');
    });
  };
  
  // 测试Webhook
  const testWebhook = async () => {
    if (!localConfig.value.url) {
      ElMessage.warning('请输入Webhook URL')
      return
    }
    isLoading.value = true
    try {
      const config: any = {
        method: localConfig.value.method,
        url: localConfig.value.url + (localConfig.value.path ? `/${localConfig.value.path}` : '')
      }
      // 处理认证
      if (localConfig.value.authentication === 'Basic Auth') {
        config.auth = {
          username: localConfig.value.username,
          password: localConfig.value.password
        }
      } else if (localConfig.value.authentication === 'API Key') {
        config.headers = {
          [localConfig.value.apiKeyName]: localConfig.value.apiKey
        }
      }
      // 处理响应体
      if (localConfig.value.respond) {
        try {
          config.data = JSON.parse(localConfig.value.respond)
        } catch (e) {
          config.data = localConfig.value.respond
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
      ElMessage.success(`测试成功: ${response.status}`)
      updateNodeData()
  
    } catch (error: any) {
      // 错误处理
      localConfig.value.response = {
        error: true,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
      ElMessage.error(`测试失败: ${error.message}`)
      updateNodeData()
    } finally {
      isLoading.value = false
    }
  }
  
  // 更新节点数据
  const updateNodeData = () => {
    updateNode(props.id, { data: { ...localConfig.value } })
  }
  </script>
  
  <style scoped>
  /* 节点整体容器 */
  .vue-flow__node-webhook {
    padding: 16px;
    background: transparent;
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
  
  .url-group {
    display: flex;
    gap: 8px;
  }
  
  .auth-detail {
    margin-top: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  </style>