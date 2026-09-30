import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ENTIDADES,
  POST_TYPE_KEYS,
  POST_VISIBILITY_KEYS,
  PROFILE_GENDER_VALUES,
  PROFILE_ROLE_KEYS,
  getPostVisibilityLabel,
  getProfileRoleLabel,
  normalizePostVisibility,
  normalizeProfileRole,
} from '../src/constants/catalogs/index.js'

test('los catálogos conservan las keys persistidas', () => {
  assert.equal(POST_TYPE_KEYS.NEWS, 'noticia')
  assert.equal(POST_VISIBILITY_KEYS.PUBLIC, 'Público')
  assert.equal(PROFILE_ROLE_KEYS.ADMIN, 'admin')
  assert.ok(PROFILE_GENDER_VALUES.includes('Prefiero no decirlo'))
  assert.ok(ENTIDADES.some(({ key, sigla }) => key === 'scrd' && sigla === 'SCRD'))
})

test('los valores anteriores se muestran con la etiqueta canónica', () => {
  assert.equal(normalizePostVisibility(' Publico '), POST_VISIBILITY_KEYS.PUBLIC)
  assert.equal(getPostVisibilityLabel('público'), 'Público')
  assert.equal(normalizeProfileRole('Administradora'), PROFILE_ROLE_KEYS.ADMIN)
  assert.equal(getProfileRoleLabel('admin'), 'Administrador')
  assert.equal(normalizeProfileRole('rol-desconocido'), '')
})
