/**
 * Type definitions for the application domain models
 * These serve as documentation for the data structures used throughout the app
 */

// Project statuses: "planned" | "in-progress" | "blocked" | "completed"
// Fault statuses: "open" | "in-progress" | "resolved"
// User roles: "admin" | "manager" | "field-worker" | "client"
// Staff types: "employee" | "contractor"
// Work order types: "trenching" | "installation" | "maintenance" | "inspection"

/**
 * Region
 * @typedef {Object} Region
 * @property {string} id
 * @property {string} name
 * @property {string} code
 */

/**
 * User
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role - "admin" | "manager" | "field-worker" | "client"
 * @property {string} [avatarUrl]
 * @property {Date} lastActive
 * @property {Date} createdAt
 */

/**
 * StaffMember
 * @typedef {Object} StaffMember
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} type - "employee" | "contractor"
 * @property {string} role
 * @property {string[]} certifications
 * @property {string[]} skills
 * @property {string} regionId
 * @property {Region} [region]
 * @property {boolean} available
 * @property {string[]} currentAssignments
 * @property {string} [avatarUrl]
 */

/**
 * Team
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string} leadId
 * @property {StaffMember} [lead]
 * @property {string[]} memberIds
 * @property {StaffMember[]} [members]
 * @property {string} regionId
 * @property {Region} [region]
 * @property {string} availability - "available" | "assigned" | "unavailable"
 */

/**
 * Client
 * @typedef {Object} Client
 * @property {string} id
 * @property {string} name
 * @property {string} type - "residential" | "commercial" | "government"
 * @property {string} contactName
 * @property {string} contactEmail
 * @property {string} contactPhone
 * @property {string} address
 * @property {number} [slaHours]
 * @property {Project[]} [projects]
 * @property {Date} createdAt
 */

/**
 * Project
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} clientId
 * @property {Client} [client]
 * @property {string} type
 * @property {string} status
 * @property {string} address
 * @property {{lat: number, lng: number}} [coordinates]
 * @property {number} budget
 * @property {Date} startDate
 * @property {Date} deadline
 * @property {string[]} assignedTeamIds
 * @property {Team[]} [assignedTeams]
 * @property {number} progress
 * @property {string} notes
 * @property {Document[]} attachments
 * @property {MaterialUsage[]} materials
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * Fault
 * @typedef {Object} Fault
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} status
 * @property {string} priority - "low" | "medium" | "high" | "critical"
 * @property {string} reportedBy
 * @property {Date} reportedAt
 * @property {string} [assignedTeamId]
 * @property {Team} [assignedTeam]
 * @property {Date} [slaDeadline]
 * @property {string} [resolutionNotes]
 * @property {Date} [resolvedAt]
 * @property {string} location
 * @property {{lat: number, lng: number}} [coordinates]
 */

/**
 * Document
 * @typedef {Object} Document
 * @property {string} id
 * @property {string} title
 * @property {string} type
 * @property {string} fileUrl
 * @property {string} uploadedBy
 * @property {Date} uploadedAt
 * @property {string} [projectId]
 * @property {string} [faultId]
 * @property {string[]} tags
 * @property {number} size
 */

/**
 * MaterialUsage
 * @typedef {Object} MaterialUsage
 * @property {string} id
 * @property {string} projectId
 * @property {string} materialName
 * @property {number} quantity
 * @property {string} unit
 * @property {number} cost
 * @property {Date} date
 */

export {};
