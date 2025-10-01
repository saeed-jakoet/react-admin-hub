export const Role = {
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  FIELD_WORKER: "field_worker",
  CLIENT: "client",
};

// Define allowed path prefixes per role
export const accessMatrix = {
  [Role.SUPER_ADMIN]: ["/"], // wildcard via special handling
  [Role.MANAGER]: ["/", "/projects", "/teams", "/reports"],
  [Role.FIELD_WORKER]: ["/", "/projects"],
  [Role.CLIENT]: ["/", "/reports"],
};

export function isAllowed(role, path) {
  if (!role) return false;
  if (role === Role.SUPER_ADMIN) return true; // full access
  const allowed = accessMatrix[role] || [];
  return allowed.some((p) => path === p || path.startsWith(p + "/"));
}
