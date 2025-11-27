<script setup lang="ts">
import { useTheme } from "@/composables/useTheme";
import { useDensity } from "@/composables/useDensity";
import { useAuth } from "@/composables/useAuth";
import { Sun, Moon, Rows3, Rows4, User, LogOut } from "lucide-vue-next";

const { resolvedTheme, toggleTheme } = useTheme();
const { density, toggleDensity } = useDensity();
const { user, loading, signOut, isConfigured } = useAuth();

const basePath = import.meta.env.BASE_URL || "/";

const handleSignOut = async () => {
  await signOut();
  window.location.href = basePath;
};
</script>

<template>
  <div class="header-actions">
    <!-- Density Toggle -->
    <button
      class="icon-btn"
      :title="
        density === 'comfortable'
          ? 'Switch to compact view'
          : 'Switch to comfortable view'
      "
      @click="toggleDensity"
    >
      <Rows3 v-if="density === 'comfortable'" :size="18" />
      <Rows4 v-else :size="18" />
    </button>

    <!-- Theme Toggle -->
    <button
      class="icon-btn"
      :title="
        resolvedTheme === 'light'
          ? 'Switch to dark mode'
          : 'Switch to light mode'
      "
      @click="toggleTheme"
    >
      <Moon v-if="resolvedTheme === 'light'" :size="18" />
      <Sun v-else :size="18" />
    </button>

    <!-- Auth -->
    <template v-if="isConfigured">
      <template v-if="loading">
        <div class="skeleton-avatar"></div>
      </template>
      <template v-else-if="user">
        <div class="user-menu">
          <a
            :href="`${basePath}user/${user.user_metadata?.user_name || user.id}`"
            class="icon-btn"
          >
            <User :size="18" />
          </a>
          <button class="icon-btn" title="Sign out" @click="handleSignOut">
            <LogOut :size="18" />
          </button>
        </div>
      </template>
      <template v-else>
        <a :href="`${basePath}auth/signin`" class="auth-btn"> Sign in </a>
      </template>
    </template>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background-color var(--transition-fast);
  text-decoration: none;
}

.icon-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--bg-primary);
  background-color: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.auth-btn:hover {
  background-color: var(--accent-hover);
}

.skeleton-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background-color: var(--bg-tertiary);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
