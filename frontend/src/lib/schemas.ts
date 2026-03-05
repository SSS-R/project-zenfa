import { z } from "zod";

export const buildPreferencesSchema = z.object({
    prefer_cpu_brand: z.enum(["Intel", "AMD"]).optional(),
    prefer_gpu_brand: z.enum(["NVIDIA", "AMD", "Intel"]).optional(),
    include_monitor: z.boolean().default(false),
    form_factor: z.enum(["ATX", "mATX", "ITX"]).optional(),
    rgb_priority: z.enum(["high", "medium", "low"]).default("medium"),
    min_storage_gb: z.number().int().optional(),
    prefer_wifi: z.boolean().default(false),
});

export const buildRequestSchema = z.object({
    budget_min: z.number().int().min(10000),
    budget_max: z.number().int().max(1000000),
    purpose: z.enum(["gaming", "editing", "general", "office"]),
    preferences: buildPreferencesSchema.optional(),
});

export type BuildRequest = z.infer<typeof buildRequestSchema>;
export type BuildPreferences = z.infer<typeof buildPreferencesSchema>;
