// Debug script - paste this in browser console to check current user state

console.log("=== AUTH DEBUG ===");

// 1. Check what AuthContext has
setTimeout(() => {
  const authState = document.querySelector("[data-auth-debug]");
  console.log("User from React context:", authState?.textContent);
}, 1000);

// 2. Check session endpoint
fetch("/api/auth/session", { credentials: "include" })
  .then((r) => r.json())
  .then((data) => {
    console.log("Session endpoint response:", data);
    console.log("User role:", data.user?.role);
    console.log("Has role field?", "role" in (data.user || {}));
  });

// 3. Check raw cookie token
const cookies = document.cookie.split(";").reduce((acc, cookie) => {
  const [key, value] = cookie.trim().split("=");
  acc[key] = value;
  return acc;
}, {});

if (cookies.auth_token) {
  try {
    const decoded = JSON.parse(atob(cookies.auth_token));
    console.log("Decoded token:", decoded);
    console.log("Token has role?", "role" in decoded);
    console.log("Token role value:", decoded.role);
  } catch (e) {
    console.error("Could not decode token:", e);
  }
} else {
  console.log("No auth_token cookie found");
}

console.log("=== END DEBUG ===");
