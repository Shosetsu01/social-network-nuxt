import { validateEmail, validatePassword } from '#shared/utils/validation'
import { useSessionStore } from '@entities/session'
import { ApiError } from '@shared/api'

type LoginField = 'email' | 'password'

export function useLoginForm() {
  const session = useSessionStore()

  // The password lives only in this local ref: never in a store, cookie or URL.
  const email = ref('')
  const password = ref('')
  const remember = ref(false)
  const touched = ref<Record<LoginField, boolean>>({ email: false, password: false })
  const isPending = ref(false)
  const submitError = ref<string | null>(null)

  const fieldErrors = computed<Record<LoginField, string | null>>(() => ({
    email: validateEmail(email.value),
    password: validatePassword(password.value),
  }))
  // A field shows its error only after blur or a submit attempt, not on every keystroke before that.
  const errors = computed<Record<LoginField, string | null>>(() => ({
    email: touched.value.email ? fieldErrors.value.email : null,
    password: touched.value.password ? fieldErrors.value.password : null,
  }))
  const firstInvalidField = computed<LoginField | null>(() => {
    if (fieldErrors.value.email) return 'email'
    if (fieldErrors.value.password) return 'password'
    return null
  })

  function touch(field: LoginField): void {
    touched.value = { ...touched.value, [field]: true }
  }

  /** Resolves to `true` once the session is created. */
  async function submit(): Promise<boolean> {
    // Guards Enter presses and repeated clicks while the request is in flight.
    if (isPending.value) return false
    touched.value = { email: true, password: true }
    submitError.value = null
    if (firstInvalidField.value) return false

    isPending.value = true
    try {
      await session.login({ email: email.value, password: password.value, remember: remember.value })
      // Stays pending on success: the page navigates away, and re-enabling the button would allow a second login meanwhile.
      return true
    }
    catch (error) {
      isPending.value = false
      if (!(error instanceof ApiError)) throw error
      submitError.value = `Login failed: ${error.message}`
      return false
    }
  }

  return { email, password, remember, errors, firstInvalidField, isPending, submitError, touch, submit }
}
