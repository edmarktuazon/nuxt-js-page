<template>
  <div class="topic-content">
    <div class="topic-header">
      <h2>{{ currentTopic?.title || 'Select a Topic' }}</h2>
      <p class="topic-description">{{ currentTopic?.description }}</p>
    </div>

    <div v-if="currentTopic" class="topic-body">
      <!-- Explanation Section -->
      <div class="explanation-section">
        <h3>Explanation</h3>
        <div class="explanation-content">
          <p>{{ currentTopic.explanation }}</p>
        </div>
      </div>

      <!-- Examples Section -->
      <div class="examples-section">
        <h3>Examples</h3>
        <div class="examples-grid">
          <div
            v-for="example in currentTopic.examples"
            :key="example.id"
            :class="['example-card', { active: selectedExampleId === example.id }]"
            @click="selectExample(example.id)"
          >
            <div class="example-header">
              <h4>{{ example.title }}</h4>
              <div class="example-difficulty">
                <span :class="['difficulty-badge', example.difficulty]">
                  {{ example.difficulty }}
                </span>
              </div>
            </div>
            <p class="example-description">{{ example.description }}</p>
            <div class="example-tags">
              <span
                v-for="tag in example.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Example Details -->
      <div v-if="selectedExample" class="selected-example">
        <div class="example-detail-header">
          <h3>{{ selectedExample.title }}</h3>
          <div class="example-actions">
            <button
              @click="loadExampleInEditor"
              class="load-btn"
              :disabled="isLoading"
            >
              <span v-if="isLoading">Loading...</span>
              <span v-else>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Load in Editor
              </span>
            </button>
          </div>
        </div>

        <div class="example-content">
          <p>{{ selectedExample.description }}</p>

          <!-- Code Preview -->
          <div class="code-preview">
            <div class="code-tabs">
              <button
                v-for="tab in codeTabs"
                :key="tab.key"
                @click="activeCodeTab = tab.key"
                :class="['code-tab', { active: activeCodeTab === tab.key }]"
              >
                {{ tab.label }}
              </button>
            </div>

            <div class="code-display">
              <pre v-if="activeCodeTab === 'template'"><code>{{ selectedExample.template }}</code></pre>
              <pre v-else-if="activeCodeTab === 'script'"><code>{{ selectedExample.script }}</code></pre>
              <pre v-else-if="activeCodeTab === 'style'"><code>{{ selectedExample.style }}</code></pre>
            </div>
          </div>

          <!-- Hints and Tips -->
          <div v-if="selectedExample.hints.length > 0" class="hints-section">
            <h4>Hints & Tips</h4>
            <ul class="hints-list">
              <li v-for="hint in selectedExample.hints" :key="hint">
                {{ hint }}
              </li>
            </ul>
          </div>

          <!-- Key Concepts -->
          <div v-if="selectedExample.concepts.length > 0" class="concepts-section">
            <h4>Key Concepts</h4>
            <div class="concepts-list">
              <div
                v-for="concept in selectedExample.concepts"
                :key="concept.name"
                class="concept-item"
              >
                <div class="concept-name">{{ concept.name }}</div>
                <div class="concept-description">{{ concept.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Tracker -->
      <div class="progress-section">
        <h3>Your Progress</h3>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Completed Examples</span>
            <span class="stat-value">{{ completedExamples }} / {{ totalExamples }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time Spent</span>
            <span class="stat-value">{{ timeSpent }}</span>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-topic">
      <div class="empty-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <h3>No Topic Selected</h3>
      <p>Select a topic from the tabs above to start learning.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { LearningExample } from '~/composables/useCodeEditor'

interface Topic {
  id: string
  title: string
  description: string
  explanation: string
  examples: (LearningExample & {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    tags: string[]
    concepts: Array<{
      name: string
      description: string
    }>
  })[]
}

interface Props {
  topic?: Topic | null
  completedExamples?: string[]
  timeSpent?: number // in minutes
  isLoading?: boolean
}

interface Emits {
  (e: 'select-example', example: LearningExample): void
  (e: 'load-example', example: LearningExample): void
  (e: 'complete-example', exampleId: string): void
}

const props = withDefaults(defineProps<Props>(), {
  completedExamples: () => [],
  timeSpent: 0,
  isLoading: false
})

const emit = defineEmits<Emits>()

// Local state
const selectedExampleId = ref<string>('')
const activeCodeTab = ref<'template' | 'script' | 'style'>('template')

// Computed
const currentTopic = computed(() => props.topic)

const selectedExample = computed(() => {
  if (!currentTopic.value || !selectedExampleId.value) return null
  return currentTopic.value.examples.find(ex => ex.id === selectedExampleId.value) || null
})

const codeTabs = [
  { key: 'template' as const, label: 'Template' },
  { key: 'script' as const, label: 'Script' },
  { key: 'style' as const, label: 'Style' }
]

const totalExamples = computed(() => currentTopic.value?.examples.length || 0)

const completedExamples = computed(() => {
  if (!currentTopic.value) return 0
  return currentTopic.value.examples.filter(ex =>
    props.completedExamples.includes(ex.id)
  ).length
})

const progressPercentage = computed(() => {
  if (totalExamples.value === 0) return 0
  return Math.round((completedExamples.value / totalExamples.value) * 100)
})

const timeSpent = computed(() => {
  const minutes = props.timeSpent
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
})

// Methods
const selectExample = (exampleId: string) => {
  selectedExampleId.value = exampleId
  const example = currentTopic.value?.examples.find(ex => ex.id === exampleId)
  if (example) {
    emit('select-example', example)
  }
}

const loadExampleInEditor = () => {
  if (selectedExample.value) {
    emit('load-example', selectedExample.value)
  }
}

// Auto-select first example when topic changes
watch(currentTopic, (newTopic) => {
  if (newTopic && newTopic.examples.length > 0) {
    const firstUncompleted = newTopic.examples.find(ex =>
      !props.completedExamples.includes(ex.id)
    )
    selectExample(firstUncompleted?.id || newTopic.examples[0].id)
  } else {
    selectedExampleId.value = ''
  }
}, { immediate: true })
</script>

<style scoped>
.topic-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: #fafafa;
  overflow-y: auto;
}

.topic-header {
  margin-bottom: 32px;
}

.topic-header h2 {
  margin: 0 0 8px 0;
  color: #1f2937;
  font-size: 28px;
  font-weight: 700;
}

.topic-description {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
  line-height: 1.5;
}

.topic-body {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.explanation-section h3,
.examples-section h3,
.selected-example h3,
.progress-section h3 {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 20px;
  font-weight: 600;
}

.explanation-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.explanation-content p {
  margin: 0;
  line-height: 1.6;
  color: #4b5563;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.example-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.example-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.example-card.active {
  border-color: #3b82f6;
  background: #eff6ff;
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.example-header h4 {
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
}

.difficulty-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.difficulty-badge.beginner {
  background: #dcfce7;
  color: #166534;
}

.difficulty-badge.intermediate {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-badge.advanced {
  background: #fecaca;
  color: #991b1b;
}

.example-description {
  margin: 0 0 16px 0;
  color: #6b7280;
  line-height: 1.5;
}

.example-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.selected-example {
  background: white;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e5e7eb;
}

.example-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.example-detail-header h3 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
}

.load-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
}

.load-btn:hover:not(:disabled) {
  background: #2563eb;
}

.load-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.example-content p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.code-preview {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.code-tabs {
  display: flex;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.code-tab {
  background: transparent;
  border: none;
  padding: 12px 20px;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.code-tab:hover {
  color: #374151;
  background: #f3f4f6;
}

.code-tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: white;
}

.code-display {
  background: #1f2937;
  max-height: 300px;
  overflow: auto;
}

.code-display pre {
  margin: 0;
  padding: 16px;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
}

.hints-section,
.concepts-section {
  background: #fefce8;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  padding: 20px;
}

.hints-section h4,
.concepts-section h4 {
  margin: 0 0 12px 0;
  color: #92400e;
  font-size: 16px;
  font-weight: 600;
}

.hints-list {
  margin: 0;
  padding-left: 20px;
}

.hints-list li {
  margin-bottom: 8px;
  color: #78350f;
  line-height: 1.5;
}

.concepts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.concept-item {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #f59e0b;
}

.concept-name {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
}

.concept-description {
  color: #78350f;
  font-size: 14px;
  line-height: 1.4;
}

.progress-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.progress-stats {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.empty-topic {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-topic h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #6b7280;
}

.empty-topic p {
  margin: 0;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .topic-content {
    padding: 16px;
  }

  .topic-header h2 {
    font-size: 24px;
  }

  .examples-grid {
    grid-template-columns: 1fr;
  }

  .example-detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .progress-stats {
    flex-direction: column;
    gap: 16px;
  }

  .code-display pre {
    font-size: 12px;
    padding: 12px;
  }
}
</style>