<template>
  <div class="live-preview">
    <div class="preview-header">
      <h3>Live Preview</h3>
      <div class="preview-actions">
        <button @click="refreshPreview" class="action-btn" title="Refresh Preview">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
        <button @click="toggleFullscreen" class="action-btn" title="Toggle Fullscreen">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="preview-content" :class="{ 'has-error': hasError }">
      <!-- Loading state -->
      <div v-if="isCompiling" class="loading-state">
        <div class="spinner"></div>
        <p>Compiling component...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div class="error-details">
          <h4>Compilation Error</h4>
          <p class="error-message">{{ error }}</p>
          <details v-if="errorDetails" class="error-stack">
            <summary>Error Details</summary>
            <pre>{{ errorDetails }}</pre>
          </details>
        </div>
        <button @click="retryCompilation" class="retry-btn">Retry</button>
      </div>

      <!-- Runtime error state -->
      <div v-else-if="runtimeError" class="error-state runtime-error">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="error-details">
          <h4>Runtime Error</h4>
          <p class="error-message">{{ runtimeError }}</p>
          <details v-if="runtimeErrorStack" class="error-stack">
            <summary>Stack Trace</summary>
            <pre>{{ runtimeErrorStack }}</pre>
          </details>
        </div>
        <button @click="clearRuntimeError" class="retry-btn">Clear Error</button>
      </div>

      <!-- Success state - render component -->
      <div v-else-if="compiledComponent" class="component-container">
        <div class="component-wrapper" ref="componentWrapper">
          <ErrorBoundary @error="handleRuntimeError">
            <component
              :is="compiledComponent"
              v-bind="componentProps"
              @vue:mounted="handleComponentMounted"
              @vue:error="handleComponentError"
            />
          </ErrorBoundary>
        </div>

        <!-- Component info -->
        <div class="component-info">
          <div class="info-item">
            <span class="label">Component:</span>
            <span class="value">{{ componentName }}</span>
          </div>
          <div class="info-item">
            <span class="label">Rendered:</span>
            <span class="value">{{ lastRendered?.toLocaleTimeString() }}</span>
          </div>
        </div>
      </div>

      <!-- No component state -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="9" y1="9" x2="15" y2="9"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        <p>No component to preview</p>
        <p class="hint">Start by editing the template tab</p>
      </div>
    </div>

    <!-- Console output -->
    <div v-if="consoleMessages.length > 0" class="console-output">
      <div class="console-header">
        <h4>Console Output</h4>
        <button @click="clearConsole" class="clear-btn">Clear</button>
      </div>
      <div class="console-messages">
        <div
          v-for="(message, index) in consoleMessages"
          :key="index"
          :class="['console-message', message.type]"
        >
          <span class="timestamp">{{ message.timestamp }}</span>
          <span class="content">{{ message.content }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onErrorCaptured } from 'vue'
import { ComponentCompiler } from '~/utils/componentCompiler'

interface ConsoleMessage {
  type: 'log' | 'warn' | 'error'
  content: string
  timestamp: string
}

interface Props {
  template: string
  script: string
  style: string
  isCompiling?: boolean
  error?: string | null
  warnings?: string[]
}

interface Emits {
  (e: 'mounted'): void
  (e: 'error', error: Error): void
}

const props = withDefaults(defineProps<Props>(), {
  isCompiling: false,
  error: null,
  warnings: () => []
})

const emit = defineEmits<Emits>()

// Component state
const compiledComponent = ref<any>(null)
const runtimeError = ref<string | null>(null)
const runtimeErrorStack = ref<string | null>(null)
const lastRendered = ref<Date | null>(null)
const componentWrapper = ref<HTMLElement>()
const consoleMessages = ref<ConsoleMessage[]>([])

// Computed
const hasError = computed(() => props.error || runtimeError.value)
const componentName = computed(() => {
  if (compiledComponent.value) {
    return compiledComponent.value.__name || compiledComponent.value.name || 'DynamicComponent'
  }
  return 'Unknown'
})

const errorDetails = computed(() => {
  if (props.error && props.error.includes('at line')) {
    return props.error
  }
  return null
})

// Get compiler instance
const compiler = ComponentCompiler.getInstance()

// Console override for capturing console logs
let originalConsole: {
  log: typeof console.log
  warn: typeof console.warn
  error: typeof console.error
} | null = null

const setupConsoleCapture = () => {
  if (originalConsole || !process.client) return

  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  }

  console.log = (...args) => {
    if (originalConsole) originalConsole.log(...args)
    addConsoleMessage('log', args.join(' '))
  }

  console.warn = (...args) => {
    if (originalConsole) originalConsole.warn(...args)
    addConsoleMessage('warn', args.join(' '))
  }

  console.error = (...args) => {
    if (originalConsole) originalConsole.error(...args)
    addConsoleMessage('error', args.join(' '))
  }
}

const restoreConsole = () => {
  if (originalConsole) {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    originalConsole = null
  }
}

const addConsoleMessage = (type: ConsoleMessage['type'], content: string) => {
  const timestamp = new Date().toLocaleTimeString()
  consoleMessages.value.push({ type, content, timestamp })

  // Keep only last 50 messages
  if (consoleMessages.value.length > 50) {
    consoleMessages.value = consoleMessages.value.slice(-50)
  }
}

const clearConsole = () => {
  consoleMessages.value = []
}

// Component compilation
const compileComponent = async () => {
  if (!props.template.trim()) {
    compiledComponent.value = null
    return
  }

  try {
    // Setup console capture before compilation
    setupConsoleCapture()

    const result = compiler.compileSFC(props.template, props.script, props.style)

    if (result.error) {
      compiledComponent.value = null
      return
    }

    if (result.component) {
      compiledComponent.value = result.component
      await nextTick()
      lastRendered.value = new Date()
    }
  } catch (error) {
    console.error('Preview compilation failed:', error)
    compiledComponent.value = null
  } finally {
    // Restore console after compilation
    setTimeout(restoreConsole, 100)
  }
}

// Error handling
const handleRuntimeError = (error: Error) => {
  runtimeError.value = error.message
  runtimeErrorStack.value = error.stack || null
  emit('error', error)
}

const clearRuntimeError = () => {
  runtimeError.value = null
  runtimeErrorStack.value = null
}

const handleComponentMounted = () => {
  emit('mounted')
}

const handleComponentError = (error: Error) => {
  handleRuntimeError(error)
}

// Vue error capture
onErrorCaptured((error) => {
  handleRuntimeError(error)
  return false
})

// Actions
const refreshPreview = () => {
  clearRuntimeError()
  compileComponent()
}

const retryCompilation = () => {
  clearRuntimeError()
  compileComponent()
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    componentWrapper.value?.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Component props (could be extended to accept props from parent)
const componentProps = ref({})

// Watch for code changes
watch([() => props.template, () => props.script, () => props.style], () => {
  if (!props.isCompiling) {
    clearRuntimeError()
    compileComponent()
  }
}, { deep: true })

// Watch for compilation errors
watch(() => props.error, (newError) => {
  if (newError) {
    compiledComponent.value = null
  }
})

// Initial compilation
if (props.template.trim()) {
  nextTick(() => {
    compileComponent()
  })
}

// Cleanup
onUnmounted(() => {
  restoreConsole()
})
</script>

<script lang="ts">
// Error Boundary Component
export const ErrorBoundary = defineComponent({
  name: 'ErrorBoundary',
  emits: ['error'],
  setup(props, { slots, emit }) {
    const error = ref<Error | null>(null)

    onErrorCaptured((err) => {
      error.value = err
      emit('error', err)
      return false
    })

    return () => {
      if (error.value) {
        return h('div', { class: 'error-fallback' }, [
          h('h4', 'Component Error'),
          h('p', error.value.message)
        ])
      }
      return slots.default?.()
    }
  }
})
</script>

<style scoped>
.live-preview {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}

.preview-content {
  flex: 1;
  position: relative;
  min-height: 300px;
}

.preview-content.has-error {
  background: #fef2f2;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 32px;
  text-align: center;
}

.error-state.runtime-error {
  background: #fffbeb;
}

.error-icon {
  color: #ef4444;
  margin-bottom: 16px;
}

.runtime-error .error-icon {
  color: #f59e0b;
}

.error-details h4 {
  margin: 0 0 8px 0;
  color: #dc2626;
  font-size: 18px;
}

.runtime-error .error-details h4 {
  color: #d97706;
}

.error-message {
  color: #7f1d1d;
  margin-bottom: 16px;
  font-family: monospace;
  font-size: 14px;
}

.runtime-error .error-message {
  color: #92400e;
}

.error-stack {
  margin-bottom: 20px;
  text-align: left;
  width: 100%;
  max-width: 500px;
}

.error-stack summary {
  cursor: pointer;
  color: #6b7280;
  margin-bottom: 8px;
}

.error-stack pre {
  background: #1f2937;
  color: #e5e7eb;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
}

.retry-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

.component-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.component-wrapper {
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: white;
}

.component-info {
  background: #f8fafc;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #6b7280;
}

.info-item {
  display: flex;
  gap: 4px;
}

.info-item .label {
  font-weight: 600;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 4px 0;
}

.empty-state .hint {
  font-size: 14px;
  opacity: 0.7;
}

.console-output {
  background: #1f2937;
  border-top: 1px solid #374151;
  max-height: 200px;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #111827;
  border-bottom: 1px solid #374151;
}

.console-header h4 {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.clear-btn {
  background: transparent;
  border: 1px solid #4b5563;
  color: #9ca3af;
  padding: 2px 8px;
  border-radius: 3px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #374151;
  color: white;
}

.console-messages {
  max-height: 150px;
  overflow-y: auto;
  padding: 8px;
}

.console-message {
  display: flex;
  gap: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 11px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.console-message.log {
  color: #e5e7eb;
}

.console-message.warn {
  color: #fbbf24;
}

.console-message.error {
  color: #f87171;
}

.timestamp {
  color: #6b7280;
  opacity: 0.7;
}

.content {
  flex: 1;
  word-break: break-word;
}

/* Responsive */
@media (max-width: 768px) {
  .preview-header {
    padding: 12px 16px;
  }

  .component-wrapper {
    padding: 16px;
  }

  .error-state {
    padding: 20px;
  }

  .component-info {
    flex-direction: column;
    gap: 8px;
  }
}
</style>