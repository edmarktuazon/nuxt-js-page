import type { LearningExample } from '~/composables/useCodeEditor'

export const learningExamples: Record<string, LearningExample[]> = {
  components: [
    {
      id: 'basic-component',
      title: 'Basic Component',
      description: 'Create your first Vue component with template and data',
      template: `<div class="card">
  <h2>{{ title }}</h2>
  <p>{{ message }}</p>
  <button @click="count++">Clicked {{ count }} times</button>
</div>`,
      script: `const title = ref('Hello Nuxt!')
const message = ref('This is your first Vue component')
const count = ref(0)`,
      style: `.card {
  padding: 20px;
  border: 2px solid #42b883;
  border-radius: 8px;
  background: #f0f9ff;
}
.card h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}
.card button {
  background: #42b883;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.card button:hover {
  background: #369870;
}`,
      hints: [
        'Use ref() to create reactive variables',
        'Templates use {{ }} for interpolation',
        '@click handles user interactions',
        'Components are reusable building blocks'
      ],
      explanation: 'Vue components are the building blocks of Vue applications. They combine template, logic, and styling in a single file. The template uses HTML-like syntax with Vue directives like @click for event handling.'
    },
    {
      id: 'component-props',
      title: 'Component Props',
      description: 'Pass data from parent to child components using props',
      template: `<div class="user-card">
  <img :src="avatar" :alt="name" />
  <h3>{{ name }}</h3>
  <p>{{ role }}</p>
  <span :class="statusClass">{{ status }}</span>
</div>`,
      script: `const props = defineProps({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'Developer'
  },
  avatar: {
    type: String,
    default: 'https://picsum.photos/seed/avatar1/100/100.jpg'
  },
  status: {
    type: String,
    default: 'active'
  }
})

const statusClass = computed(() => {
  return \`status-\${props.status.toLowerCase()}\`
})`,
      style: `.user-card {
  text-align: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-width: 200px;
}
.user-card img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}
.status-active { color: #22c55e; }
.status-away { color: #f59e0b; }
.status-offline { color: #6b7280; }`,
      hints: [
        'defineProps() declares component props',
        'Props are used for parent-to-child communication',
        'Computed properties create derived state',
        ':bind is shorthand for v-bind'
      ],
      explanation: 'Props allow parent components to pass data down to child components. They make components reusable and configurable. Use defineProps() to declare what props a component accepts.'
    },
    {
      id: 'component-events',
      title: 'Component Events',
      description: 'Child components can communicate with parents using events',
      template: `<div class="counter">
  <h3>Counter: {{ count }}</h3>
  <div class="buttons">
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="reset" class="reset">Reset</button>
  </div>
  <p v-if="count > 10" class="warning">
    Count is getting high!
  </p>
</div>`,
      script: `const props = defineProps({
  initialValue: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['count-changed'])

const count = ref(props.initialValue)

const increment = () => {
  count.value++
  emit('count-changed', count.value)
}

const decrement = () => {
  count.value--
  emit('count-changed', count.value)
}

const reset = () => {
  count.value = 0
  emit('count-changed', count.value)
}`,
      style: `.counter {
  padding: 20px;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  text-align: center;
}
.buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 15px 0;
}
.buttons button {
  padding: 10px 20px;
  font-size: 18px;
  border: 1px solid #3b82f6;
  background: #3b82f6;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}
.buttons button:hover {
  background: #2563eb;
}
.reset {
  background: #ef4444 !important;
  border-color: #ef4444 !important;
}
.reset:hover {
  background: #dc2626 !important;
}
.warning {
  color: #f59e0b;
  font-weight: bold;
}`,
      hints: [
        'defineEmits() declares events a component can emit',
        'emit() sends events to parent components',
        'Events enable child-to-parent communication',
        'v-if conditionally renders elements'
      ],
      explanation: 'Events allow child components to communicate with their parents. Use defineEmits() to declare what events a component can emit, and emit() to trigger those events with data.'
    }
  ],

  props: [
    {
      id: 'prop-validation',
      title: 'Prop Validation',
      description: 'Validate props to ensure components receive correct data',
      template: `<div class="profile">
  <h2>{{ user.name }}</h2>
  <p>Age: {{ user.age }}</p>
  <p>Status: {{ user.isActive ? 'Active' : 'Inactive' }}</p>
  <div class="tags">
    <span v-for="tag in user.tags" :key="tag" class="tag">
      {{ tag }}
    </span>
  </div>
</div>`,
      script: `const props = defineProps({
  user: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.name &&
             typeof value.name === 'string' &&
             typeof value.age === 'number' &&
             value.age >= 0
    }
  },
  showTags: {
    type: Boolean,
    default: true
  }
})`,
      style: `.profile {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.tags {
  margin-top: 15px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  background: #e5e7eb;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
}`,
      hints: [
        'Use object prop type for complex data',
        'Validator functions provide custom validation',
        'Required props must be provided',
        'Default props provide fallback values'
      ],
      explanation: 'Prop validation ensures components receive the correct type and format of data. Vue provides built-in validators and allows custom validation functions.'
    }
  ],

  autoimports: [
    {
      id: 'vue-composables',
      title: 'Vue Composables',
      description: 'Use Vue 3 Composition API with auto-imported functions',
      template: `<div class="todo-app">
  <h2>Todo List</h2>
  <form @submit.prevent="addTodo">
    <input v-model="newTodo" placeholder="Add a new todo" />
    <button type="submit">Add</button>
  </form>

  <ul class="todo-list">
    <li v-for="todo in filteredTodos" :key="todo.id"
        :class="{ completed: todo.completed }">
      <input type="checkbox" v-model="todo.completed" />
      <span>{{ todo.text }}</span>
      <button @click="removeTodo(todo.id)">×</button>
    </li>
  </ul>

  <div class="filters">
    <button v-for="filter in filters"
            :key="filter"
            @click="activeFilter = filter"
            :class="{ active: activeFilter === filter }">
      {{ filter }}
    </button>
  </div>

  <p>Completed: {{ completedCount }} / {{ todos.length }}</p>
</div>`,
      script: `const newTodo = ref('')
const activeFilter = ref('all')
const filters = ['all', 'active', 'completed']

const todos = ref([
  { id: 1, text: 'Learn Vue', completed: true },
  { id: 2, text: 'Build Nuxt app', completed: false },
  { id: 3, text: 'Master Composition API', completed: false }
])

let nextId = 4

const filteredTodos = computed(() => {
  switch (activeFilter.value) {
    case 'active':
      return todos.value.filter(todo => !todo.completed)
    case 'completed':
      return todos.value.filter(todo => todo.completed)
    default:
      return todos.value
  }
})

const completedCount = computed(() => {
  return todos.value.filter(todo => todo.completed).length
})

const addTodo = () => {
  const text = newTodo.value.trim()
  if (text) {
    todos.value.push({
      id: nextId++,
      text,
      completed: false
    })
    newTodo.value = ''
  }
}

const removeTodo = (id) => {
  const index = todos.value.findIndex(todo => todo.id === id)
  if (index > -1) {
    todos.value.splice(index, 1)
  }
}

// Watch for changes
watch(todos, (newTodos) => {
  console.log('Todos updated:', newTodos)
}, { deep: true })`,
      style: `.todo-app {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}
form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
button {
  padding: 8px 16px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.todo-list {
  list-style: none;
  padding: 0;
}
.todo-list li {
  display: flex;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #eee;
}
.todo-list li.completed span {
  text-decoration: line-through;
  color: #666;
}
.filters {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}
.filters button.active {
  background: #2563eb;
}`,
      hints: [
        'ref() creates reactive references',
        'computed() creates derived values',
        'watch() reacts to state changes',
        'Nuxt auto-imports Vue functions'
      ],
      explanation: 'Vue 3 Composition API provides functions like ref(), computed(), and watch() for reactive programming. Nuxt automatically imports these functions, so you don\'t need manual imports.'
    },
    {
      id: 'nuxt-composables',
      title: 'Nuxt Composables',
      description: 'Use Nuxt-specific composables for enhanced functionality',
      template: `<div class="async-demo">
  <h2>Nuxt Composables Demo</h2>

  <div v-if="pending" class="loading">
    Loading user data...
  </div>

  <div v-else-if="error" class="error">
    Error: {{ error }}
  </div>

  <div v-else-if="data" class="user-info">
    <h3>{{ data.name }}</h3>
    <p>Email: {{ data.email }}</p>
    <p>Current Route: {{ route.path }}</p>
    <button @click="refresh()">Refresh Data</button>
  </div>

  <div class="navigation">
    <button @click="navigateTo('/about')">Go to About</button>
    <button @click="navigateTo('/contact')">Go to Contact</button>
  </div>
</div>`,
      script: `// Simulate API call
const { data, pending, error, refresh } = await useFetch('/api/user', {
  default: () => ({
    name: 'John Doe',
    email: 'john@example.com'
  })
})

const route = useRoute()
const router = useRouter()

// Navigation composable
const navigateTo = (path: string) => {
  router.push(path)
}

// Page metadata
useHead({
  title: 'Nuxt Composables Demo',
  meta: [
    { name: 'description', content: 'Learn Nuxt composables' }
  ]
})

// Console logging
onMounted(() => {
  console.log('Component mounted')
  console.log('Current route:', route.path)
})`,
      style: `.async-demo {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}
.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}
.loading {
  color: #3b82f6;
}
.error {
  color: #ef4444;
}
.user-info {
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}
.navigation {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.navigation button {
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}`,
      hints: [
        'useFetch() handles data fetching',
        'useRoute() accesses current route',
        'useRouter() enables navigation',
        'useHead() manages page metadata'
      ],
      explanation: 'Nuxt provides specialized composables like useFetch(), useRoute(), useRouter(), and useHead() that integrate with Nuxt features. These are auto-imported and enhance development experience.'
    }
  ],

  routing: [
    {
      id: 'dynamic-routes',
      title: 'Dynamic Routes',
      description: 'Create dynamic routes with parameters in Nuxt',
      template: `<div class="blog-post">
  <div v-if="pending" class="loading">Loading post...</div>

  <div v-else-if="error" class="error">
    Error loading post: {{ error }}
  </div>

  <article v-else-if="post" class="post">
    <h1>{{ post.title }}</h1>
    <div class="meta">
      <span>By {{ post.author }}</span>
      <span>{{ formatDate(post.date) }}</span>
    </div>
    <div class="content">
      {{ post.content }}
    </div>

    <div class="navigation">
      <NuxtLink to="/blog">← Back to Blog</NuxtLink>
      <NuxtLink :to="'/blog/' + post.id + '/edit'">Edit Post</NuxtLink>
    </div>
  </article>
</div>`,
      script: `// Get the route parameter
const route = useRoute()
const postId = route.params.id

// Fetch post data based on ID
const { data: post, pending, error } = await useFetch(\`/api/posts/\${postId}\`, {
  default: () => ({
    id: postId,
    title: 'Sample Blog Post',
    author: 'John Doe',
    date: new Date().toISOString(),
    content: 'This is a sample blog post content. In a real application, this would be fetched from an API based on the post ID.'
  })
})

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Set page title dynamically
useHead(() => ({
  title: post.value?.title || 'Blog Post',
  meta: [
    { name: 'description', content: post.value?.title }
  ]
}))`,
      style: `.blog-post {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
.loading, .error {
  text-align: center;
  padding: 40px;
}
.post {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.post h1 {
  color: #1f2937;
  margin-bottom: 10px;
}
.meta {
  display: flex;
  gap: 20px;
  color: #6b7280;
  margin-bottom: 20px;
  font-size: 14px;
}
.content {
  line-height: 1.6;
  color: #374151;
}
.navigation {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
}
.navigation a {
  color: #3b82f6;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
}
.navigation a:hover {
  background: #3b82f6;
  color: white;
}`,
      hints: [
        'route.params.id accesses URL parameters',
        'useFetch() can use dynamic URLs',
        'useHead() sets dynamic page metadata',
        'NuxtLink provides optimized navigation'
      ],
      explanation: 'Dynamic routes in Nuxt use file names with brackets [id].vue. The route parameters are available via useRoute().params. This enables creating pages like /blog/123, /user/profile, etc.'
    },
    {
      id: 'nested-routes',
      title: 'Nested Routes',
      description: 'Create nested routes with layouts and child components',
      template: `<div class="dashboard">
  <nav class="sidebar">
    <h3>Dashboard</h3>
    <ul>
      <li><NuxtLink to="/dashboard">Overview</NuxtLink></li>
      <li><NuxtLink to="/dashboard/profile">Profile</NuxtLink></li>
      <li><NuxtLink to="/dashboard/settings">Settings</NuxtLink></li>
    </ul>
  </nav>

  <main class="content">
    <div class="user-header">
      <h2>Welcome, {{ user.name }}!</h2>
      <p>{{ user.email }}</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <h4>Total Posts</h4>
        <p class="number">{{ stats.posts }}</p>
      </div>
      <div class="stat-card">
        <h4>Followers</h4>
        <p class="number">{{ stats.followers }}</p>
      </div>
      <div class="stat-card">
        <h4>Following</h4>
        <p class="number">{{ stats.following }}</p>
      </div>
    </div>

    <NuxtPage />
  </main>
</div>`,
      script: `// Get current user data
const { data: user } = await useFetch('/api/user', {
  default: () => ({
    name: 'Jane Smith',
    email: 'jane@example.com'
  })
})

// Get user statistics
const { data: stats } = await useFetch('/api/user/stats', {
  default: () => ({
    posts: 42,
    followers: 1234,
    following: 567
  })
})

// Access nested route
const route = useRoute()
const isProfilePage = computed(() => route.path.includes('/profile'))
const isSettingsPage = computed(() => route.path.includes('/settings'))`,
      style: `.dashboard {
  display: flex;
  min-height: 100vh;
}
.sidebar {
  width: 250px;
  background: #1f2937;
  color: white;
  padding: 20px;
}
.sidebar h3 {
  margin-bottom: 20px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  margin-bottom: 10px;
}
.sidebar a {
  color: #9ca3af;
  text-decoration: none;
  padding: 8px 12px;
  display: block;
  border-radius: 4px;
}
.sidebar a:hover,
.sidebar a.router-link-active {
  background: #374151;
  color: white;
}
.content {
  flex: 1;
  padding: 30px;
  background: #f9fafb;
}
.user-header {
  margin-bottom: 30px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.stat-card h4 {
  color: #6b7280;
  margin-bottom: 10px;
}
.stat-card .number {
  font-size: 32px;
  font-weight: bold;
  color: #1f2937;
}`,
      hints: [
        'Nested routes use folder structure',
        'NuxtPage renders child route components',
        'Router-link-active class for active states',
        'Layouts provide consistent structure'
      ],
      explanation: 'Nested routes in Nuxt are created using folders. The parent file contains the layout and NuxtPage renders the child route component. This creates complex page structures while maintaining organization.'
    }
  ]
}