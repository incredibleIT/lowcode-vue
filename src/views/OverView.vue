<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getFlowList } from '@/api/flow';
import { useRouter } from 'vue-router';
import WorkflowEditor from '@/views/WorkflowEditor.vue';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';
const activeName = ref('workflows');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const router = useRouter();

const goToWorkflowEditor = () => {
    console.log('1111111')
  router.push({ name: 'WorkflowEditor' });
};
// 当分页器页码发生改变时，动态加载对应页的工作流列表
const handlePageChange = (page: number) => {
    currentPage.value = page;
    loadCurrentPageInfo(page);
}

// 加载当前页信息
const loadCurrentPageInfo = async (page: number) => {
    const result = await getFlowByPage(pageSize.value, page);
    total.value = result.data.total || 0;
    workflows.value = result.data.result || [];
}

// 发送http请求获取当前页的工作流列表
const getFlowByPage = (pagesize: number, page: number): Promise<any> => {
    return getFlowList(pagesize, page).then(res => {
        return res;
    })
}

// 当组件挂载时，加载第一页的工作流列表
onMounted(() => {
    loadCurrentPageInfo(currentPage.value);
})

// 工作流列表
const workflows = ref([
    {
        name: 'My workflow 2',
        lastUpdated: '1 day ago',
        createdAt: '30 September',
        status: 'Inactive',
        active: false
    },
    {
        name: 'My workflow 3',
        lastUpdated: '1 day ago',
        createdAt: '30 September',
        status: 'Inactive',
        active: false
    }
])


</script>


<template>

    <div class="overview">
        <el-container class="container">
            <el-aside class="aside" width="200px">

                <div class="logo">
                    <!-- 闪电矢量图 -->
                    <!-- <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                        <g fill="none">
                            <path fill="#feb804" d="M17.42 13.51s7.243-11.603 7.407-11.893c.165-.29.2-.822-.255-.822c-.454 0-11.737 11.518-11.737 11.518l-8.013 4.75s-.537.33-.455.742c.083.413.443.43.608.43s8.713-.045 9.21-.06c.617-.018.465.86.465.86L9.24 27.54s-2.362 3.27-2.362 3.492c0 .328.394.49.762.27c.285-.17 18.71-15.782 19.523-16.854c.22-.293.332-1.063-.576-1.063s-8.134 2.105-8.134 2.105z"/>
                            <path fill="#ffc927" d="M16.153 12.588c-.223.305-.283.815.197.845c.477.027 10.237-.046 10.237-.046s-6.972 6.408-9.082 8.32c-2.11 1.913-9.097 8.108-9.567 8.546c-.46.43-.878.825-1.048.77c-.027-.008-.062-.155.595-1.238c.6-.988 6.36-10.64 6.585-11.005s.422-.675.535-.845c.112-.17.477-1.098-.283-1.098s-9.5.226-9.5.226s6.038-5.123 7.783-6.5C14.35 9.185 24.24.794 24.573.794c.332 0-8.195 11.485-8.42 11.793"/><path fill="#ffe567" d="M15.863 17.688c.45-.648.892-.695 1.16-.535c.345.207.38.684-.055 1.262c-.686.915-5.72 7.653-5.913 7.89c-.365.45-.902.253-.553-.4c.293-.54 4.896-7.547 5.36-8.218m-7.156-1.315c-.862.577-1.665-.286-1.087-.918c.577-.633 4.368-3.787 5.135-4.44c.768-.652 5.248-4.55 5.595-4.83c.46-.37.745.005.455.39c-.288.385-3.455 3.55-4.852 4.835c-1.08.995-4.426 4.413-5.246 4.962"/>
                        </g>
                    </svg> -->
                    <!-- 弹性布局 -->
                    <div class="flex_build">
                        <div>
                            <!-- 图标矢量图 -->
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="30" class="logo_svg">
                                <path fill="#EA4B71" fill-rule="evenodd" d="M27.2 16.4a3.2 3.2 0 0 1-3.1-2.4h-3.667a1.6 1.6 0 0 0-1.578 1.337l-.132.79A3.2 3.2 0 0 1 17.683 18a3.2 3.2 0 0 1 1.04 1.874l.132.789A1.6 1.6 0 0 0 20.433 22h.468a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-6.3.8h-.467a3.2 3.2 0 0 1-3.156-2.674l-.132-.789a1.6 1.6 0 0 0-1.578-1.337h-1.268a3.201 3.201 0 0 1-6.198 0H6.299A3.201 3.201 0 0 1 0 18a3.2 3.2 0 0 1 6.3-.8h1.8a3.201 3.201 0 0 1 6.2 0h1.267a1.6 1.6 0 0 0 1.578-1.337l.132-.79a3.2 3.2 0 0 1 3.156-2.673h3.668a3.201 3.201 0 0 1 6.299.8 3.2 3.2 0 0 1-3.2 3.2m0-1.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m-24 4.8a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m9.6-1.6a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0m12.8 4.8a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0" clip-rule="evenodd"></path>
                            </svg>
                            <!-- n8n文字 -->
                            <svg width="26" height="30" class="logo_text">
                                <g fill="#101330">
                                    <path fill-rule="evenodd" d="M15.002 16.918v-.076c.558-.28 1.116-.762 1.116-1.716 0-1.372-1.13-2.198-2.69-2.198-1.598 0-2.74.877-2.74 2.224 0 .915.533 1.41 1.116 1.69v.076a2.16 2.16 0 0 0-1.42 2.059c0 1.385 1.141 2.351 3.032 2.351 1.89 0 2.994-.966 2.994-2.351a2.16 2.16 0 0 0-1.408-2.059m-1.587-2.82c.635 0 1.104.406 1.104 1.092s-.482 1.093-1.103 1.093c-.622 0-1.142-.407-1.142-1.093 0-.699.495-1.093 1.142-1.093m0 6.01c-.735 0-1.332-.47-1.332-1.27 0-.725.495-1.272 1.32-1.272.812 0 1.307.534 1.307 1.297 0 .775-.571 1.245-1.294 1.245" clip-rule="evenodd"></path>
                                    <path d="M18.367 21.2h1.624v-3.442c0-1.131.685-1.627 1.46-1.627.76 0 1.357.509 1.357 1.55v3.52h1.624V17.35c0-1.664-.964-2.63-2.474-2.63-.952 0-1.485.381-1.865.877h-.102l-.14-.75h-1.484zm-14.376 0H2.367v-6.352h1.485l.14.75h.1c.381-.496.914-.877 1.866-.877 1.51 0 2.474.966 2.474 2.63v3.85H6.808V17.68c0-1.041-.596-1.55-1.358-1.55-.774 0-1.459.496-1.459 1.627z"></path>
                                </g>
                            </svg>
                        </div>
                        <div>
                            <el-button icon="Plus" />
                        </div>
                    </div>
                    <!-- 菜单 -->
                    <div class="menu_test">
                        <el-menu mode="vertical" 
                        class="custom-menu"
                        default-active="overview"
                        active-text-color="#eb4b72"
                        background-color="#ffffff" 
                        style="border-right: none;">

                            <el-menu-item index="overview">
                                <el-icon><House /></el-icon>
                                <span>概述</span>
                            </el-menu-item>
                            <el-menu-item index="workflow">
                                <el-icon><Document /></el-icon>
                                <span>工作流程</span>
                            </el-menu-item>
                            <el-menu-item index="credentials">
                                <el-icon><Setting /></el-icon>
                                <span>凭据</span>
                            </el-menu-item>

                        </el-menu>
                    </div>
                </div>
            </el-aside>

            <el-main class="main">
                <div class="content">
                    <!-- 标题位置 -->
                    <div class="title_test">
                        <div>
                            <h2 style="font-size: 19px; font-weight: bold;">OverView</h2>
                            <p style="font-size: 16px; color: #666666;">欢迎来到n8n, 这是一个基于Vue+Spring的流程管理平台</p>
                        </div>
                        <div>
                            <el-button type="primary" style="background-color: #EA4B71; border: #EA4B71;" @click="goToWorkflowEditor">创建新流程</el-button>
                        </div>
                    </div>

                    <!-- 选项卡的位置 -->
                    <div class="m">
                        <el-tabs class="custom-tabs" v-model="activeName">
                            <el-tab-pane label="Workflows 工作流程" name="workflows" />
                            <el-tab-pane label="Credentials 凭据" name="credentials" />
                            <el-tab-pane label="Executions 执行" name="executions" />
                        </el-tabs>
                    </div>

                    <!-- 搜索框的位置 -->
                    <div class="search">
                        <el-input style="width: 260px; --el-color-primary: #EA4B71;" placeholder="输入条件" clearable prefix-icon="Search"/>
                    </div>

                    <!-- 流程列表位置 -->
                    <div class="workflow-list">
                        <el-card v-for="(item, index) in workflows" :key="index" class="workflow-card" >
                            <div class="workflow">
                                <div class="workflow-left">
                                    <div class="title">{{ item.name }}</div>
                                    <div class="subtitle">Last updated {{ item.lastUpdated }} | Created {{ item.createdAt }}</div>
                                </div>

                                <div class="workflow-right">
                                    <div class="status">
                                        <span>{{ item.status }}</span>
                                        <el-switch 
                                            v-model="item.active" 
                                            active-colo="#13ce66"
                                            inactive-color="#999"
                                            size="small"/>
                                    </div>
                                </div>
                            </div>

                        </el-card>
                    </div>

                    <!-- 分页器位置 -->
                    <div class="page">
                        <el-pagination
                            v-model:current-page="currentPage"
                            background
                            background-color="#EA4B71"
                            :page-size="pageSize"
                            :total="total"
                            layout="prev, pager, next, jumper"
                            @current-change="handlePageChange"

                        />
                    </div>
                </div>
            </el-main>
        </el-container>
    </div>

</template>

<style scoped>
:deep(.el-switch) {
    --el-switch-on-color: #EA4B71 !important;
}
/* 当前选中页码的样式 */
:deep(.is-background .el-pager li.is-active) {
  background-color: #EA4B71 !important;
  color: white !important;
}

:deep(.el-pagination) {
    --el-pagination-hover-color: #EA4B71 !important;
}
:deep(.el-input) {
    --el-input-focus-border-color: #EA4B71 !important;

}

.page {
    display: flex;
    justify-content: right;
}

.workflow {
    display: flex;
    justify-content: space-between;
}

.workflow-right {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.status {
    display: flex;
    align-items: center;
    gap: 8px;
}

.workflow-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: box-shadow 0.2s;
}

.workflow-card:hover {
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #999;
  margin: 4px 0 0;
}




.search {
    display: flex;
    justify-content: right;
    padding-bottom: 20px;
}



:deep(.el-tabs__active-bar) {
    background-color: #EA4B71 !important;
}
:deep(.el-tabs__item.is-active) {
    color: #EA4B71 !important;
}
:deep(.el-tabs__item:hover) {
    color: #EA4B71 !important;
}
:deep(.el-tabs__nav-wrap::after) {
    position: static !important;
}


.title_test {
    display: flex;
    justify-content: space-between;
    padding-bottom: 20px;
}

.content {
    padding: 0 200px;
}


/* 控制菜单项高度 */
.custom-menu .el-menu-item {
  height: 40px !important;       /* 设置高度 */
  line-height: 40px !important;  /* 文字垂直居中 */
  padding: 0 20px !important;    /* 可选：调整左右内边距 */
}

.custom-menu :deep(.el-menu-item) {
    border-radius: 12px !important;
}

.menu_test {
    padding-top: 20px;
    /* padding-top: 60px;
    padding-bottom: 20px; */
}
.flex_build {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.logo_text {
    margin-left: 0.2rem;
}

.logo {
    padding: 12px;
}

.logo_svg {
    margin-left: 0.5rem;
}

.overview {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.container {
  height: 100%;
  width: 100%;
}

.aside {
  /* background-color: #f5f5f5; */
  background-color: #ffffff;
  border-right: 1px solid #e6e6e6;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
  height: 60px;
}

.main {
  background-color: #ffffff;
  padding: 20px;
  overflow-y: auto;
  overflow-x: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .aside {
    width: 100% !important;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #e6e6e6;
  }
  
  .container {
    flex-direction: column;
  }
  
  .header {
    height: 50px;
  }
  
  .main {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .main {
    padding: 10px;
  }
}
</style>