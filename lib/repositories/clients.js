import { mockClients, mockProjects } from "../mock-data";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllClients() {
  await delay(250);
  // TODO: Replace with real API call: fetch("/api/clients")
  return mockClients.map((c) => ({
    ...c,
    projects: mockProjects.filter((p) => p.clientId === c.id),
  }));
}

export async function getClientById(id) {
  await delay(150);
  const client = mockClients.find((c) => c.id === id);
  if (!client) return null;
  return {
    ...client,
    projects: mockProjects.filter((p) => p.clientId === client.id),
  };
}

export async function createClient(data) {
  await delay(350);
  // TODO: POST /api/clients
  const newClient = {
    id: `c${Date.now()}`,
    name: data.name || "",
    type: data.type || "residential",
    contactName: data.contactName || "",
    contactEmail: data.contactEmail || "",
    contactPhone: data.contactPhone || "",
    address: data.address || "",
    slaHours: data.slaHours,
    createdAt: new Date(),
  };
  mockClients.push(newClient);
  return newClient;
}

export async function updateClient(id, data) {
  await delay(350);
  // TODO: PATCH /api/clients/:id
  const index = mockClients.findIndex((c) => c.id === id);
  if (index === -1) throw new Error("Client not found");
  mockClients[index] = { ...mockClients[index], ...data };
  return mockClients[index];
}

export async function deleteClient(id) {
  await delay(300);
  // TODO: DELETE /api/clients/:id
  const index = mockClients.findIndex((c) => c.id === id);
  if (index > -1) mockClients.splice(index, 1);
}
