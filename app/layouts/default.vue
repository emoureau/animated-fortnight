<template>
  <div class="h-dvh flex flex-col bg-default text-default">
    <ShellAppBar />
    <!-- Focusable so the scroll area can be scrolled from the keyboard even when it holds no links (axe: scrollable-region-focusable) -->
    <main tabindex="0" aria-label="Content" class="flex-1 min-h-0 overflow-auto focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
      <slot />
    </main>
    <SearchOmniSearch />
  </div>
</template>
