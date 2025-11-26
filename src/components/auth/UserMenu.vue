<script setup lang="ts">
import { ref, computed } from 'vue';
import { User, Bookmark, LogOut, ChevronDown } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import { useBookmarks } from '@/composables/useBookmarks';

const { user, profile, signOut } = useAuth();
const { bookmarkCount } = useBookmarks();

const isOpen = ref(false);
const basePath = import.meta.env.BASE_URL || '/';

const displayName = computed(() => {
  return profile.value?.username ||
         user.value?.user_metadata?.user_name ||
         user.value?.email?.split('@')[0] ||
         'User';
});

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

const closeMenu = () => {
  isOpen.value = false;
};

const handleSignOut = async () => {
  closeMenu();
  await signOut();
  window.location.href = basePath;
};
</script>

<template>
  <div class="user-menu" v-if="user" @blur="closeMenu">
    <button class="menu-trigger" @click="toggleMenu">
      <span class="user-avatar">
        <User :size="16" />
      </span>
      <span class="user-name">{{ displayName }}</span>
      <ChevronDown :size="14" :class="{ 'rotated': isOpen }" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="menu-dropdown">
        <a :href="`${basePath}user/${displayName}`" class="menu-item" @click="closeMenu">
          <User :size="16" />
          Profile
        </a>
        <a :href="`${basePath}bookmarks`" class="menu-item" @click="closeMenu">
          <Bookmark :size="16" />
          Bookmarks
          <span v-if="bookmarkCount > 0" class="badge">{{ bookmarkCount }}</span>
        </a>
        <div class="menu-divider"></div>
        <button class="menu-item menu-item-danger" @click="handleSignOut">
          <LogOut :size="16" />
          Sign out
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-menu {
  position: relative;
}

.menu-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-2);
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.menu-trigger:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-default);
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--bg-tertiary);
  border-radius: 50%;
  color: var(--text-secondary);
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 500;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.menu-trigger svg:last-child {
  color: var(--text-tertiary);
  transition: transform var(--transition-fast);
}

.rotated {
  transform: rotate(180deg);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 180px;
  padding: var(--spacing-1);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 50;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.menu-item:hover {
  background-color: var(--bg-tertiary);
}

.menu-item-danger {
  color: #ef4444;
}

.menu-item-danger:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.menu-divider {
  height: 1px;
  margin: var(--spacing-1) 0;
  background-color: var(--border-subtle);
}

.badge {
  margin-left: auto;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--bg-primary);
  background-color: var(--accent);
  border-radius: 10px;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 640px) {
  .user-name {
    display: none;
  }
}
</style>
