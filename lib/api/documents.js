import { get, post } from "./fetcher";

const allowedJobTypes = new Set([
  "drop_cable",
  "floating",
  "civils",
  "link_build",
  "access_build",
  "root_build",
  "maintenance",
  "relocations",
]);

/**
 * Upload a document to the server (multipart/form-data)
 * Required fields mirror backend schema requirements.
 */
export async function uploadDocument({
  clientName,
  clientIdentifier,
  jobType,
  category, // one of: 'as-built' | 'planning' | 'happy_letter'
  clientId,
  // Prefer dropCableJobId for drop_cable; jobId kept for back-compat
  dropCableJobId,
  jobId,
  // Required for drop_cable, optional/ignored for other types
  circuitNumber,
  file,
}) {
  if (!file) throw new Error("File is required");
  if (!allowedJobTypes.has(jobType)) {
    throw new Error(`Invalid jobType: ${jobType}`);
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("clientName", String(clientName ?? ""));
  fd.append("clientIdentifier", String(clientIdentifier ?? ""));
  fd.append("jobType", jobType);
  fd.append("category", category);
  fd.append("clientId", String(clientId));

  if (dropCableJobId) fd.append("dropCableJobId", String(dropCableJobId));
  if (jobId) fd.append("jobId", String(jobId));
  if (circuitNumber) fd.append("circuitNumber", String(circuitNumber));

  return post("/documents/upload", fd);
}

export async function listDocumentsForJob(jobType, jobId) {
  if (!allowedJobTypes.has(jobType)) {
    throw new Error(`Invalid jobType: ${jobType}`);
  }
  return get(`/documents/job/${jobType}/${jobId}`);
}

export async function getSignedUrl(documentId, expires = 3600) {
  return get(`/documents/signed-url?id=${documentId}&expires=${expires}`);
}
