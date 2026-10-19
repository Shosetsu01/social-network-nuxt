import { validateEmail, validatePassword } from '#shared/utils/validation'
import { useSessionStore } from '@entities/session'
import { ApiError } from '@shared/api'

type LoginField = 'email' | 'password'

/** ApiError status when no HTTP response arrived (offline, DNS failure, abort). */
const NETWORK_ERROR_STATUS = 0
const SERVER_ERROR_MIN_STATUS = 500

// Every text starts with "Login failed"; raw server text is shown only for 4xx, where it is meant for the user.
function loginErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return 'Login failed: something went wrong.'
  if (error.statusCode === NETWORK_ERROR_STATUS) return 'Login failed: please check your connection and try again.'
  if (error.statusCode >= SERVER_ERROR_MIN_STATUS) return 'Login failed: the server is unavailable, please try again later.'
  return `Login failed: ${error.message}`
}

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
      submitError.value = loginErrorMessage(error)
      // Anything but an ApiError is a bug: after telling the user, pass it on to Nuxt's error handling.
      if (!(error instanceof ApiError)) throw error
      return false
    }
  }

  return { email, password, remember, errors, firstInvalidField, isPending, submitError, touch, submit }
}
