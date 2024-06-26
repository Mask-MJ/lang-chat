<script setup lang="ts">
import { useChatStore } from '@/stores/chat'
import { useRoute } from 'vue-router'
// import {updateChatSome }
import { useChat } from './useChat'
import { useScroll } from './useScroll'
import { useDialog } from 'naive-ui'
import { fetchChatAPIProcess } from '@/api'

let controller = new AbortController()

const route = useRoute()
const chatStore = useChatStore()
const dialog = useDialog()

const { addChat, updateChat, updateChatSome, getChatByUuidAndIndex } = useChat()
const { scrollRef, scrollToBottom, scrollToBottomIfAtBottom } = useScroll()

const prompt = ref<string>('')
const loading = ref<boolean>(false)
const inputRef = ref<Ref | null>(null)

const { uuid } = route.params as { uuid: string }

const dataSources = computed(() => chatStore.getChatByUuid(+uuid))
const conversationList = computed(() =>
  dataSources.value.filter((item) => !item.inversion && !!item.conversationOptions)
)

const buttonDisabled = computed(() => {
  return loading.value || !prompt.value || prompt.value.trim() === ''
})

// 未知原因刷新页面，loading 状态不会重置，手动重置
dataSources.value.forEach((item, index) => {
  if (item.loading) {
    updateChatSome(+uuid, index, { loading: false })
  }
})

function handleDelete(index: number) {
  if (loading.value) return

  dialog.warning({
    title: '删除消息',
    content: '确定要删除这条消息吗？',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      chatStore.deleteChatByUuid(+uuid, index)
    }
  })
}

async function onRegenerate(index: number) {
  if (loading.value) return

  controller = new AbortController()

  const { requestOptions } = dataSources.value[index]

  let message = requestOptions?.prompt ?? ''

  let options: Chat.ConversationRequest = {}

  if (requestOptions.options) options = { ...requestOptions.options }

  loading.value = true

  updateChat(+uuid, index, {
    dateTime: new Date().toLocaleString(),
    text: '',
    inversion: false,
    error: false,
    loading: true,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } }
  })

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr
          // Always process the final line
          const lastIndex = responseText.lastIndexOf('\n', responseText.length - 2)
          let chunk = responseText
          if (lastIndex !== -1) chunk = responseText.substring(lastIndex)
          try {
            const data = JSON.parse(chunk)
            updateChat(+uuid, index, {
              dateTime: new Date().toLocaleString(),
              text: lastText + (data.text ?? ''),
              inversion: false,
              error: false,
              loading: true,
              conversationOptions: {
                conversation_id: data.conversation_id,
                message_id: data.message_id,
                query: data.query
              },
              requestOptions: { prompt: message, options: { ...options } }
            })

            if (data.detail.choices[0].finish_reason === 'length') {
              options.message_id = data.message_id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }
          } catch (error) {
            //
          }
        }
      })
      updateChatSome(+uuid, index, { loading: false })
    }
    await fetchChatAPIOnce()
  } catch (error: any) {
    if (error.message === 'canceled') {
      updateChatSome(+uuid, index, {
        loading: false
      })
      return
    }

    const errorMessage = error?.message ?? '好像出错了, 请稍后再试'

    updateChat(+uuid, index, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } }
    })
  } finally {
    loading.value = false
  }
}

function handleEnter(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}

function handleSubmit() {
  onConversation()
}

async function onConversation() {
  let message = prompt.value

  if (loading.value) return

  if (!message || message.trim() === '') return

  controller = new AbortController()

  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: message,
    inversion: true,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: null }
  })
  scrollToBottom()

  loading.value = true
  prompt.value = ''

  let options: Chat.ConversationRequest = {
    query: message
  }
  const lastContext = conversationList.value[conversationList.value.length - 1]?.conversationOptions

  if (lastContext) options = { ...lastContext }

  addChat(+uuid, {
    dateTime: new Date().toLocaleString(),
    text: '思考中...',
    loading: true,
    inversion: false,
    error: false,
    conversationOptions: null,
    requestOptions: { prompt: message, options: { ...options } }
  })
  scrollToBottom()

  try {
    let lastText = ''
    const fetchChatAPIOnce = async () => {
      await fetchChatAPIProcess<Chat.ConversationResponse>({
        prompt: message,
        options,
        signal: controller.signal,
        onDownloadProgress: ({ event }) => {
          const xhr = event.target
          const { responseText } = xhr

          let chunk = responseText.substring(6, responseText.length)

          try {
            const data = JSON.parse(chunk)
            updateChat(+uuid, dataSources.value.length - 1, {
              dateTime: new Date().toLocaleString(),
              text: lastText + (data.text ?? ''),
              inversion: false,
              error: false,
              loading: true,
              conversationOptions: {
                conversation_id: data.conversation_id,
                message_id: data.message_id,
                query: data.query
              },
              requestOptions: { prompt: message, options: { ...options } }
            })

            if (data.detail.choices[0].finish_reason === 'length') {
              options.message_id = data.message_id
              lastText = data.text
              message = ''
              return fetchChatAPIOnce()
            }

            scrollToBottomIfAtBottom()
          } catch (error) {
            //
          }
        }
      })
      updateChatSome(+uuid, dataSources.value.length - 1, { loading: false })
    }

    await fetchChatAPIOnce()
  } catch (error: any) {
    const errorMessage = error?.message ?? '好像出错了, 请稍后再试'

    if (error.message === 'canceled') {
      updateChatSome(+uuid, dataSources.value.length - 1, {
        loading: false
      })
      scrollToBottomIfAtBottom()
      return
    }

    const currentChat = getChatByUuidAndIndex(+uuid, dataSources.value.length - 1)

    if (currentChat?.text && currentChat.text !== '') {
      updateChatSome(+uuid, dataSources.value.length - 1, {
        text: `${currentChat.text}\n[${errorMessage}]`,
        error: false,
        loading: false
      })
      return
    }

    updateChat(+uuid, dataSources.value.length - 1, {
      dateTime: new Date().toLocaleString(),
      text: errorMessage,
      inversion: false,
      error: true,
      loading: false,
      conversationOptions: null,
      requestOptions: { prompt: message, options: { ...options } }
    })
    scrollToBottomIfAtBottom()
  } finally {
    loading.value = false
  }
}

function handleStop() {
  if (loading.value) {
    controller.abort()
    loading.value = false
  }
}
onMounted(() => {
  scrollToBottom()
  if (inputRef.value) inputRef.value?.focus()
})

onUnmounted(() => {
  if (loading.value) controller.abort()
})
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <main class="flex-1 overflow-hidden">
      <div id="scrollRef" ref="scrollRef" class="h-full overflow-hidden overflow-y-auto">
        <div id="image-wrapper" class="w-full max-w-screen-xl m-auto dark:bg-[#101014] p-4">
          <template v-if="!dataSources.length">
            <div class="flex items-center justify-center mt-4 text-center text-neutral-300">
              <SvgIcon icon="ri:bubble-chart-fill" class="mr-2 text-3xl" />
              <span>新建聊天</span>
            </div>
          </template>
          <template v-else>
            <div>
              <Message
                v-for="(item, index) of dataSources"
                :key="index"
                :date-time="item.dateTime"
                :text="item.text"
                :inversion="item.inversion"
                :error="item.error"
                :loading="item.loading"
                @regenerate="onRegenerate(index)"
                @delete="handleDelete(index)"
              />
              <div class="sticky bottom-0 left-0 flex justify-center">
                <NButton v-if="loading" type="warning" @click="handleStop">
                  <template #icon>
                    <SvgIcon icon="ri:stop-circle-line" />
                  </template>
                  停止响应
                </NButton>
              </div>
            </div>
          </template>
        </div>
      </div>
    </main>
    <footer class="p-4">
      <div class="w-full max-w-screen-xl m-auto">
        <div class="flex items-center justify-between space-x-2">
          <NInput
            ref="inputRef"
            v-model:value="prompt"
            type="textarea"
            placeholder="来说点什么吧..."
            :autosize="{ minRows: 1, maxRows: 8 }"
            @keypress="handleEnter"
          />
          <NButton type="primary" :disabled="buttonDisabled" @click="handleSubmit">
            <template #icon>
              <span class="dark:text-black">
                <SvgIcon icon="ri:send-plane-fill" />
              </span>
            </template>
          </NButton>
        </div>
      </div>
    </footer>
  </div>
</template>

<style lang="" scoped></style>
