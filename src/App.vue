<script setup lang="ts">
import SiderView from './views/SiderView.vue'
import ChatHistory from './views/ChatHistory.vue'
import ChatView from './views/ChatView.vue'
</script>

<template>
  <n-layout class="h-full" has-sider>
    <n-layout-sider bordered :width="200" :native-scrollbar="false">
      <SiderView />
    </n-layout-sider>
    <n-layout>
      <n-layout-content class="h-full">
        <div class="flex flex-col h-full">
          <div class="p-4 b-b-1 border-gray-200">头部</div>
          <div class="flex flex-1">
            <ChatHistory />
            <div class="bg-gray-100 flex-1">
              <ChatView />
            </div>
          </div>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<style scoped></style>
