const GUEST_STORAGE_KEY = "interviewiq_guest_user";

const createGuestUser = () => ({
  id: "guest",
  name: "Guest User",
  email: null,
  credits: 0,
  isGuest: true,
});

export const getGuestUser = () => {
  try {
    const savedGuest = JSON.parse(
      localStorage.getItem(GUEST_STORAGE_KEY) || "null",
    );

    return savedGuest?.isGuest ? savedGuest : null;
  } catch {
    return null;
  }
};

export const startGuestSession = () => {
  const guestUser = createGuestUser();

  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestUser));
  } catch {
    // The Redux state still lets the current tab use guest mode.
  }

  return guestUser;
};

export const clearGuestSession = () => {
  try {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  } catch {
    // Ignore storage errors while signing out.
  }
};
