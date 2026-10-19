<script setup lang="ts">
import { AppButton, AppIcon } from '@shared/ui'
import { useLoginForm } from '../model/useLoginForm'

const emit = defineEmits<{ success: [] }>()

const { email, password, remember, errors, firstInvalidField, isPending, submitError, touch, submit } = useLoginForm()

const emailInput = useTemplateRef<HTMLInputElement>('emailInput')
const passwordInput = useTemplateRef<HTMLInputElement>('passwordInput')
const emailId = useId()
const passwordId = useId()
const isPasswordVisible = ref(false)

async function onSubmit(): Promise<void> {
  if (await submit()) {
    emit('success')
    return
  }
  if (!firstInvalidField.value) return
  // Wait for aria-invalid and aria-describedby, so the error is announced together with the focused field.
  await nextTick()
  const input = firstInvalidField.value === 'email' ? emailInput.value : passwordInput.value
  input?.focus()
}
</script>

<template>
  <!-- novalidate: the original's messages replace the browser's own validation bubbles. -->
  <form
    class="login-form"
    novalidate
    @submit.prevent="onSubmit"
  >
    <div class="login-form__field">
      <label
        class="login-form__label"
        :for="emailId"
      >Email address</label>
      <input
        :id="emailId"
        ref="emailInput"
        v-model="email"
        class="login-form__input"
        type="email"
        autocomplete="email"
        :aria-invalid="errors.email ? 'true' : undefined"
        :aria-describedby="errors.email ? `${emailId}-error` : undefined"
        @blur="touch('email')"
      >
      <p
        v-if="errors.email"
        :id="`${emailId}-error`"
        class="login-form__error"
      >
        {{ errors.email }}
      </p>
    </div>

    <div class="login-form__field">
      <label
        class="login-form__label"
        :for="passwordId"
      >Password</label>
      <div class="login-form__password">
        <input
          :id="passwordId"
          ref="passwordInput"
          v-model="password"
          class="login-form__input login-form__input--password"
          :type="isPasswordVisible ? 'text' : 'password'"
          autocomplete="current-password"
          :aria-invalid="errors.password ? 'true' : undefined"
          :aria-describedby="errors.password ? `${passwordId}-error` : undefined"
          @blur="touch('password')"
        >
        <button
          type="button"
          class="login-form__toggle"
          aria-label="Show password"
          :aria-pressed="isPasswordVisible"
          @click="isPasswordVisible = !isPasswordVisible"
        >
          <AppIcon :name="isPasswordVisible ? 'eye-off' : 'eye'" />
        </button>
      </div>
      <p
        v-if="errors.password"
        :id="`${passwordId}-error`"
        class="login-form__error"
      >
        {{ errors.password }}
      </p>
    </div>

    <label class="login-form__remember">
      <input
        v-model="remember"
        class="login-form__checkbox"
        type="checkbox"
      >
      Remember me
    </label>

    <p
      v-if="submitError"
      class="login-form__alert"
      role="alert"
    >
      {{ submitError }}
    </p>

    <AppButton
      class="login-form__submit"
      type="submit"
      :is-loading="isPending"
    >
      Login
    </AppButton>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.login-form__field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.login-form__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.login-form__input {
  width: 100%;
  min-height: var(--tap-size);
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.login-form__input[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.login-form__password {
  position: relative;
}

.login-form__input--password {
  padding-inline-end: calc(var(--tap-size) + var(--space-1));
}

.login-form__toggle {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--tap-size);
  min-height: var(--tap-size);
  padding: 0;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.login-form__toggle:hover {
  color: var(--color-text);
}

.login-form__error {
  font-size: var(--font-size-sm);
  color: var(--color-danger);
}

.login-form__remember {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: var(--space-2);
  min-height: var(--tap-size);
  cursor: pointer;
}

.login-form__checkbox {
  width: 1.25rem;
  height: 1.25rem;
  margin: 0;
  accent-color: var(--color-brand-strong);
}

.login-form__alert {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.login-form__submit {
  width: 100%;
}
</style>
