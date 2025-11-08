import { ref, computed, watch, nextTick, readonly } from 'vue'
import { ComponentCompiler } from '~/utils/componentCompiler.js'

export function useCodeEditor() {
  // State
  const template = ref('')
  const script = ref('')
  const style = ref('')
  const errors = ref([])
  const warnings = ref([])
  const isCompiling = ref(false)
  const lastCompiled = ref(null)
  const currentExample = ref(null)

  // Get compiler instance
  const compiler = ComponentCompiler.getInstance()

  // Computed properties
  const fullCode = computed(() => {
    return `<template>
${template.value}
</template>

<script setup>
${script.value}
</script>

<style>
${style.value}
</style>`
  })

  const hasErrors = computed(() => errors.value.length > 0)
  const hasWarnings = computed(() => warnings.value.length > 0)
  const isValid = computed(() => !hasErrors.value)

  // Compile code
  const compileCode = async () => {
    if (isCompiling.value) return { component: null, error: 'Already compiling', warnings: [] }

    isCompiling.value = true
    errors.value = []
    warnings.value = []

    try {
      await nextTick()

      // Validate template first
      const templateValidation = compiler.validateTemplate(template.value)
      if (!templateValidation.isValid) {
        errors.value = templateValidation.errors
        isCompiling.value = false
        return { component: null, error: errors.value[0], warnings: [] }
      }

      // Compile the component
      const result = compiler.compileSFC(template.value, script.value, style.value)

      if (result.error) {
        errors.value = [result.error]
      }

      if (result.warnings.length > 0) {
        warnings.value = result.warnings
      }

      lastCompiled.value = new Date()

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error'
      errors.value = [errorMessage]
      return { component: null, error: errorMessage, warnings: [] }
    } finally {
      isCompiling.value = false
    }
  }

  // Debounced compilation
  let compileTimeout = null
  const debouncedCompile = async (delay = 300) => {
    if (compileTimeout) {
      clearTimeout(compileTimeout)
    }

    compileTimeout = setTimeout(() => {
      compileCode()
    }, delay)
  }

  // Load example
  const loadExample = (example) => {
    currentExample.value = example
    template.value = example.template
    script.value = example.script
    style.value = example.style
    errors.value = []
    warnings.value = []

    // Auto-compile after a short delay
    nextTick(() => {
      debouncedCompile(100)
    })
  }

  // Save to localStorage
  const saveToStorage = () => {
    try {
      const state = {
        template: template.value,
        script: script.value,
        style: style.value,
        currentExampleId: currentExample.value?.id || null
      }

      localStorage.setItem('nuxt-playground-code', JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to save to localStorage:', error)
    }
  }

  // Load from localStorage
  const loadFromStorage = () => {
    try {
      const saved = localStorage.getItem('nuxt-playground-code')
      if (saved) {
        const state = JSON.parse(saved)
        template.value = state.template || ''
        script.value = state.script || ''
        style.value = state.style || ''
      }
    } catch (error) {
      console.warn('Failed to load from localStorage:', error)
    }
  }

  // Reset code
  const resetCode = () => {
    if (currentExample.value) {
      loadExample(currentExample.value)
    } else {
      template.value = ''
      script.value = ''
      style.value = ''
      errors.value = []
      warnings.value = []
    }
  }

  // Update template
  const updateTemplate = (newTemplate) => {
    template.value = newTemplate
    debouncedCompile()
    saveToStorage()
  }

  // Update script
  const updateScript = (newScript) => {
    script.value = newScript
    debouncedCompile()
    saveToStorage()
  }

  // Update style
  const updateStyle = (newStyle) => {
    style.value = newStyle
    debouncedCompile()
    saveToStorage()
  }

  // Watch for changes and auto-save
  watch([template, script, style], () => {
    saveToStorage()
  }, { deep: true })

  // Initialize from storage on load
  if (process.client) {
    loadFromStorage()
  }

  return {
    // State
    template: readonly(template),
    script: readonly(script),
    style: readonly(style),
    errors: readonly(errors),
    warnings: readonly(warnings),
    isCompiling: readonly(isCompiling),
    lastCompiled: readonly(lastCompiled),
    currentExample: readonly(currentExample),

    // Computed
    fullCode: readonly(fullCode),
    hasErrors: readonly(hasErrors),
    hasWarnings: readonly(hasWarnings),
    isValid: readonly(isValid),

    // Methods
    compileCode,
    debouncedCompile,
    loadExample,
    resetCode,
    updateTemplate,
    updateScript,
    updateStyle,
    saveToStorage,
    loadFromStorage
  }
}