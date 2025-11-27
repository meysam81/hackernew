<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ArrowLeft, Calendar, Award, ExternalLink } from "lucide-vue-next";
import type { HNUser, HNStory } from "@/lib/hn-client";
import { getUser, getStory, getUserUrl } from "@/lib/hn-client";
import { timeAgo, formatDateShort, sanitizeHtml } from "@/lib/utils";
import Skeleton from "../ui/Skeleton.vue";
import StoryItem from "../story/StoryItem.vue";

interface Props {
  username: string;
}

const props = defineProps<Props>();

const user = ref<HNUser | null>(null);
const submissions = ref<HNStory[]>([]);
const loading = ref(true);
const loadingSubmissions = ref(false);
const error = ref<string | null>(null);
const activeTab = ref<"submissions" | "about">("submissions");

const basePath = import.meta.env.BASE_URL || "/";

// Get actual username from URL if placeholder
const actualUsername = computed(() => {
  if (props.username === "placeholder" && typeof window !== "undefined") {
    const pathParts = window.location.pathname.split("/");
    const userIndex = pathParts.indexOf("user") + 1;
    return pathParts[userIndex] || null;
  }
  return props.username;
});

const accountAge = computed(() => {
  if (!user.value) {
    return "";
  }
  return formatDateShort(user.value.created);
});

const aboutHtml = computed(() => {
  if (!user.value?.about) {
    return "";
  }
  return sanitizeHtml(user.value.about);
});

const hnProfileUrl = computed(() => {
  return actualUsername.value ? getUserUrl(actualUsername.value) : "";
});

const fetchUser = async () => {
  const name = actualUsername.value;
  if (!name) {
    error.value = "Invalid username";
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    const data = await getUser(name);
    if (!data) {
      throw new Error("User not found");
    }

    user.value = data;

    // Fetch some submissions
    if (data.submitted && data.submitted.length > 0) {
      loadingSubmissions.value = true;
      const submissionIds = data.submitted.slice(0, 15);
      const stories = await Promise.all(
        submissionIds.map((id) => getStory(id)),
      );
      submissions.value = stories
        .filter(
          (s): s is HNStory =>
            s !== null && s.type === "story" && !s.deleted && !s.dead,
        )
        .slice(0, 10);
      loadingSubmissions.value = false;
    }
  } catch (err) {
    error.value = "Failed to load user profile.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <div class="user-profile">
    <a :href="basePath" class="back-link">
      <ArrowLeft :size="16" />
      Back to stories
    </a>

    <!-- Loading -->
    <div v-if="loading" class="profile-loading">
      <div class="profile-header-skeleton">
        <Skeleton width="150px" height="32px" />
        <div class="stats-skeleton">
          <Skeleton width="80px" height="20px" />
          <Skeleton width="100px" height="20px" />
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="profile-error">
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchUser">Try again</button>
    </div>

    <!-- Profile content -->
    <div v-else-if="user" class="profile-content">
      <header class="profile-header">
        <h1 class="profile-username">{{ user.id }}</h1>

        <div class="profile-stats">
          <div class="stat">
            <Award :size="16" />
            <span class="stat-value">{{ user.karma.toLocaleString() }}</span>
            <span class="stat-label">karma</span>
          </div>
          <div class="stat">
            <Calendar :size="16" />
            <span class="stat-label">Joined {{ accountAge }}</span>
          </div>
        </div>

        <a
          :href="hnProfileUrl"
          class="hn-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink :size="14" />
          View on Hacker News
        </a>
      </header>

      <!-- Tabs -->
      <div class="profile-tabs">
        <button
          :class="['tab', { active: activeTab === 'submissions' }]"
          @click="activeTab = 'submissions'"
        >
          Submissions
        </button>
        <button
          v-if="user.about"
          :class="['tab', { active: activeTab === 'about' }]"
          @click="activeTab = 'about'"
        >
          About
        </button>
      </div>

      <!-- Tab content -->
      <div class="tab-content">
        <!-- Submissions -->
        <div v-if="activeTab === 'submissions'" class="submissions">
          <div v-if="loadingSubmissions" class="submissions-loading">
            <Skeleton v-for="i in 5" :key="i" width="100%" height="60px" />
          </div>
          <div v-else-if="submissions.length === 0" class="submissions-empty">
            <p>No public submissions yet.</p>
          </div>
          <div v-else class="submissions-list">
            <StoryItem
              v-for="(story, index) in submissions"
              :key="story.id"
              :story="story"
              :rank="index + 1"
              :show-upvote="false"
            />
          </div>
        </div>

        <!-- About -->
        <div v-if="activeTab === 'about' && user.about" class="about-content">
          <div class="about-text" v-html="aboutHtml"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  max-width: 100%;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--accent);
}

.profile-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.profile-header-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.stats-skeleton {
  display: flex;
  gap: var(--spacing-4);
}

.profile-error {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--text-secondary);
}

.retry-btn {
  margin-top: var(--spacing-4);
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--accent);
  background: none;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.profile-header {
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-6);
  border-bottom: 1px solid var(--border-default);
}

.profile-username {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-3);
  font-family: var(--font-mono);
}

.profile-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-3);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
}

.hn-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  font-size: var(--text-sm);
  color: var(--accent);
  text-decoration: none;
}

.hn-link:hover {
  text-decoration: underline;
}

.profile-tabs {
  display: flex;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--border-subtle);
}

.tab {
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: -1px;
}

.tab:hover {
  color: var(--text-primary);
}

.tab.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.submissions-loading {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.submissions-empty {
  padding: var(--spacing-8);
  text-align: center;
  color: var(--text-secondary);
}

.about-content {
  padding: var(--spacing-4);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.about-text {
  font-size: var(--text-base);
  line-height: 1.7;
  color: var(--text-primary);
}

.about-text :deep(a) {
  color: var(--accent);
}

.about-text :deep(p) {
  margin: 0 0 var(--spacing-3);
}

.about-text :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
