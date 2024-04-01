import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'

export function fetchChatAPIProcess<T = any>(params: {
  prompt: string
  options: {
    conversation_id?: string
    history_len?: number
    max_tokens?: number
    model_name?: string
    prompt_name?: string
    stream?: boolean
    temperature?: number
    query: string
    history?: Chat.History[]
  }
  signal?: GenericAbortSignal
  onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void
}) {
  const data: Record<string, any> = {
    conversation_id: params.options.conversation_id || '',
    history_len: params.options.history_len || -1,
    max_tokens: params.options.max_tokens || 0,
    model_name: params.options.model_name || 'chatglm3-6b',
    prompt_name: params.options.prompt_name || 'default',
    stream: params.options.stream || false,
    temperature: params.options.temperature || 0.7,
    query: params.options.query,
    history: params.options.history || []
  }

  return post<T>({
    url: '/api/chat',
    data,
    signal: params.signal,
    onDownloadProgress: params.onDownloadProgress
  })
}
