import { defineComponent, h, compile } from 'vue'
import type { Component } from 'vue'

export interface CompileResult {
  component: Component | null
  error: string | null
  warnings: string[]
}

export class ComponentCompiler {
  private static instance: ComponentCompiler

  public static getInstance(): ComponentCompiler {
    if (!ComponentCompiler.instance) {
      ComponentCompiler.instance = new ComponentCompiler()
    }
    return ComponentCompiler.instance
  }

  /**
   * Compile Vue component from template string
   */
  public compileFromTemplate(template: string, scriptContent: string = ''): CompileResult {
    try {
      const warnings: string[] = []

      // Basic validation
      if (!template.trim()) {
        return {
          component: null,
          error: 'Template cannot be empty',
          warnings
        }
      }

      // Create component definition
      let componentDefinition: any = {
        template: template.trim()
      }

      // Parse script content if provided
      if (scriptContent.trim()) {
        try {
          // Extract setup function or data/options from script
          const setupMatch = scriptContent.match(/setup\s*\(\s*\)\s*{([\s\S]*?)}/)
          const dataMatch = scriptContent.match(/data\s*\(\s*\)\s*{[\s\S]*?return\s*{([\s\S]*?)}\s*}/)

          if (setupMatch) {
            // For Composition API
            const setupCode = setupMatch[1]
            componentDefinition.setup = new Function('ref', 'computed', 'watch', 'onMounted', `
              const { ref, computed, watch, onMounted } = Vue;
              ${setupCode}
              return {};
            `)
          } else if (dataMatch) {
            // For Options API
            const dataCode = dataMatch[1]
            componentDefinition.data = new Function(dataCode)
          }

          // Extract methods
          const methodsMatch = scriptContent.match(/methods\s*:\s*{([\s\S]*?)}/)
          if (methodsMatch) {
            const methodsCode = methodsMatch[1]
            componentDefinition.methods = {}

            // Simple method extraction
            const methodMatches = methodsCode.match(/(\w+)\s*\([^)]*\)\s*{([\s\S]*?)}/g)
            if (methodMatches) {
              methodMatches.forEach(method => {
                const methodName = method.match(/(\w+)\s*\(/)?.[1]
                if (methodName) {
                  componentDefinition.methods[methodName] = new Function(method)
                }
              })
            }
          }
        } catch (scriptError) {
          warnings.push(`Script parsing warning: ${scriptError}`)
        }
      }

      // Create the component
      const component = defineComponent(componentDefinition)

      return {
        component,
        error: null,
        warnings
      }
    } catch (error) {
      return {
        component: null,
        error: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: []
      }
    }
  }

  /**
   * Compile Vue Single File Component from separate parts
   */
  public compileSFC(template: string, script: string = '', style: string = ''): CompileResult {
    try {
      const result = this.compileFromTemplate(template, script)

      // Handle style (in a real implementation, you'd use a proper CSS-in-JS solution)
      if (style.trim()) {
        // For now, just add a warning that styles are not fully supported
        result.warnings.push('Custom styles are not fully supported in this demo')
      }

      return result
    } catch (error) {
      return {
        component: null,
        error: `SFC compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        warnings: []
      }
    }
  }

  /**
   * Validate Vue template syntax
   */
  public validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    try {
      if (!template.trim()) {
        errors.push('Template cannot be empty')
        return { isValid: false, errors }
      }

      // Basic validation checks
      const openTags = (template.match(/<[^\/][^>]*>/g) || []).length
      const closeTags = (template.match(/<\/[^>]+>/g) || []).length
      const selfClosingTags = (template.match(/<[^>]*\/>/g) || []).length

      if (openTags - selfClosingTags !== closeTags) {
        errors.push('Unmatched HTML tags detected')
      }

      // Check for Vue directive syntax
      const invalidDirectives = template.match(/v-[a-zA-Z][a-zA-Z0-9-]*(?!=)/g) || []
      if (invalidDirectives.length > 0) {
        errors.push(`Invalid directive syntax: ${invalidDirectives.join(', ')}`)
      }

      return {
        isValid: errors.length === 0,
        errors
      }
    } catch (error) {
      errors.push(`Template validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { isValid: false, errors }
    }
  }
}