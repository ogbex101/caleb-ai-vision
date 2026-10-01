import { describe, it, expect } from "vitest";
import { cleanEmail, whatsappDigits, whatsappDisplay, whatsappLink } from "@/lib/contact";

describe("cleanEmail", () => {
  it("keeps a real address and trims it", () => {
    expect(cleanEmail("  hello@studio.com ")).toBe("hello@studio.com");
  });

  it("hides empty or half-typed values instead of showing them", () => {
    expect(cleanEmail("")).toBeNull();
    expect(cleanEmail(null)).toBeNull();
    expect(cleanEmail("hello@studio")).toBeNull();
    expect(cleanEmail("not an email")).toBeNull();
  });
});

describe("whatsapp", () => {
  it("builds a wa.me link from an international number in any spacing", () => {
    expect(whatsappLink("+234 807 866 0415")).toBe("https://wa.me/2348078660415");
    expect(whatsappLink("00234-807-866-0415")).toBe("https://wa.me/2348078660415");
  });

  it("refuses a local number with no country code, since wa.me cannot open it", () => {
    expect(whatsappDigits("08078660415")).toBeNull();
    expect(whatsappLink("0807 866 0415")).toBeNull();
  });

  it("rejects values too short or too long to be a phone number", () => {
    expect(whatsappLink("+123")).toBeNull();
    expect(whatsappLink("+1234567890123456")).toBeNull();
  });

  it("always shows the number with a plus sign", () => {
    expect(whatsappDisplay("2348078660415")).toBe("+2348078660415");
    expect(whatsappDisplay("+234 807 866 0415")).toBe("+234 807 866 0415");
    expect(whatsappDisplay("08078660415")).toBeNull();
  });
});
