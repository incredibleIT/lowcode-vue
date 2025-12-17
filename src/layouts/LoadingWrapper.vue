<script setup lang="ts">
defineProps<{
    loading: boolean
    skeletonCount?: number
}>()
</script>

<template>
    <el-skeleton :loading="loading" animated>
        <template #template>
            <el-card
                v-for="i in (skeletonCount ?? 5)"
                :key="i"
                class="workflow-card"
            >
                <el-skeleton-item variant="text" style="width: 40%" />
                <el-skeleton-item
                    variant="text"
                    style="width: 60%; margin-top: 8px"
                />
            </el-card>
        </template>

        <template #default>
            <slot />
        </template>
    </el-skeleton>
</template>

<style scoped>
.workflow-card {
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    margin-bottom: 12px;
    transition: box-shadow 0.2s;
}

.workflow-card:hover {
    box-shadow: 0 5px 8px rgba(0, 0, 0, 0.1);
}
</style>

