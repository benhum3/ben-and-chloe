export type Step = "welcome" | "lookup" | "response" | "details" | "thanks";

export type Guest = {
  id: string;
  household_id: string;
  full_name: string;
  attending: boolean | null;
  dietary_requirements: string | null;
  created_at?: string;
  updated_at?: string;
};

export type Household = {
  id: string;
  invitation_name: string;
  song_request: string | null;
  message: string | null;
  submitted_at: string | null;
};

export type LookupResponse = {
  household: Household;
  guests: Guest[];
};

export type GuestAnswer = {
  id: string;
  fullName: string;
  attending: boolean | null;
  dietaryRequirements: string;
};
