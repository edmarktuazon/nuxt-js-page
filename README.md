# Nuxt.js Learning Playground

An interactive web application designed to teach Nuxt.js concepts through live code editing with real-time preview.

## Overview

This project creates a comprehensive learning environment where users can:
- Write and edit Vue/Nuxt.js code with syntax highlighting
- See live preview updates in real-time
- Learn through interactive examples focused on Components, Props, Auto-imports, and Routing
- Navigate between topics using clean tab interface
- Get contextual explanations and hints for each concept

## Features

### 🎯 Learning Modules
- **Components**: Basic component creation, props, events, and slots
- **Props**: Prop validation, default values, and type checking
- **Auto-imports**: Vue and Nuxt composables auto-imports
- **Routing**: File-based routing and dynamic routes

### 💻 Interactive Code Editor
- Multi-tab interface (Template, Script, Style)
- Real-time syntax highlighting
- Error display with line numbers
- Auto-save to localStorage
- Keyboard shortcuts (Tab for indentation, Ctrl+Enter to compile)

### 🎭 Live Preview
- Real-time component compilation and rendering
- Error boundary for graceful error handling
- Console output capture
- Component information display
- Fullscreen mode support

### 📚 Learning Content
- Structured examples with difficulty levels
- Hints and tips for each concept
- Key concepts explanations
- Progress tracking
- Time tracking

### 🎨 Modern UI/UX
- Clean, responsive design
- Dark theme support
- Mobile-friendly interface
- Split view modes (editor/preview/split)
- Collapsible panels

## Project Structure

```
nuxt-js-page/
├── app/app.vue                     # Root application component
├── pages/index.vue                 # Main landing page
├── components/
│   ├── LearningPlayground.vue      # Main playground container
│   ├── CodeEditor.vue              # Code editor component
│   ├── LivePreview.vue             # Live preview component
│   └── TopicContent.vue            # Learning topic content
├── composables/
│   └── useCodeEditor.ts            # Code editor state management
├── utils/
│   └── componentCompiler.ts        # Vue component compilation utility
├── content/
│   └── examples/index.ts           # Learning content and examples
├── assets/
│   └── css/playground.css          # Custom playground styles
├── nuxt.config.ts                  # Nuxt configuration
└── package.json                    # Dependencies and scripts
```

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

1. **Open the Application**: Navigate to `http://localhost:3000` after starting the dev server

2. **Select a Learning Topic**: Choose from Components, Props, Auto-imports, or Routing

3. **Load an Example**: Click on any example card to load it into the editor

4. **Edit Code**: Modify the template, script, or style in the code editor

5. **See Live Changes**: Watch the preview update in real-time as you type

6. **Learn from Hints**: Review the hints and explanations provided for each concept

7. **Track Progress**: Monitor your completed examples and time spent

## Learning Content Examples

### Components Module
- **Basic Component**: Creating your first Vue component with template and data
- **Component Props**: Passing data from parent to child components
- **Component Events**: Child-to-parent communication using events

### Props Module
- **Prop Validation**: Validating props to ensure correct data types

### Auto-imports Module
- **Vue Composables**: Using ref(), computed(), and watch() with auto-imports
- **Nuxt Composables**: Using useFetch(), useRoute(), and other Nuxt utilities

### Routing Module
- **Dynamic Routes**: Creating routes with parameters
- **Nested Routes**: File-based routing with layouts and child components

## Technical Implementation

### Component Compiler
The `ComponentCompiler` utility safely compiles Vue Single File Components from string templates:
- Template validation and syntax checking
- Script parsing for Composition API and Options API
- Error handling with detailed messages
- Safe component creation without eval()

### Code Editor State Management
The `useCodeEditor` composable manages:
- Reactive state for template, script, and style
- Debounced compilation for performance
- LocalStorage persistence
- Error and warning handling
- Example loading and management

### Live Preview System
The `LivePreview` component provides:
- Real-time component compilation
- Error boundary implementation
- Console output capture
- Component lifecycle management
- Fullscreen preview mode

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [Nuxt.js](https://nuxt.com/)
- Powered by [Vue.js](https://vuejs.org/)
- Styled with Tailwind CSS (via @nuxt/ui)
- Icons from Heroicons

## Future Enhancements

- [ ] More advanced code editor with Monaco integration
- [ ] Additional learning modules (middleware, plugins, etc.)
- [ ] Social features (sharing examples, community content)
- [ ] Integration with external APIs
- [ ] Advanced debugging tools
- [ ] Performance profiling
- [ ] Accessibility improvements
- [ ] Internationalization support

## Troubleshooting

### Common Issues

**Dependencies won't install:**
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install --legacy-peer-deps
```

**Development server won't start:**
- Ensure Node.js version 18+ is installed
- Check all dependencies are installed
- Verify no port conflicts on 3000

**Code editor not working:**
- Check browser console for errors
- Ensure JavaScript is enabled
- Try refreshing the page

**Preview not updating:**
- Check for syntax errors in the code
- Look at the console output for compilation errors
- Try clicking the refresh button in the preview panel

### Support

For support and questions:
- Open an issue on GitHub
- Check the [Nuxt.js documentation](https://nuxt.com/docs)
- Review the [Vue.js documentation](https://vuejs.org/guide)