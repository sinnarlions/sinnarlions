

export type UserData = {
  isSuperAdmin?: boolean | string; // 'string' प्रकारातील लीक रोखण्यासाठी सुरक्षितता
  currentLionsRole?: string;
};

// --------------------
// Roles (Safe Conversion using String check)
// --------------------

export const isSuperAdmin = (user: UserData) => {
  if (!user) return false;
  return user.isSuperAdmin === true || String(user.isSuperAdmin).toLowerCase() === "true";
};

export const isPresident = (user: UserData) =>
  user?.currentLionsRole === "President";

export const isSecretary = (user: UserData) =>
  user?.currentLionsRole === "Secretary";

export const isTreasurer = (user: UserData) =>
  user?.currentLionsRole === "Treasurer";

// --------------------
// Dashboard Access
// --------------------

export const canAccessAdmin = (user: UserData) => {
 
  
  const adminCheck = isSuperAdmin(user);
  

  const result =
    adminCheck ||
    user?.currentLionsRole === "President" ||
    user?.currentLionsRole === "Secretary" ||
    user?.currentLionsRole === "Treasurer";

 
  return result;
};

// --------------------
// Announcement Permissions
// --------------------

export const canPublishAnnouncement = (user: UserData) =>
  isSuperAdmin(user) || isPresident(user) || isSecretary(user);

export const canEditAnnouncement = (user: UserData) =>
  isSuperAdmin(user) || isPresident(user) || isSecretary(user);

export const canDeleteAnnouncement = (user: UserData) =>
  isSuperAdmin(user) || isPresident(user);

// --------------------
// Member Permissions
// --------------------

export const canManageMembers = (user: UserData) => isSuperAdmin(user);
export const canImportMembers = (user: UserData) => isSuperAdmin(user);
export const canDeleteMembers = (user: UserData) => isSuperAdmin(user);