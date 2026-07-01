export function getCurrentMember() {
  if (typeof window === "undefined") return null;

  const memberString = localStorage.getItem("member");

  if (!memberString) return null;

  try {
    return JSON.parse(memberString);
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return getCurrentMember() !== null;
}

export function isSuperAdmin() {
  const member = getCurrentMember();

  return member?.isSuperAdmin === true;
}

export function isAdmin() {
  const member = getCurrentMember();

  if (!member) return false;

  if (member.isSuperAdmin) return true;

  const adminRoles = [
    "President",
    "Secretary",
    "Treasurer",
  ];

  return adminRoles.includes(
    member.currentLionsRole
  );
}