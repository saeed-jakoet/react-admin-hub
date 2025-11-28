import { get, post, put } from "./fetcher";

/**
 * Inventory Requests API
 * Functions for inventory request approval workflow
 */

/**
 * Get all inventory requests with optional status filter
 * @param {string} [status] - Filter by status: 'pending', 'approved', 'rejected'
 */
export async function getInventoryRequests(status) {
  const params = status ? `?status=${status}` : "";
  return get(`/inventory-requests${params}`);
}

/**
 * Get count of pending inventory requests (for notification badge)
 */
export async function getPendingRequestsCount() {
  return get("/inventory-requests/pending/count");
}

/**
 * Get a single inventory request by ID
 * @param {string} id - Request ID
 */
export async function getInventoryRequest(id) {
  return get(`/inventory-requests/${id}`);
}

/**
 * Approve an inventory request
 * @param {string} id - Request ID
 */
export async function approveInventoryRequest(id) {
  return put(`/inventory-requests/${id}/approve`);
}

/**
 * Reject an inventory request
 * @param {string} id - Request ID
 * @param {string} [reason] - Optional rejection reason
 */
export async function rejectInventoryRequest(id, reason) {
  return put(`/inventory-requests/${id}/reject`, { reason });
}
