import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DEFAULT_APP_SETTINGS,
  normalizeAppSettings,
  serializeAppSettings,
} from '../src/features/settings/model.ts'

test('settings normalization clamps reminder days and fills defaults', () => {
  const settings = normalizeAppSettings({
    reminderDays: 99,
    profileName: '  Fresh user  ',
  })

  assert.equal(settings.reminderDays, 30)
  assert.equal(settings.profileName, 'Fresh user')
  assert.equal(settings.notificationsEnabled, DEFAULT_APP_SETTINGS.notificationsEnabled)
})

test('settings serialization round trips valid values', () => {
  const settings = normalizeAppSettings({
    reminderDays: 5,
    notificationsEnabled: false,
    dailyDigestEnabled: true,
    themeMode: 'dark',
    profileName: 'Alex',
  })

  const serialized = serializeAppSettings(settings)
  const parsed = normalizeAppSettings(JSON.parse(serialized))

  assert.deepEqual(parsed, settings)
})
