export type DataColor = 'person-1' | 'person-2' | 'person-3' | 'person-4'

export interface User {
  id: string
  name: string
  initials: string
  isCurrentUser?: boolean
  dataColor: DataColor
}

export interface Project {
  id: string
  name: string
  shortCode: string
  description: string
  memberIds: string[]
  updatedAt: string
}
