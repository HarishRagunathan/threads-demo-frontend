export const can = (u, p) => u.role === "admin" || u.permissions.includes(p);
