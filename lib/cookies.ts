export function setCookie(name: string, value: string, maxAgeSeconds = 31536000) {
  document.cookie = `${name}=${value};path=/;max-age=${maxAgeSeconds};samesite=lax`;
}
