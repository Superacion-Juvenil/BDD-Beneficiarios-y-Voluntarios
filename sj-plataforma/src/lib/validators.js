export function validateEmail(email) {
  if (!email) return null; // email is optional in some contexts
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : 'Correo electrónico inválido';
}

export function validatePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return 'El teléfono debe tener 10 dígitos';
  return null;
}

export function validateCP(cp) {
  if (!cp) return null;
  if (!/^\d{5}$/.test(cp)) return 'El C.P. debe tener 5 dígitos';
  return null;
}

export function validateRequired(value, label) {
  if (!value || String(value).trim() === '') return `${label} es requerido`;
  return null;
}

export function validatePassword(password) {
  if (!password || password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}
