import type { User } from '#shared/types/user'

/** All users, shared across components through the fetch key. */
export function useUsers() {
  const { data } = useFetch<User[]>('/api/users', { key: 'users', default: () => [] })
  const byId = computed(() => new Map(data.value.map(u => [u.id, u])))
  const currentUser = computed(() => data.value.find(u => u.isCurrentUser))
  return { users: data, byId, currentUser }
}
