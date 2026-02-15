<script setup lang="ts">
import { ref, onMounted } from "vue";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const status = ref<"loading" | "success" | "error">("loading");
const errorMessage = ref("");

const basePath = import.meta.env.BASE_URL || "/";

onMounted(async () => {
  if (!isSupabaseConfigured()) {
    status.value = "error";
    errorMessage.value = "Authentication is not configured.";
    return;
  }

  try {
    // Handle the OAuth callback
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    if (data.session) {
      status.value = "success";

      // Check if we need to create a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.session.user.id)
        .single();

      if (!profile) {
        // Create profile for new user
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.session.user.id,
          username:
            data.session.user.user_metadata?.user_name ||
            data.session.user.email?.split("@")[0] ||
            null,
        });
      }

      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = basePath;
      }, 1500);
    } else {
      // No session, redirect to sign in
      window.location.href = `${basePath}auth/signin`;
    }
  } catch (err) {
    status.value = "error";
    errorMessage.value =
      err instanceof Error ? err.message : "An error occurred during sign in.";
  }
});
</script>

<template>
  <div class="auth-callback">
    <div class="callback-card">
      <!-- Loading -->
      <div v-if="status === 'loading'" class="callback-loading">
        <div class="spinner"></div>
        <p>Signing you in...</p>
      </div>

      <!-- Success -->
      <div v-else-if="status === 'success'" class="callback-success">
        <div class="success-icon">✓</div>
        <p>Successfully signed in!</p>
        <p class="redirect-text">Redirecting...</p>
      </div>

      <!-- Error -->
      <div v-else class="callback-error">
        <div class="error-icon">!</div>
        <p>Sign in failed</p>
        <p class="error-message">{{ errorMessage }}</p>
        <a :href="`${basePath}auth/signin`" class="retry-link"> Try again </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.callback-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-8);
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  text-align: center;
  min-width: 280px;
}

.callback-loading,
.callback-success,
.callback-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-default);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #22c55e;
  background-color: rgba(34, 197, 94, 0.1);
  border-radius: 50%;
}

.error-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: #ef4444;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
}

p {
  margin: 0;
  color: var(--text-primary);
}

.redirect-text {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.error-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  max-width: 250px;
}

.retry-link {
  margin-top: var(--spacing-2);
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.retry-link:hover {
  text-decoration: underline;
}
</style>
