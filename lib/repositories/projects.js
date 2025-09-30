import { mockProjects, mockClients, mockTeams } from "../mock-data";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllProjects() {
  await delay(300); // Simulate network latency
  // TODO: Replace with real API call: fetch("/api/projects")
  return mockProjects.map((p) => ({
    ...p,
    client: mockClients.find((c) => c.id === p.clientId),
    assignedTeams: mockTeams.filter((t) => p.assignedTeamIds.includes(t.id)),
  }));
}

export async function getProjectById(id) {
  await delay(200);
  const project = mockProjects.find((p) => p.id === id);
  if (!project) return null;
  return {
    ...project,
    client: mockClients.find((c) => c.id === project.clientId),
    assignedTeams: mockTeams.filter((t) => project.assignedTeamIds.includes(t.id)),
  };
}

export async function createProject(data) {
  await delay(400);
  // TODO: POST /api/projects
  const newProject = {
    id: `p${Date.now()}`,
    title: data.title || "Untitled Project",
    clientId: data.clientId || "",
    type: data.type || "installation",
    status: data.status || "planned",
    address: data.address || "",
    budget: data.budget || 0,
    startDate: data.startDate || new Date(),
    deadline: data.deadline || new Date(),
    assignedTeamIds: data.assignedTeamIds || [],
    progress: 0,
    notes: data.notes || "",
    attachments: [],
    materials: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockProjects.push(newProject);
  return newProject;
}

export async function updateProject(id, data) {
  await delay(400);
  // TODO: PATCH /api/projects/:id
  const index = mockProjects.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Project not found");
  mockProjects[index] = { ...mockProjects[index], ...data, updatedAt: new Date() };
  return mockProjects[index];
}

export async function deleteProject(id) {
  await delay(300);
  // TODO: DELETE /api/projects/:id
  const index = mockProjects.findIndex((p) => p.id === id);
  if (index > -1) mockProjects.splice(index, 1);
}
