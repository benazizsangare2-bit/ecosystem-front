function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
}

export function setAuthCookies(token: string, role: string) {
  setCookie("auth_token", token)
  setCookie("user_role", role)
}

export function clearAuthCookies() {
  removeCookie("auth_token")
  removeCookie("user_role")
}
