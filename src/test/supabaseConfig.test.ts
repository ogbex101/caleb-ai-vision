import { describe, it, expect } from "vitest";
import { classifyKey, describeSupabaseConfig, previewKey, projectRefFrom } from "@/lib/supabaseConfig";

describe("classifyKey", () => {
  it("tells the three key families apart", () => {
    expect(classifyKey("sb_publishable_abc123")).toBe("publishable");
    expect(classifyKey("sb_secret_abc123")).toBe("secret");
    expect(classifyKey("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.abc.def")).toBe("legacy-jwt");
  });

  it("reports nothing and nonsense distinctly", () => {
    expect(classifyKey("")).toBe("missing");
    expect(classifyKey(null)).toBe("missing");
    expect(classifyKey("   ")).toBe("missing");
    expect(classifyKey("undefined")).toBe("unrecognised");
    expect(classifyKey("hunter2")).toBe("unrecognised");
  });
});

describe("projectRefFrom", () => {
  it("reads the ref out of a project URL", () => {
    expect(projectRefFrom("https://dlfuakwadngczpjydqyc.supabase.co")).toBe("dlfuakwadngczpjydqyc");
  });

  it("returns null rather than throwing on junk", () => {
    expect(projectRefFrom("not a url")).toBeNull();
    expect(projectRefFrom("")).toBeNull();
    expect(projectRefFrom(null)).toBeNull();
  });
});

describe("previewKey", () => {
  it("shows enough to compare and never the whole key", () => {
    const key = "sb_publishable_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const preview = previewKey(key);
    expect(preview).toContain("sb_publishable");
    expect(preview).not.toContain("UVWXYZ");
    expect(preview).toContain(String(key.length));
  });

  it("says so when there is nothing to preview", () => {
    expect(previewKey("")).toBe("(none)");
  });
});

describe("describeSupabaseConfig", () => {
  it("passes a publishable key on a real URL", () => {
    const report = describeSupabaseConfig("https://abc.supabase.co", "sb_publishable_x");
    expect(report.problem).toBeNull();
    expect(report.projectRef).toBe("abc");
  });

  it("explains a legacy JWT, which is the usual cause of a blanket 401", () => {
    expect(describeSupabaseConfig("https://abc.supabase.co", "eyJabc.def.ghi").problem).toMatch(/legacy/i);
  });

  it("refuses a secret key outright", () => {
    expect(describeSupabaseConfig("https://abc.supabase.co", "sb_secret_x").problem).toMatch(/never be used in a browser/i);
  });

  it("reports a missing key and a missing url separately", () => {
    expect(describeSupabaseConfig("https://abc.supabase.co", "").problem).toMatch(/build time/i);
    expect(describeSupabaseConfig("", "sb_publishable_x").problem).toMatch(/No Supabase URL/i);
  });
});
