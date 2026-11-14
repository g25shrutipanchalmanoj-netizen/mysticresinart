/** Builds the WhatsApp message for a custom order request. */
export interface CustomOrderFields {
  name: string;
  phone: string;
  type: string;
  reference: string;
  text: string;
  colours: string;
  budget: string;
  date: string;
  details: string;
}

export function buildCustomOrderMessage(f: CustomOrderFields): string {
  const lines = ["Hello Mystic Resin Art, I'd like a custom order.", ""];
  const add = (label: string, v: string | undefined) => {
    if (v && v.trim()) lines.push(`${label}: ${v.trim()}`);
  };
  add("Name", f.name);
  add("Phone", f.phone);
  add("Product type", f.type);
  add("Based on product", f.reference);
  add("Name / initials / text", f.text);
  add("Colours / theme", f.colours);
  add("Budget", f.budget);
  add("Needed by", f.date);
  add("Details", f.details);
  return lines.join("\n");
}
