export const generateUsername = (teamName) =>
  teamName.toLowerCase().replace(/[^a-z0-9]/g, "_");
