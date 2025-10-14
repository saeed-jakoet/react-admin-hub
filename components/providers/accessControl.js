export const Role = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  FIELD_WORKER: "field_worker",
  CLIENT: "client",
  TECHNICIAN: "technician",
};

// Define allowed path prefixes per role
export const accessMatrix = {
  [Role.SUPER_ADMIN]: ["/"], // wildcard via special handling
  [Role.MANAGER]: ["/projects", "/teams", "/reports"],
  [Role.FIELD_WORKER]: ["/projects"],
  [Role.CLIENT]: ["/reports"],
  [Role.TECHNICIAN]: ["/technician", "/settings"], // technicians can only access their dashboard and profile
};

export function isAllowed(role, path) {
  if (!role) return false;
  if (role === Role.SUPER_ADMIN) return true; // full access
  
  // Allow technicians to access root path temporarily (will be redirected)
  if (role === Role.TECHNICIAN && path === "/") return true;
  
  const allowed = accessMatrix[role] || [];
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}
