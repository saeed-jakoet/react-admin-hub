import { mockUsers } from "../mock-data";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllUsers() {
  await delay(250);
  // TODO: Replace with real API call: fetch("/api/users")
  return mockUsers;
}

export async function getUserById(id) {
  await delay(150);
  return mockUsers.find((u) => u.id === id) || null;
}

export async function createUser(data) {
  await delay(350);
  // TODO: POST /api/users
  const newUser = {
    id: `u${Date.now()}`,
    email: data.email || "",
    name: data.name || "",
    role: data.role || "field-worker",
    lastActive: new Date(),
    createdAt: new Date(),
  };
  mockUsers.push(newUser);
  return newUser;
}

export async function updateUser(id, data) {
  await delay(350);
  // TODO: PATCH /api/users/:id
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found");
  mockUsers[index] = { ...mockUsers[index], ...data };
  return mockUsers[index];
}

export async function deleteUser(id) {
  await delay(300);
  // TODO: DELETE /api/users/:id
  const index = mockUsers.findIndex((u) => u.id === id);
  if (index > -1) mockUsers.splice(index, 1);
}
