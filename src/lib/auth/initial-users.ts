/** Phase 5 initial users — keep in sync with migration `phase5_multi_tutor`. */
export const INITIAL_TUTOR_1_ID = "tutor_1";
export const INITIAL_TUTOR_2_ID = "tutor_2";

export const INITIAL_TUTOR_1_EMAIL = "anasandin87@gmail.com";
/** Second TEACHER user on `tutor_1` (same practice as Anas). */
export const INITIAL_TUTOR_1_NOBARSAMBAS_EMAIL = "nobarsambas@gmail.com";
export const INITIAL_TUTOR_2_EMAIL = "rint.cold@gmail.com";
export const INITIAL_ADMIN_EMAIL = "lorensioderrint@gmail.com";

export const INITIAL_USER_IDS = {
  tutor1: "user_tutor_1",
  tutor1Nobarsambas: "user_tutor_1_nobarsambas",
  tutor2: "user_tutor_2",
  admin: "user_admin",
} as const;

export const INITIAL_ALLOWED_EMAILS = [
  INITIAL_TUTOR_1_EMAIL,
  INITIAL_TUTOR_1_NOBARSAMBAS_EMAIL,
  INITIAL_TUTOR_2_EMAIL,
  INITIAL_ADMIN_EMAIL,
] as const;
