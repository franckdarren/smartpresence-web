import { z } from "zod";

export const createDemoRequestSchema = z.object({
  name:           z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  company_name:   z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères").max(100),
  email:          z.string().email("Adresse email invalide"),
  phone:          z.string().max(20).optional(),
  employee_count: z.enum(["<15", "15-50", "50-200", "200+"], {
    error: "Sélectionnez une taille d'équipe",
  }),
});

export type CreateDemoRequestInput = z.infer<typeof createDemoRequestSchema>;
