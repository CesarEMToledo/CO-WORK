import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@/lib/generated/prisma/enums";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Crea una notificación para el dueño de una propiedad (nuevo interesado,
 * renta registrada, propiedad publicada, etc.) — la campanita del navbar
 * (components/ui/NotificationsBell.tsx) las lee de aquí.
 *
 * A propósito, quien llama a esta función SIEMPRE debe envolverla en su
 * propio try/catch y solo loguear el error si falla — una notificación es
 * un extra, nunca debe tronar el flujo real que la dispara (publicar,
 * agendar una visita, registrar una renta).
 */
export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      link: input.link ?? null,
    },
  });
}
