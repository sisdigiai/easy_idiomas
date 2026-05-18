export type Role = 'admin' | 'coordinator' | 'teacher' | 'student';

export const RolePermissions = {
  admin: {
    canManageAllUsers: true,
    canManageAllClasses: true,
    canManageAllLessons: true,
    canManageAllAttendance: true,
    canManageAllActivities: true,
    canManageAllMaterials: true,
    canViewAllReports: true,
    canConfigureAI: true,
    canApproveLessons: true,
  },
  coordinator: {
    canManageAllUsers: false,
    canManageStudents: true,
    canManageTeachers: true,
    canManageAllClasses: true,
    canCreateLessons: true,
    canApproveLessons: true,
    canUseAIAssistant: true,
    canViewReports: true,
    canManageMaterialsAndActivities: true,
  },
  teacher: {
    canViewAssignedClassesOnly: true,
    canCreateDraftLessonsForAssigned: true,
    canUseAIAssistantForAssigned: true,
    canEditOwnLessonsBeforeCompletion: true,
    canStartAttendanceForOwn: true,
    canAddActivitiesToOwn: true,
    canAddMaterialsToOwn: true,
    canViewAssignedStudents: true,
  },
  student: {
    canViewOwnClasses: true,
    canViewOwnLessons: true,
    canViewOwnActivities: true,
    canViewOwnMaterials: true,
    canViewOwnProgress: true,
    canCheckInWithQRCode: true,
  }
};

export const canUser = (role: Role, action: string): boolean => {
  const permissions = RolePermissions[role];
  if (!permissions) return false;
  return permissions[action as keyof typeof permissions] === true;
};
