<template>
  <div class="code-editor">
    <div class="editor-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="activeTab = tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
      >
        {{ tab.label }}
        <span v-if="getTabError(tab.key)" class="error-indicator">!</span>
      </button>
    </div>

    <div class="editor-content">
      <div v-show="activeTab === 'template'" class="editor-panel">
        <div class="editor-header">
          <span>&lt;template&gt;</span>
          <div class="editor-actions">
            <button @click="formatCode('template')" class="action-btn" title="Format Code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
        <textarea
          v-model="localTemplate"
          @input="updateTemplate"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          ref="templateRef"
          class="code-textarea"
          placeholder="Enter your template here..."
          spellcheck="false"
        ></textarea>
        <div v-if="templateError" class="error-message">
          {{ templateError }}
        </div>
      </div>

      <div v-show="activeTab === 'script'" class="editor-panel">
        <div class="editor-header">
          <span>&lt;script setup&gt;</span>
          <div class="editor-actions">
            <button @click="formatCode('script')" class="action-btn" title="Format Code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
        <textarea
          v-model="localScript"
          @input="updateScript"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          ref="scriptRef"
          class="code-textarea"
          placeholder="Enter your script here..."
          spellcheck="false"
        ></textarea>
        <div v-if="scriptError" class="error-message">
          {{ scriptError }}
        </div>
      </div>

      <div v-show="activeTab === 'style'" class="editor-panel">
        <div class="editor-header">
          <span>&lt;style&gt;</span>
          <div class="editor-actions">
            <button @click="formatCode('style')" class="action-btn" title="Format Code">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </div>
        <textarea
          v-model="localStyle"
          @input="updateStyle"
          @keydown="handleKeydown"
          @scroll="syncScroll"
          ref="styleRef"
          class="code-textarea"
          placeholder="Enter your styles here..."
          spellcheck="false"
        ></textarea>
        <div v-if="styleError" class="error-message">
          {{ styleError }}
        </div>
      </div>
    </div>

    <div class="editor-footer">
      <div class="status-info">
        <span v-if="isCompiling" class="compiling">Compiling...</span>
        <span v-else-if="hasErrors" class="has-errors">{{ errors.length }} errors</span>
        <span v-else-if="hasWarnings" class="has-warnings">{{ warnings.length }} warnings</span>
        <span v-else class="ready">Ready</span>
      </div>
      <div class="editor-actions">
        <button @click="resetCode" class="action-btn" title="Reset Code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </button>
        <button @click="copyCode" class="action-btn" title="Copy Code">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Props {
  modelValue?: {
    template: string
    script: string
    style: string
  }
  errors?: string[]
  warnings?: string[]
  isCompiling?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: { template: string; script: string; style: string }): void
  (e: 'update:template', value: string): void
  (e: 'update:script', value: string): void
  (e: 'update:style', value: string): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ template: '', script: '', style: '' }),
  errors: () => [],
  warnings: () => [],
  isCompiling: false
})

const emit = defineEmits<Emits>()

// Local state
const activeTab = ref<'template' | 'script' | 'style'>('template')
const localTemplate = ref(props.modelValue.template)
const localScript = ref(props.modelValue.script)
const localStyle = ref(props.modelValue.style)

// Refs for textareas
const templateRef = ref<HTMLTextAreaElement>()
const scriptRef = ref<HTMLTextAreaElement>()
const styleRef = ref<HTMLTextAreaElement>()

// Clipboard
const { copy } = useClipboard()

// Computed
const tabs = [
  { key: 'template' as const, label: 'Template' },
  { key: 'script' as const, label: 'Script' },
  { key: 'style' as const, label: 'Style' }
]

const hasErrors = computed(() => props.errors.length > 0)
const hasWarnings = computed(() => props.warnings.length > 0)

const templateError = computed(() => props.errors.find(error =>
  error.toLowerCase().includes('template')
))

const scriptError = computed(() => props.errors.find(error =>
  error.toLowerCase().includes('script')
))

const styleError = computed(() => props.errors.find(error =>
  error.toLowerCase().includes('style')
))

// Methods
const getTabError = (tab: string) => {
  switch (tab) {
    case 'template':
      return templateError.value
    case 'script':
      return scriptError.value
    case 'style':
      return styleError.value
    default:
      return null
  }
}

const updateTemplate = useDebounceFn(() => {
  emit('update:template', localTemplate.value)
  emit('update:modelValue', {
    template: localTemplate.value,
    script: localScript.value,
    style: localStyle.value
  })
}, 300)

const updateScript = useDebounceFn(() => {
  emit('update:script', localScript.value)
  emit('update:modelValue', {
    template: localTemplate.value,
    script: localScript.value,
    style: localStyle.value
  })
}, 300)

const updateStyle = useDebounceFn(() => {
  emit('update:style', localStyle.value)
  emit('update:modelValue', {
    template: localTemplate.value,
    script: localScript.value,
    style: localStyle.value
  })
}, 300)

const handleKeydown = (event: KeyboardEvent) => {
  // Handle tab key for indentation
  if (event.key === 'Tab') {
    event.preventDefault()
    const textarea = event.target as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    // Insert 2 spaces for tab
    const newValue = value.substring(0, start) + '  ' + value.substring(end)
    textarea.value = newValue

    // Update local state
    if (textarea === templateRef.value) {
      localTemplate.value = newValue
    } else if (textarea === scriptRef.value) {
      localScript.value = newValue
    } else if (textarea === styleRef.value) {
      localStyle.value = newValue
    }

    // Restore cursor position
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2
    })

    // Trigger update
    if (textarea === templateRef.value) {
      updateTemplate()
    } else if (textarea === scriptRef.value) {
      updateScript()
    } else if (textarea === styleRef.value) {
      updateStyle()
    }
  }

  // Handle Ctrl/Cmd + Enter to compile
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    // Force immediate compilation
    if (activeTab.value === 'template') updateTemplate()
    else if (activeTab.value === 'script') updateScript()
    else if (activeTab.value === 'style') updateStyle()
  }
}

const formatCode = (type: 'template' | 'script' | 'style') => {
  let code = ''
  if (type === 'template') code = localTemplate.value
  else if (type === 'script') code = localScript.value
  else if (type === 'style') code = localStyle.value

  // Basic formatting - just ensure consistent indentation
  const lines = code.split('\n')
  const formatted = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''

    // Simple formatting - this could be enhanced with a proper formatter
    if (type === 'template' && trimmed.startsWith('<') && !trimmed.startsWith('</')) {
      return '  ' + trimmed
    }
    return trimmed
  }).join('\n')

  if (type === 'template') {
    localTemplate.value = formatted
    updateTemplate()
  } else if (type === 'script') {
    localScript.value = formatted
    updateScript()
  } else if (type === 'style') {
    localStyle.value = formatted
    updateStyle()
  }
}

const resetCode = () => {
  emit('reset')
}

const copyCode = async () => {
  const fullCode = `<template>
${localTemplate.value}
</template>

<script setup>
${localScript.value}
</script>

<style>
${localStyle.value}
</style>`

  try {
    await copy(fullCode)
    // Could show a toast notification here
  } catch (error) {
    console.error('Failed to copy code:', error)
  }
}

const syncScroll = () => {
  // Could sync scroll between editor and line numbers if implemented
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue.template !== localTemplate.value) {
    localTemplate.value = newValue.template
  }
  if (newValue.script !== localScript.value) {
    localScript.value = newValue.script
  }
  if (newValue.style !== localStyle.value) {
    localStyle.value = newValue.style
  }
}, { deep: true })

// Focus the active tab input
watch(activeTab, async () => {
  await nextTick()
  if (activeTab.value === 'template' && templateRef.value) {
    templateRef.value.focus()
  } else if (activeTab.value === 'script' && scriptRef.value) {
    scriptRef.value.focus()
  } else if (activeTab.value === 'style' && styleRef.value) {
    styleRef.value.focus()
  }
})
</script>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
}

.editor-tabs {
  display: flex;
  background: #2d2d2d;
  border-bottom: 1px solid #3e3e3e;
}

.tab {
  padding: 12px 20px;
  background: transparent;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.tab:hover {
  background: #383838;
  color: #e5e7eb;
}

.tab.active {
  background: #1e1e1e;
  color: white;
  border-bottom: 2px solid #42b883;
}

.error-indicator {
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.editor-content {
  flex: 1;
  position: relative;
}

.editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #252525;
  color: #9ca3af;
  font-size: 12px;
  border-bottom: 1px solid #3e3e3e;
}

.code-textarea {
  flex: 1;
  background: #1e1e1e;
  color: #e5e7eb;
  border: none;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  tab-size: 2;
}

.code-textarea::placeholder {
  color: #6b7280;
}

.error-message {
  background: #7f1d1d;
  color: #fecaca;
  padding: 12px 16px;
  font-size: 12px;
  border-top: 1px solid #991b1b;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #2d2d2d;
  border-top: 1px solid #3e3e3e;
}

.status-info {
  font-size: 12px;
}

.compiling {
  color: #f59e0b;
}

.has-errors {
  color: #ef4444;
}

.has-warnings {
  color: #f59e0b;
}

.ready {
  color: #22c55e;
}

.editor-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: 1px solid #4b5563;
  color: #9ca3af;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #383838;
  color: #e5e7eb;
  border-color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .tab {
    padding: 10px 16px;
    font-size: 12px;
  }

  .code-textarea {
    font-size: 13px;
    padding: 12px;
  }

  .editor-footer {
    padding: 6px 12px;
  }
}
</style>