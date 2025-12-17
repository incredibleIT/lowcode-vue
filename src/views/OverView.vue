<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {getFlowPage, getFlowList} from '@/api/flow';
import {useRouter} from 'vue-router';
import LoadingWrapper from "@/layouts/LoadingWrapper.vue";
import type {Workflow} from "@/interface/workflow.ts";

const activeName = ref('workflows');
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const router = useRouter();

// 工作流列表
const workflows = ref <Workflow[]> ([])

const load = ref(true)

const loadFlowList = async () => {
    load.value = true
    const result = await getFlowList();
    workflows.value = result.data.data
    load.value = false
}
onMounted(loadFlowList)

</script>


<template>
    <div class="content">
        <!-- 标题 -->
        <div class="title_test">
            <div>
                <h2 style="font-size: 19px; font-weight: bold;">OverView</h2>
                <p style="font-size: 16px; color: #666666;">欢迎来到n8n, 这是一个基于Vue+Spring的流程管理平台</p>
            </div>
            <div>
                <el-button type="primary" style="background-color: #EA4B71; border: #EA4B71;"
                           @click="goToWorkflowEditor">创建新流程
                </el-button>
            </div>
        </div>

        <!-- 选项卡 -->
        <div class="m">
            <el-tabs class="custom-tabs" v-model="activeName">
                <el-tab-pane label="Workflows 工作流程" name="workflows"/>
                <el-tab-pane label="Credentials 凭据" name="credentials"/>
                <el-tab-pane label="Executions 执行" name="executions"/>
            </el-tabs>
        </div>

        <!-- 搜索框 -->
        <div class="search">
            <el-input style="width: 260px; --el-color-primary: #EA4B71;" placeholder="输入条件" clearable
                      prefix-icon="Search"/>
        </div>

        <LoadingWrapper :loading="load" :skeletonCount="5">
            <div class="workflow-list">
                <el-card v-for="(item, index) in workflows" :key="index" class="workflow-card">
                    <div class="workflow">
                        <div class="workflow-left">
                            <div class="title">{{ item.name }}</div>
                            <div class="subtitle">Last updated {{ item.updatedAt }} | Created {{ item.createdAt }}</div>
                        </div>

                        <div class="workflow-right">
                            <div class="status">
                                <span>{{ item.status }}</span>
                                <el-switch
                                    v-model="item.active"
                                    active-color="#13ce66"
                                    inactive-color="#999"
                                    size="small"/>
                            </div>
                        </div>
                    </div>

                </el-card>
            </div>
        </LoadingWrapper>
        <el-skeleton
            :loading="load"
            animated
        >
            <template #template>
                <el-card
                    v-for="i in 5"
                    :key="i"
                    class="workflow-card"
                >
                    <el-skeleton-item variant="text" style="width: 40%"/>
                    <el-skeleton-item variant="text" style="width: 60%; margin-top: 8px"/>
                </el-card>
            </template>

            <template #default>


            </template>
        </el-skeleton>

        <!-- 分页器 -->
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

.custom-menu :deep(.el-menu-item) {
    border-radius: 12px !important;
}

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