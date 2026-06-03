export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email address is required.';
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password.trim()) return 'Password is required.';
  if (password.trim().length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

export function validateFullName(fullName: string): string | null {
  if (!fullName.trim()) return 'Full name is required.';
  if (fullName.trim().length < 3) return 'Please enter a valid name.';
  return null;
}
