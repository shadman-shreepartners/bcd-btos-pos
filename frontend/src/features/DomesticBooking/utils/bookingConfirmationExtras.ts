import type { DomesticData } from "../domesticBookingTypes";
import { isTravelArrangerApplicant } from "./contactFromFormValues";

export type BookingConfirmationExtras = {
  approverRemarks?: string;
  deliveryMethod?: string;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryRemarks?: string;
  additionalEmails?: ReadonlyArray<{ name: string; email: string }>;
};

/**
 * Human-readable block merged into the first JR `remarks`, or into `bookingRemarks` when confirmation
 * was not merged into any JR segment (e.g. offline hotel/car only).
 */
export function formatBookingConfirmationNotes(
  bookingData: DomesticData,
  extras?: BookingConfirmationExtras,
): string {
  const blocks: string[] = [];

  if (isTravelArrangerApplicant(bookingData.applicant)) {
    const name = bookingData.applicant_name?.trim();
    const email = bookingData.applicant_email?.trim();
    const phone = bookingData.contact_no?.trim();
    if (name || email || phone) {
      blocks.push(
        [
          "[Travel arranger contact]",
          name && `Name: ${name}`,
          email && `Email: ${email}`,
          phone && `Phone: ${phone}`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }
  }

  if (extras) {
    const {
      approverRemarks,
      deliveryMethod,
      deliveryDate,
      deliveryTime,
      deliveryRemarks,
      additionalEmails,
    } = extras;

    if (approverRemarks?.trim()) {
      blocks.push(`[Approver remarks]\n${approverRemarks.trim()}`);
    }

    const deliveryParts = [
      deliveryMethod?.trim() && `Method: ${deliveryMethod.trim()}`,
      deliveryDate?.trim() && `Date: ${deliveryDate.trim()}`,
      deliveryTime?.trim() && `Time: ${deliveryTime.trim()}`,
      deliveryRemarks?.trim() && `Instructions: ${deliveryRemarks.trim()}`,
    ].filter(Boolean);
    if (deliveryParts.length > 0) {
      blocks.push(`[Delivery / documents]\n${deliveryParts.join("\n")}`);
    }

    if (additionalEmails?.length) {
      const list = additionalEmails
        .map((row) => {
          const n = row.name?.trim();
          const e = row.email?.trim();
          if (n && e) return `- ${n} <${e}>`;
          if (e) return `- ${e}`;
          if (n) return `- ${n}`;
          return null;
        })
        .filter((line): line is string => Boolean(line));
      if (list.length > 0) {
        blocks.push(`[CC / additional recipients]\n${list.join("\n")}`);
      }
    }
  }

  return blocks.join("\n\n---\n");
}

export function mergeJrRemarksWithConfirmation(
  jrUserRemarks: string | undefined,
  confirmationBlock: string,
): string | undefined {
  const user = jrUserRemarks?.trim() ?? "";
  const extra = confirmationBlock.trim();
  if (user && extra) return `${user}\n\n---\n${extra}`;
  if (user) return user;
  if (extra) return extra;
  return undefined;
}
