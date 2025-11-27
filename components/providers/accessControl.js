export const Role = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  FIELD_WORKER: "field_worker",
  CLIENT: "client",
  TECHNICIAN: "technician", // Technicians use mobile app only
};

// Define allowed path prefixes per role
// Note: Technicians should use the mobile app, not the web version
export const accessMatrix = {
  [Role.SUPER_ADMIN]: ["/"], // wildcard via special handling
  [Role.MANAGER]: ["/projects", "/teams", "/reports"],
  [Role.FIELD_WORKER]: ["/projects"],
  [Role.CLIENT]: ["/reports"],
  [Role.TECHNICIAN]: [], // Technicians use mobile app - no web access
};

export function isAllowed(role, path) {
  if (!role) return false;
  if (role === Role.SUPER_ADMIN) return true; // full access
  
  // Technicians should use mobile app - deny all web access
  if (role === Role.TECHNICIAN) return false;
  
  const allowed = accessMatrix[role] || [];
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}
