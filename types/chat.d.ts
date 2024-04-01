declare namespace Chat {
  interface Chat {
    dateTime: string
    text: string
    inversion?: boolean
    error?: boolean
    loading?: boolean
    conversationOptions?: ConversationRequest | null
    requestOptions: { prompt: string; options?: ConversationRequest | null }
  }

  interface History {
    role: string
    content: string
  }

  interface ChatState {
    active: number | null
    usingContext: boolean
    history: History[]
    chat: { uuid: number; data: Chat[] }[]
  }

  interface ConversationRequest {
    conversation_id?: string
    history_len?: number
    max_tokens?: number
    model_name?: string
    prompt_name?: string
    stream?: boolean
    temperature?: number
    query: string
    message_id?: string
    history?: History[]
  }

  interface ConversationResponse {
    conversationId: string
    detail: {
      choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
      created: number
      id: string
      model: string
      object: string
      usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
    }
    id: string
    parentMessageId: string
    role: string
    text: string
  }
}
