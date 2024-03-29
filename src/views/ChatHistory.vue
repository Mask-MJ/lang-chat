<script setup lang="ts">
import { uniqueId } from 'lodash-es'

const historyList = ref<{ id: string; name: string; time: string }[]>([])
const activeChat = ref<string>()

const newChat = () => {
  const id = uniqueId('chat_')
  historyList.value.push({ id, name: `新建聊天`, time: new Date().toLocaleString() })
  activeChat.value = id
}
const deleteChat = (index: string) => {
  const indexToDelete = historyList.value.findIndex((item) => item.id === index)
  // historyList.value.splice(indexToDelete, 1)
  // if (activeChat.value === index) {
  //   activeChat.value = undefined
  // }
  // 删除当前聊天记录,回退到上一个聊天记录
  if (indexToDelete === 0) {
    historyList.value.shift()
    activeChat.value = historyList.value[0]?.id
  } else {
    historyList.value.splice(indexToDelete, 1)
    activeChat.value = historyList.value[indexToDelete - 1]?.id
  }
}
</script>

<template>
  <div class="chat-history w-50 b-r-1 border-gray-200 flex flex-col">
    <div class="p-2 text-center b-b-1 border-gray-200 shrink-0">历史记录</div>
    <n-scrollbar class="grow overflow-auto h-60%">
      <n-list hoverable clickable class="p-2">
        <n-list-item
          class="mb-2 border-2 border-gray-300"
          :class="activeChat === item.id && '!border-#18a058'"
          v-for="item in historyList"
          :key="item.id"
          @click="activeChat = item.id"
        >
          <div class="flex-center mb-1">
            <p class="w-30 text-truncate mr-2">{{ item.name }}</p>
            <div class="flex-center p-1 hover:bg-gray-300 rounded" @click="deleteChat(item.id)">
              <i class="i-ant-design:delete-outlined"></i>
            </div>
          </div>
          <p class="text-xs">{{ item.time }}</p>
        </n-list-item>
      </n-list>
    </n-scrollbar>
    <div class="shrink-0 p-4 b-t-1 border-gray-200 flex-center cursor-pointer" @click="newChat">
      <i class="text-2xl i-carbon:add"></i> 新的聊天
    </div>
  </div>
</template>

<style scoped>
/* .chat-history {
  height: calc(100vh - 60px);
} */
</style>
