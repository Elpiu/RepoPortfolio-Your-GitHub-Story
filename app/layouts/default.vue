<template>
  <div class="flex min-h-screen flex-col">
    <SkipLink />
    <AppHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
