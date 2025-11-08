<template>
  <div class="home-page">
    <!-- Learning Playground -->
    <LearningPlayground />
  </div>
</template>

<script setup lang="ts">

// Page metadata
useHead({
  title: 'Nuxt.js Learning Playground',
  meta: [
    {
      name: 'description',
      content: 'Interactive coding environment for learning Nuxt.js with live examples and real-time preview'
    },
    {
      name: 'keywords',
      content: 'Nuxt.js, Vue.js, learning, interactive, coding playground, tutorial, examples'
    },
    {
      name: 'author',
      content: 'Nuxt Learning Playground'
    },
    {
      property: 'og:title',
      content: 'Nuxt.js Learning Playground'
    },
    {
      property: 'og:description',
      content: 'Interactive coding environment for learning Nuxt.js with live examples'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'Nuxt.js Learning Playground'
    },
    {
      name: 'twitter:description',
      content: 'Interactive coding environment for learning Nuxt.js'
    }
  ]
})

// Page-specific SEO
useSeoMeta({
  title: 'Nuxt.js Learning Playground - Interactive Coding Environment',
  description: 'Learn Nuxt.js through interactive coding examples with real-time preview. Master components, props, auto-imports, and routing.',
  keywords: 'Nuxt.js, Vue.js, interactive learning, coding playground, web development',
  author: 'Nuxt Learning Team',
  ogTitle: 'Nuxt.js Learning Playground',
  ogDescription: 'Interactive coding environment for learning Nuxt.js with live examples and real-time preview',
  ogImage: '/og-image.jpg', // Add this image to public folder if needed
  ogUrl: 'https://nuxt-learning-playground.example.com',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterTitle: 'Nuxt.js Learning Playground',
  twitterDescription: 'Learn Nuxt.js interactively with live code examples and real-time preview'
})
</script>

<style scoped>
.home-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>