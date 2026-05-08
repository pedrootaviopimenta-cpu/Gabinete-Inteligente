export const userRoles = [
  "senior_admin",
  "admin_operacional",
  "revisor_juridico",
  "servidor_solicitante",
  "usuario_consulta"
] as const;

export type UserRole = (typeof userRoles)[number];

export type PermissionSubject = {
  role: UserRole;
};

export const userRoleLabels: Record<UserRole, string> = {
  senior_admin: "Administrador sênior",
  admin_operacional: "Administrador operacional",
  revisor_juridico: "Revisor jurídico",
  servidor_solicitante: "Servidor solicitante",
  usuario_consulta: "Usuário de consulta"
};

export function isUserRole(value: string): value is UserRole {
  return userRoles.includes(value as UserRole);
}

export function canAccessAdmin(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional", "revisor_juridico"].includes(subject.role);
}

export function canManageRequests(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional"].includes(subject.role);
}

export function canEditFinalDocument(subject: PermissionSubject) {
  return ["senior_admin", "revisor_juridico"].includes(subject.role);
}

export function canViewInternalNotes(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional", "revisor_juridico"].includes(subject.role);
}

export function canManageUsers(subject: PermissionSubject) {
  return subject.role === "senior_admin";
}

export function canViewOwnRequests(subject: PermissionSubject) {
  return userRoles.includes(subject.role);
}

export function canUploadAttachments(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional", "servidor_solicitante"].includes(subject.role);
}

export function canExportDocuments(subject: PermissionSubject) {
  return ["senior_admin", "revisor_juridico"].includes(subject.role);
}

export function canManagePendingItems(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional"].includes(subject.role);
}

export function canSendPublicMessages(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional"].includes(subject.role);
}

export function canCreateRequests(subject: PermissionSubject) {
  return ["senior_admin", "admin_operacional", "servidor_solicitante"].includes(subject.role);
}
