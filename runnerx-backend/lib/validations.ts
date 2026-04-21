import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Event Validations ──────────────────────────────────────────────────────

export const RACE_TYPES = ["3KM", "5KM", "10KM", "HALF_MARATHON", "VIRTUAL"] as const;
export const EVENT_STATUSES = ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"] as const;

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  siteFor: z.string().min(1, "Site is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  registrationStart: z.string().min(1, "Registration start is required"),
  registrationEnd: z.string().min(1, "Registration end is required"),
  venue: z.string().min(1, "Venue is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  mapUrl: z.string().url("Invalid URL").optional().nullable(),
  bannerImage: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable(),
  contactPhone: z.string().max(20).optional().nullable(),
  status: z.enum(EVENT_STATUSES).default("DRAFT"),
  isActive: z.boolean().optional().default(true),
});

export const updateEventSchema = createEventSchema.partial();

export const createEventCategorySchema = z.object({
  raceType: z.enum(RACE_TYPES, { message: "Invalid race type" }),
  distance: z.number().min(0, "Distance must be non-negative"),
  price: z.number().min(0, "Price must be non-negative"),
  discountPrice: z.number().min(0).optional().nullable(),
  startTime: z.string().min(1, "Start time is required"),
  maxParticipants: z.number().int().positive().optional().nullable(),
  ageMin: z.number().int().min(0).optional().nullable(),
  ageMax: z.number().int().min(0).optional().nullable(),
  isActive: z.boolean().optional().default(true),
  categoryId: z.coerce.number().optional().nullable(), // Link to template Category
  virtualSettings: z.any().optional().nullable(),
});

export const updateEventCategorySchema = createEventCategorySchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateEventCategoryInput = z.infer<typeof createEventCategorySchema>;
export type UpdateEventCategoryInput = z.infer<typeof updateEventCategorySchema>;

// ─── Registration Validations ───────────────────────────────────────────────

export const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "REFUNDED"] as const;
export const PAYMENT_STATUSES = ["UNPAID", "PAID", "FAILED", "REFUNDED"] as const;

const participantSchema = z.object({
  eventCategoryId: z.coerce.number().int().positive("Category is required"),
  fullName: z.string().min(1, "Full name is required").max(200),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required").max(20),
  gender: z.string().min(1, "Gender is required"),
  dob: z.string().min(1, "Date of birth is required"),
  pinCode: z.string().optional().default(""),
  country: z.string().optional().default("India"),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
  address: z.string().optional().default(""),
  isRegistrant: z.boolean().optional().default(false),
  virtualSubCategoryId: z.coerce.number().optional().nullable(),
  tshirtSize: z.string().optional().nullable(),
});

export const createRegistrationSchema = z.object({
  eventId: z.coerce.number().int().positive("Event is required"),
  participants: z.array(participantSchema).min(1, "At least one participant is required"),
  couponCode: z.string().optional().nullable(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Coupon code is required"),
  siteFor: z.string().min(1, "Site is required"),
  amount: z.number().min(0, "Amount must be non-negative"),
});

export type ParticipantInput = z.infer<typeof participantSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

// ─── Sponsor Validations ────────────────────────────────────────────────────

export const createSponsorSchema = z.object({
  siteFor: z.string().min(1, "Site is required"),
  title: z.string().max(200).optional().nullable(),
  image: z.string().min(1, "Image is required"),
});

export const updateSponsorSchema = createSponsorSchema.partial();

export type CreateSponsorInput = z.infer<typeof createSponsorSchema>;
export type UpdateSponsorInput = z.infer<typeof updateSponsorSchema>;

// ─── Page Content Validations ───────────────────────────────────────────────

export const CONTENT_TYPES = ["TEXT", "IMAGE", "HTML", "JSON", "LINK"] as const;

export const upsertPageContentSchema = z.object({
  siteFor: z.string().min(1, "Site is required"),
  page: z.string().min(1, "Page is required").max(50),
  section: z.string().min(1, "Section is required").max(100),
  key: z.string().min(1, "Key is required").max(100),
  value: z.string(),
  type: z.enum(CONTENT_TYPES).default("TEXT"),
  sortOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const bulkUpsertPageContentSchema = z.object({
  items: z.array(upsertPageContentSchema).min(1, "At least one item is required"),
});

export type UpsertPageContentInput = z.infer<typeof upsertPageContentSchema>;
export type BulkUpsertPageContentInput = z.infer<typeof bulkUpsertPageContentSchema>;
