import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ALLOWED_EMAIL_DOMAINS,
  AUTH_EMAIL_DOMAIN_HINT,
  getAuthEmailValidationError,
  normalizeAuthEmail,
} from '../src/lib/authEmailPolicy.js'

test('acepta los dominios configurados y normaliza mayúsculas y espacios exteriores', () => {
  for (const domain of ALLOWED_EMAIL_DOMAINS) {
    assert.equal(getAuthEmailValidationError(`persona+prueba@${domain}`), '')
    assert.equal(getAuthEmailValidationError(`  Persona@${domain.toUpperCase()}  `), '')
    assert.ok(AUTH_EMAIL_DOMAIN_HINT.includes(`@${domain}`))
  }
  assert.equal(normalizeAuthEmail(' Persona@GMAIL.COM '), 'persona@gmail.com')
})

test('rechaza dominios ajenos, subdominios e imitaciones del dominio permitido', () => {
  for (const email of [
    'persona@notallowed.example',
    'persona@gmail.com.evil.example',
    'persona@fakegmail.com',
    'persona@mail.scrd.gov.co',
    'persona@idrd.gov.co.evil.example',
  ]) {
    assert.match(getAuthEmailValidationError(email), /dominio de correo no está permitido/)
  }
})

test('rechaza correos vacíos o mal formados antes de comprobar su dominio', () => {
  for (const value of ['', '  ', null, undefined]) {
    assert.match(getAuthEmailValidationError(value), /Ingresa tu correo/)
  }
  for (const email of ['persona', '@gmail.com', 'persona@@gmail.com', 'per sona@gmail.com', 'persona@gmail']) {
    assert.match(getAuthEmailValidationError(email), /correo electrónico válido/)
  }
})
