import { Prisma } from "@prisma/client";

const BIB_START: Record<string, number> = {
  "3KM": 3003,
  "5KM": 50301,
  "10KM": 10701,
  HALF_MARATHON: 21501,
  VIRTUAL: 31501,
};

const SERIES_INDEX: Record<string, number> = {
  "3KM": 1,
  "5KM": 2,
  "10KM": 3,
  HALF_MARATHON: 4,
  VIRTUAL: 5,
};

export function getBibSeriesKey(raceType: string): string {
  return raceType === "VIRTUAL" ? "VIRTUAL" : raceType;
}

export async function assignNextBib(
  tx: Prisma.TransactionClient,
  eventId: number,
  raceType: string
): Promise<string> {
  const series = getBibSeriesKey(raceType);
  const start = BIB_START[series];
  const seriesIdx = SERIES_INDEX[series];
  if (start === undefined || seriesIdx === undefined) {
    throw new Error(`No bib series configured for raceType: ${raceType}`);
  }

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${eventId}::int, ${seriesIdx}::int)`;

  const rows = await tx.$queryRaw<Array<{ max_bib: number | null }>>`
    SELECT MAX(CAST(li."bibNumber" AS INTEGER)) AS max_bib
    FROM "RegistrationLineItem" li
    JOIN "Registration" r ON r.id = li."registrationId"
    WHERE r."eventId" = ${eventId}
      AND li."raceTypeSnapshot" = ${series}
      AND li.status <> 'CANCELLED'
      AND li."isCustomBib" = false
      AND li."bibNumber" IS NOT NULL
      AND li."bibNumber" ~ '^[0-9]+$'
  `;

  const max = rows[0]?.max_bib;
  const next = max == null ? start : Number(max) + 1;
  return String(next);
}
