<script setup lang="ts">
import { NIcon } from 'naive-ui'

const menuOptions = [
  {
    label: '通用问答',
    key: 'hear-the-wind-sing',
    icon: () => h('i', { class: 'i-line-md:text-box-to-text-box-multiple-transition' }),
    children: [{ label: '精准知识问答', key: 'rat' }]
  },
  {
    label: '辅助工具',
    key: 'pinball-1973',
    icon: () => h('i', { class: 'i-line-md:chat-twotone' }),
    children: [
      { label: '辅助阅读专业文章', key: 'rat' },
      { label: '提炼文章核心内容', key: 'rat' },
      { label: '专业文档翻译', key: 'rat' }
    ]
  }
]
</script>

<template>
  <n-menu :options="menuOptions" default-expand-all />
</template>

<style lang="" scoped></style>
