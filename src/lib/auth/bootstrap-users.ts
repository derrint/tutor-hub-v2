/** Phase 5 bootstrap users — keep in sync with migration `phase5_multi_tutor`. */
export const BOOTSTRAP_TUTOR_1_ID = "tutor_1";
export const BOOTSTRAP_TUTOR_2_ID = "tutor_2";

export const BOOTSTRAP_TUTOR_1_EMAIL = "anasandin87@gmail.com";
export const BOOTSTRAP_TUTOR_2_EMAIL = "rint.cold@gmail.com";
export const BOOTSTRAP_ADMIN_EMAIL = "lorensioderrint@gmail.com";

export const BOOTSTRAP_USER_IDS = {
  tutor1: "user_tutor_1",
  tutor2: "user_tutor_2",
  admin: "user_admin",
} as const;

export const BOOTSTRAP_ALLOWED_EMAILS = [
  BOOTSTRAP_TUTOR_1_EMAIL,
  BOOTSTRAP_TUTOR_2_EMAIL,
  BOOTSTRAP_ADMIN_EMAIL,
] as const;
