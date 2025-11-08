<script setup>
const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Contact", path: "/contact" },
];
</script>

<template>
  <NuxtLink
    v-for="(link, index) in navLinks"
    :key="index"
    :to="link.path"
    class="hover:text-accent transition"
  >
    {{ link.name }}
  </NuxtLink>
</template>
