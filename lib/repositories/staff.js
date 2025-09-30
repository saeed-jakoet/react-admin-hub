import { mockStaff, mockRegions } from "../mock-data";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAllStaff() {
  await delay(250);
  // TODO: Replace with real API call: fetch("/api/staff")
  return mockStaff.map((s) => ({
    ...s,
    region: mockRegions.find((r) => r.id === s.regionId),
  }));
}

export async function getStaffById(id) {
  await delay(150);
  const staff = mockStaff.find((s) => s.id === id);
  if (!staff) return null;
  return {
    ...staff,
    region: mockRegions.find((r) => r.id === staff.regionId),
  };
}

export async function createStaff(data) {
  await delay(350);
  // TODO: POST /api/staff
  const newStaff = {
    id: `s${Date.now()}`,
    name: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    type: data.type || "employee",
    role: data.role || "",
    certifications: data.certifications || [],
    skills: data.skills || [],
    regionId: data.regionId || "",
    available: true,
    currentAssignments: [],
  };
  mockStaff.push(newStaff);
  return newStaff;
}

export async function updateStaff(id, data) {
  await delay(350);
  // TODO: PATCH /api/staff/:id
  const index = mockStaff.findIndex((s) => s.id === id);
  if (index === -1) throw new Error("Staff member not found");
  mockStaff[index] = { ...mockStaff[index], ...data };
  return mockStaff[index];
}

export async function deleteStaff(id) {
  await delay(300);
  // TODO: DELETE /api/staff/:id
  const index = mockStaff.findIndex((s) => s.id === id);
  if (index > -1) mockStaff.splice(index, 1);
}
