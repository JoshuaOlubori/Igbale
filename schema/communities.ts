import { z } from "zod";

export const CommunitiesSchema = z.object({
    name: z.string().min(1, "Required"),
    location: z.string().max(255, "Required"),
    description: z.string().optional(),
    point_location: z.object({
        lat: z.number(),
        lng: z.number(),
    }),
    radius: z.number().default(0),
});
