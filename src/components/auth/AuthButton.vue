<script setup lang="ts">
import { ref } from "vue";
import { Github } from "lucide-vue-next";
import { useAuth } from "@/composables/useAuth";
import Button from "../ui/Button.vue";

const { signInWithGitHub, signInWithGoogle, isConfigured, loading } = useAuth();

const signingIn = ref(false);
const error = ref<string | null>(null);

const handleGitHubSignIn = async () => {
  signingIn.value = true;
  error.value = null;

  const result = await signInWithGitHub();
  if (result.error) {
    error.value = result.error.message;
    signingIn.value = false;
  }
  // If successful, the page will redirect
};

const handleGoogleSignIn = async () => {
  signingIn.value = true;
  error.value = null;

  const result = await signInWithGoogle();
  if (result.error) {
    error.value = result.error.message;
    signingIn.value = false;
  }
};
</script>

<template>
  <div class="auth-buttons">
    <div v-if="loading" class="auth-loading">Loading...</div>

    <template v-else-if="!isConfigured">
      <div class="auth-notice">
        <p>Authentication is not configured.</p>
        <p class="notice-hint">Add Supabase credentials to enable sign in.</p>
      </div>
    </template>

    <template v-else>
      <Button
        variant="primary"
        size="lg"
        :loading="signingIn"
        @click="handleGitHubSignIn"
        class="auth-btn github-btn"
      >
        <Github :size="20" />
        Sign in with GitHub
      </Button>

      <Button
        variant="secondary"
        size="lg"
        :loading="signingIn"
        @click="handleGoogleSignIn"
        class="auth-btn google-btn"
      >
        <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </Button>

      <p v-if="error" class="auth-error">{{ error }}</p>
    </template>
  </div>
</template>

<style scoped>
.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  width: 100%;
  max-width: 320px;
}

.auth-btn {
  width: 100%;
  justify-content: center;
}

.github-btn {
  background-color: #24292e;
}

.github-btn:hover {
  background-color: #1b1f23;
}

.google-btn {
  background-color: var(--bg-secondary);
}

.google-icon {
  flex-shrink: 0;
}

.auth-loading {
  text-align: center;
  color: var(--text-secondary);
  padding: var(--spacing-4);
}

.auth-notice {
  text-align: center;
  padding: var(--spacing-4);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.auth-notice p {
  margin: 0;
  color: var(--text-secondary);
}

.notice-hint {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-top: var(--spacing-2);
}

.auth-error {
  margin: 0;
  padding: var(--spacing-3);
  font-size: var(--text-sm);
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: var(--radius-sm);
  text-align: center;
}
</style>
