<template>
  <div class="learning-playground">
    <!-- Header -->
    <header class="playground-header">
      <div class="header-content">
        <div class="logo-section">
          <h1>Nuxt.js Learning Playground</h1>
          <p class="subtitle">Interactive coding environment for learning Nuxt.js</p>
        </div>
        <div class="header-actions">
          <button @click="resetAll" class="reset-btn" title="Reset Everything">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Reset
          </button>
          <button @click="toggleTheme" class="theme-btn" title="Toggle Theme">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Topic Navigation -->
    <nav class="topic-nav">
      <div class="nav-tabs">
        <button
          v-for="topic in topics"
          :key="topic.id"
          @click="selectTopic(topic.id)"
          :class="['nav-tab', { active: activeTopicId === topic.id }]"
        >
          <span class="tab-icon">{{ topic.icon }}</span>
          <span class="tab-label">{{ topic.label }}</span>
          <span v-if="getTopicProgress(topic.id) > 0" class="tab-progress">
            {{ getTopicProgress(topic.id) }}%
          </span>
        </button>
      </div>
    </nav>

    <!-- Main Content Area -->
    <main class="playground-main">
      <div class="content-layout">
        <!-- Left Panel: Topic Content -->
        <aside class="topic-panel" :class="{ collapsed: panelsCollapsed.topic }">
          <div class="panel-header">
            <h3>Learning Content</h3>
            <button @click="togglePanel('topic')" class="collapse-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>
          <div class="panel-content" v-show="!panelsCollapsed.topic">
            <TopicContent
              :topic="currentTopicData"
              :completed-examples="completedExamples"
              :time-spent="timeSpent"
              :is-loading="isLoadingExample"
              @select-example="handleSelectExample"
              @load-example="handleLoadExample"
              @complete-example="handleCompleteExample"
            />
          </div>
        </aside>

        <!-- Center: Code Editor and Preview -->
        <section class="editor-section">
          <div class="editor-preview-container">
            <!-- Split View Toggle -->
            <div class="view-controls">
              <div class="view-modes">
                <button
                  v-for="mode in viewModes"
                  :key="mode.key"
                  @click="currentViewMode = mode.key"
                  :class="['view-mode-btn', { active: currentViewMode === mode.key }]"
                  :title="mode.description"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <component :is="mode.icon" />
                  </svg>
                  <span class="mode-label">{{ mode.label }}</span>
                </button>
              </div>
              <div class="layout-controls">
                <button
                  @click="adjustSplitRatio(-0.1)"
                  class="split-control-btn"
                  title="Decrease Editor Size"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button
                  @click="adjustSplitRatio(0.1)"
                  class="split-control-btn"
                  title="Increase Editor Size"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Split Container -->
            <div
              class="split-container"
              :class="currentViewMode"
              :style="splitContainerStyle"
            >
              <!-- Code Editor Panel -->
              <div class="editor-panel" v-show="shouldShowEditor">
                <CodeEditor
                  v-model="codeValue"
                  :errors="errors"
                  :warnings="warnings"
                  :is-compiling="isCompiling"
                  @update:template="updateTemplate"
                  @update:script="updateScript"
                  @update:style="updateStyle"
                  @reset="handleResetCode"
                />
              </div>

              <!-- Live Preview Panel -->
              <div class="preview-panel" v-show="shouldShowPreview">
                <LivePreview
                  :template="template"
                  :script="script"
                  :style="style"
                  :is-compiling="isCompiling"
                  :error="errors[0]"
                  :warnings="warnings"
                  @mounted="handlePreviewMounted"
                  @error="handlePreviewError"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Right Panel: Additional Resources -->
        <aside class="resources-panel" :class="{ collapsed: panelsCollapsed.resources }">
          <div class="panel-header">
            <h3>Resources</h3>
            <button @click="togglePanel('resources')" class="collapse-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>
          <div class="panel-content" v-show="!panelsCollapsed.resources">
            <div class="resources-section">
              <h4>Quick Reference</h4>
              <div class="reference-links">
                <a
                  v-for="link in quickReference"
                  :key="link.title"
                  :href="link.url"
                  target="_blank"
                  class="reference-link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15,3 21,3 21,9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  {{ link.title }}
                </a>
              </div>
            </div>

            <div class="resources-section">
              <h4>Keyboard Shortcuts</h4>
              <div class="shortcuts-list">
                <div v-for="shortcut in keyboardShortcuts" :key="shortcut.key" class="shortcut-item">
                  <kbd>{{ shortcut.key }}</kbd>
                  <span>{{ shortcut.description }}</span>
                </div>
              </div>
            </div>

            <div class="resources-section">
              <h4>Your Progress</h4>
              <div class="progress-summary">
                <div class="progress-item">
                  <span>Topics Started</span>
                  <span>{{ startedTopics }} / {{ topics.length }}</span>
                </div>
                <div class="progress-item">
                  <span>Examples Completed</span>
                  <span>{{ completedExamples.length }}</span>
                </div>
                <div class="progress-item">
                  <span>Time Spent</span>
                  <span>{{ formatTime(timeSpent) }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>

    <!-- Status Bar -->
    <footer class="status-bar">
      <div class="status-left">
        <span class="status-item" v-if="currentExample">
          {{ currentExample.title }}
        </span>
        <span class="status-item" v-if="lastCompiled">
          Compiled: {{ lastCompiled.toLocaleTimeString() }}
        </span>
      </div>
      <div class="status-right">
        <span v-if="errors.length > 0" class="status-item error">
          {{ errors.length }} error{{ errors.length > 1 ? 's' : '' }}
        </span>
        <span v-else-if="warnings.length > 0" class="status-item warning">
          {{ warnings.length }} warning{{ warnings.length > 1 ? 's' : '' }}
        </span>
        <span v-else class="status-item success">Ready</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { learningExamples } from '~/content/examples'
import { useCodeEditor } from '~/composables/useCodeEditor'

// Composables
const {
  template,
  script,
  style,
  errors,
  warnings,
  isCompiling,
  lastCompiled,
  currentExample,
  compileCode,
  loadExample,
  resetCode
} = useCodeEditor()

// Topics configuration
const topics = [
  {
    id: 'components',
    label: 'Components',
    icon: '🧩',
    description: 'Learn Vue components and their usage'
  },
  {
    id: 'props',
    label: 'Props',
    icon: '📦',
    description: 'Master component props and data flow'
  },
  {
    id: 'autoimports',
    label: 'Auto-imports',
    icon: '⚡',
    description: 'Understand Nuxt\'s auto-import features'
  },
  {
    id: 'routing',
    label: 'Routing',
    icon: '🛣️',
    description: 'File-based routing in Nuxt'
  }
]

// View modes
const viewModes = [
  {
    key: 'split',
    label: 'Split',
    icon: 'RectSplitIcon',
    description: 'Show editor and preview side by side'
  },
  {
    key: 'editor',
    label: 'Editor',
    icon: 'SquareIcon',
    description: 'Show only code editor'
  },
  {
    key: 'preview',
    label: 'Preview',
    icon: 'PlayIcon',
    description: 'Show only preview'
  }
]

// State
const activeTopicId = ref('components')
const currentViewMode = ref('split')
const splitRatio = ref(0.5)
const panelsCollapsed = ref({
  topic: false,
  resources: false
})
const isLoadingExample = ref(false)

// Progress tracking
const completedExamples = ref<string[]>([])
const timeSpent = ref(0)
const startTime = ref(Date.now())

// Computed
const currentTopicData = computed(() => {
  const topicId = activeTopicId.value
  const examples = learningExamples[topicId] || []

  return {
    id: topicId,
    title: topics.find(t => t.id === topicId)?.label || '',
    description: topics.find(t => t.id === topicId)?.description || '',
    explanation: getTopicExplanation(topicId),
    examples: examples.map(ex => ({
      ...ex,
      difficulty: getDifficultyLevel(topicId, ex.id),
      tags: getExampleTags(topicId, ex.id),
      concepts: getExampleConcepts(topicId, ex.id)
    }))
  }
})

const startedTopics = computed(() => {
  return topics.filter(topic => {
    const examples = learningExamples[topic.id] || []
    return examples.some(ex => completedExamples.value.includes(ex.id))
  }).length
})

const codeValue = computed({
  get: () => ({ template: template.value, script: script.value, style: style.value }),
  set: (value) => {
    template.value = value.template
    script.value = value.script
    style.value = value.style
  }
})

const splitContainerStyle = computed(() => {
  if (currentViewMode.value !== 'split') return {}
  return {
    display: 'grid',
    gridTemplateColumns: `${splitRatio.value * 100}% ${100 - splitRatio.value * 100}%`
  }
})

const shouldShowEditor = computed(() => {
  return currentViewMode.value === 'split' || currentViewMode.value === 'editor'
})

const shouldShowPreview = computed(() => {
  return currentViewMode.value === 'split' || currentViewMode.value === 'preview'
})

// Quick reference links
const quickReference = [
  { title: 'Nuxt Documentation', url: 'https://nuxt.com/docs' },
  { title: 'Vue 3 Guide', url: 'https://vuejs.org/guide' },
  { title: 'Composition API', url: 'https://vuejs.org/guide/extras/composition-api-faq' },
  { title: 'Nuxt Components', url: 'https://nuxt.com/docs/getting-started/components' }
]

// Keyboard shortcuts
const keyboardShortcuts = [
  { key: 'Ctrl + S', description: 'Save code to localStorage' },
  { key: 'Ctrl + Enter', description: 'Compile and run code' },
  { key: 'Tab', description: 'Insert 2 spaces in editor' },
  { key: 'Ctrl + /', description: 'Toggle comment (coming soon)' }
]

// Methods
const selectTopic = (topicId: string) => {
  activeTopicId.value = topicId
}

const getTopicProgress = (topicId: string) => {
  const examples = learningExamples[topicId] || []
  if (examples.length === 0) return 0

  const completed = examples.filter(ex => completedExamples.value.includes(ex.id)).length
  return Math.round((completed / examples.length) * 100)
}

const getTopicExplanation = (topicId: string) => {
  const explanations = {
    components: 'Vue components are the building blocks of modern web applications. They allow you to create reusable, self-contained pieces of UI with their own logic and styling.',
    props: 'Props (properties) allow parent components to pass data down to child components. They provide a way to make components configurable and reusable.',
    autoimports: 'Nuxt automatically imports Vue composables and composables from your own files, eliminating the need for manual imports in most cases.',
    routing: 'Nuxt uses file-based routing, where the structure of your pages directory automatically generates the application routes.'
  }
  return explanations[topicId as keyof typeof explanations] || ''
}

const getDifficultyLevel = (topicId: string, exampleId: string): 'beginner' | 'intermediate' | 'advanced' => {
  // This could be made more sophisticated
  if (exampleId.includes('basic')) return 'beginner'
  if (exampleId.includes('advanced')) return 'advanced'
  return 'intermediate'
}

const getExampleTags = (topicId: string, exampleId: string): string[] => {
  const tagMap = {
    components: ['Vue', 'SFC', 'Template', 'Reactivity'],
    props: ['Props', 'Validation', 'Data Flow'],
    autoimports: ['Composables', 'Auto-imports', 'Reactivity'],
    routing: ['Routes', 'Navigation', 'Params']
  }
  return tagMap[topicId as keyof typeof tagMap] || []
}

const getExampleConcepts = (topicId: string, exampleId: string) => {
  // Return relevant concepts for each example
  return [
    { name: 'Reactivity', description: 'How Vue tracks and updates data changes' },
    { name: 'Template Syntax', description: 'Vue\'s declarative template syntax' }
  ]
}

const handleSelectExample = (example: any) => {
  // Example selection handler
}

const handleLoadExample = async (example: any) => {
  isLoadingExample.value = true
  try {
    await loadExample(example)
  } finally {
    isLoadingExample.value = false
  }
}

const handleCompleteExample = (exampleId: string) => {
  if (!completedExamples.value.includes(exampleId)) {
    completedExamples.value.push(exampleId)
  }
}

const handleResetCode = () => {
  resetCode()
}

const handlePreviewMounted = () => {
  // Preview mounted handler
}

const handlePreviewError = (error: Error) => {
  console.error('Preview error:', error)
}

const updateTemplate = (newTemplate: string) => {
  template.value = newTemplate
}

const updateScript = (newScript: string) => {
  script.value = newScript
}

const updateStyle = (newStyle: string) => {
  style.value = newStyle
}

const togglePanel = (panel: 'topic' | 'resources') => {
  panelsCollapsed.value[panel] = !panelsCollapsed.value[panel]
}

const adjustSplitRatio = (delta: number) => {
  splitRatio.value = Math.max(0.2, Math.min(0.8, splitRatio.value + delta))
}

const resetAll = () => {
  if (confirm('Are you sure you want to reset everything? This will clear all your progress and saved code.')) {
    resetCode()
    completedExamples.value = []
    timeSpent.value = 0
    startTime.value = Date.now()
    localStorage.removeItem('nuxt-playground-code')
    localStorage.removeItem('nuxt-playground-progress')
  }
}

const toggleTheme = () => {
  // Theme toggle functionality
  document.body.classList.toggle('dark-theme')
}

const formatTime = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

// Auto-save progress
const saveProgress = () => {
  try {
    const progress = {
      completedExamples: completedExamples.value,
      timeSpent: timeSpent.value,
      activeTopicId: activeTopicId.value
    }
    localStorage.setItem('nuxt-playground-progress', JSON.stringify(progress))
  } catch (error) {
    console.warn('Failed to save progress:', error)
  }
}

const loadProgress = () => {
  try {
    const saved = localStorage.getItem('nuxt-playground-progress')
    if (saved) {
      const progress = JSON.parse(saved)
      completedExamples.value = progress.completedExamples || []
      timeSpent.value = progress.timeSpent || 0
      if (progress.activeTopicId) {
        activeTopicId.value = progress.activeTopicId
      }
    }
  } catch (error) {
    console.warn('Failed to load progress:', error)
  }
}

// Track time spent
let timeInterval: NodeJS.Timeout | null = null

// Lifecycle
onMounted(() => {
  loadProgress()

  // Start time tracking
  timeInterval = setInterval(() => {
    timeSpent.value = Math.floor((Date.now() - startTime.value) / 60000)
    saveProgress()
  }, 30000) // Save every 30 seconds
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  saveProgress()
})

// Watch for changes and auto-save
watch([completedExamples, timeSpent, activeTopicId], saveProgress, { deep: true })
</script>

<!-- Icons for view modes -->
<script lang="ts">
const RectSplitIcon = defineComponent({
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
      h('line', { x1: '12', y1: '3', x2: '12', y2: '21' })
    ])
  }
})

const SquareIcon = defineComponent({
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' })
    ])
  }
})

const PlayIcon = defineComponent({
  render() {
    return h('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2'
    }, [
      h('polygon', { points: '5 3 19 12 5 21 5 3' })
    ])
  }
})
</script>

<style scoped>
.learning-playground {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.playground-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
}

.logo-section h1 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.reset-btn,
.theme-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.reset-btn:hover,
.theme-btn:hover {
  background: #f3f4f6;
  color: #374151;
  border-color: #9ca3af;
}

/* Topic Navigation */
.topic-nav {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 24px;
}

.nav-tabs {
  display: flex;
  gap: 8px;
  max-width: 1600px;
  margin: 0 auto;
}

.nav-tab {
  background: transparent;
  border: none;
  padding: 16px 24px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.nav-tab:hover {
  color: #374151;
  background: #f9fafb;
}

.nav-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  font-weight: 600;
}

.tab-progress {
  background: #3b82f6;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
}

/* Main Content */
.playground-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-layout {
  display: grid;
  grid-template-columns: 320px 1fr 280px;
  height: 100%;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* Panel Styles */
.topic-panel,
.resources-panel {
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.resources-panel {
  border-right: none;
  border-left: 1px solid #e5e7eb;
}

.panel.collapsed {
  width: 48px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.collapse-btn {
  background: transparent;
  border: none;
  color: #6b7280;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.panel.collapsed .collapse-btn svg {
  transform: rotate(180deg);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
}

/* Editor Section */
.editor-section {
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
}

.editor-preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.view-modes {
  display: flex;
  gap: 4px;
}

.view-mode-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  transition: all 0.2s;
}

.view-mode-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-mode-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.mode-label {
  font-weight: 500;
}

.layout-controls {
  display: flex;
  gap: 4px;
}

.split-control-btn {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.split-control-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Split Container */
.split-container {
  flex: 1;
  min-height: 0;
}

.split-container.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #e5e7eb;
}

.split-container.editor .preview-panel,
.split-container.preview .editor-panel {
  display: none;
}

.editor-panel,
.preview-panel {
  background: white;
  min-height: 0;
}

/* Resources Panel Content */
.resources-section {
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.resources-section:last-child {
  border-bottom: none;
}

.resources-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.reference-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reference-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 13px;
  padding: 6px 0;
}

.reference-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.shortcuts-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.shortcut-item kbd {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 11px;
  color: #374151;
  min-width: 60px;
  text-align: center;
}

.shortcut-item span {
  color: #6b7280;
  flex: 1;
}

.progress-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.progress-item span:first-child {
  color: #6b7280;
}

.progress-item span:last-child {
  font-weight: 600;
  color: #1f2937;
}

/* Status Bar */
.status-bar {
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.status-left,
.status-right {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-item.success {
  color: #059669;
}

.status-item.warning {
  color: #d97706;
}

.status-item.error {
  color: #dc2626;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-layout {
    grid-template-columns: 280px 1fr 240px;
  }
}

@media (max-width: 1024px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .topic-panel,
  .resources-panel {
    display: none;
  }

  .topic-panel:not(.collapsed),
  .resources-panel:not(.collapsed) {
    display: flex;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 10;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }

  .topic-panel {
    left: 0;
    width: 320px;
  }

  .resources-panel {
    right: 0;
    width: 280px;
    border-left: 1px solid #e5e7eb;
    border-right: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .nav-tabs {
    overflow-x: auto;
    padding: 0 16px;
  }

  .nav-tab {
    padding: 12px 16px;
    white-space: nowrap;
  }

  .view-controls {
    flex-direction: column;
    gap: 8px;
  }

  .status-bar {
    padding: 8px 16px;
    flex-direction: column;
    gap: 4px;
  }

  .status-left,
  .status-right {
    width: 100%;
    justify-content: center;
  }
}
</style>