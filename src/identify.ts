import { prisma } from "./db.js";
import { LinkPrecedence } from "@prisma/client";

export type IdentifyInput = { email?: string | null; phoneNumber?: string | null; };

export type IdentifyResponse = {
  contact: {
    primaryContatctId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
};

function buildResponse(contacts: any[]): IdentifyResponse {
  const primary = contacts[0]; // sorted by createdAt asc
  const emails: string[] = [];
  const phones: string[] = [];
  const secondaries: number[] = [];

  const push = (arr: string[], v: string | null) => { if (v && !arr.includes(v)) arr.push(v); };

  push(emails, primary.email);
  push(phones, primary.phoneNumber);

  for (const c of contacts) {
    if (c.id === primary.id) continue;
    push(emails, c.email);
    push(phones, c.phoneNumber);
    secondaries.push(c.id);
  }

  return { contact: { primaryContatctId: primary.id, emails, phoneNumbers: phones, secondaryContactIds: secondaries } };
}

export async function identify(payload: IdentifyInput): Promise<IdentifyResponse> {
  const email = payload.email ?? null;
  const phone = payload.phoneNumber ?? null;

  // find matching contacts
  const found = await prisma.contact.findMany({
    where: {
      OR: [
        email ? { email } : undefined,
        phone ? { phoneNumber: phone } : undefined
      ].filter(Boolean) as any
    },
    orderBy: { createdAt: "asc" }
  });

  if (found.length === 0) {
    const created = await prisma.contact.create({ data: { email, phoneNumber: phone, linkPrecedence: "primary" } });
    return buildResponse([created]);
  }

  const primary = found[0];
  // if incoming data introduces new info, create secondary
  const knownEmails = new Set(found.map(f => f.email).filter(Boolean));
  const knownPhones = new Set(found.map(f => f.phoneNumber).filter(Boolean));

  if ((email && !knownEmails.has(email)) || (phone && !knownPhones.has(phone))) {
    const newC = await prisma.contact.create({ data: { email, phoneNumber: phone, linkPrecedence: "secondary", linkedId: primary.id } });
    found.push(newC);
  }

  return buildResponse(found);
}
