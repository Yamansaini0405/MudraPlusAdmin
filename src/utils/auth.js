export const isTokenValid = (token) => {
  if (!token) return false
  
  try {
    // Decode JWT to check expiration
    const parts = token.split(".")
    if (parts.length !== 3) return false
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    // Check if token is expired
    if (payload.exp && payload.exp < now) {
      localStorage.removeItem("token")
      return false
    }
    
    return true
  } catch (error) {
    console.error("Token validation error:", error)
    localStorage.removeItem("token")
    return false
  }
}
