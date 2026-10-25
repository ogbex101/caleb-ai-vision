import { describe, it, expect } from "vitest";
import { driveFileId, driveLinkWarning, drivePreviewUrl, driveViewUrl, isDriveLink } from "@/lib/driveLink";

const ID = "1A2b3C4d5E6f7G8h9I0jKlMnOpQrStUv";

describe("driveFileId", () => {
  it("reads the id from every shape Drive hands out", () => {
    expect(driveFileId(`https://drive.google.com/file/d/${ID}/view?usp=sharing`)).toBe(ID);
    expect(driveFileId(`https://drive.google.com/file/d/${ID}/preview`)).toBe(ID);
    expect(driveFileId(`https://drive.google.com/open?id=${ID}`)).toBe(ID);
    expect(driveFileId(`https://drive.google.com/uc?export=download&id=${ID}`)).toBe(ID);
    expect(driveFileId(`  https://drive.google.com/file/d/${ID}/view  `)).toBe(ID);
  });

  it("refuses a folder link, which is not one video", () => {
    expect(driveFileId(`https://drive.google.com/drive/folders/${ID}`)).toBeNull();
  });

  it("refuses non-Drive hosts and junk", () => {
    expect(driveFileId(`https://example.com/file/d/${ID}/view`)).toBeNull();
    expect(driveFileId("https://youtube.com/watch?v=abc")).toBeNull();
    expect(driveFileId("not a url")).toBeNull();
    expect(driveFileId("")).toBeNull();
    expect(driveFileId(null)).toBeNull();
  });
});

describe("url builders", () => {
  it("builds canonical view and preview urls from any input shape", () => {
    expect(driveViewUrl(`https://drive.google.com/open?id=${ID}`)).toBe(`https://drive.google.com/file/d/${ID}/view`);
    expect(drivePreviewUrl(`https://drive.google.com/file/d/${ID}/view?usp=drivesdk`)).toBe(`https://drive.google.com/file/d/${ID}/preview`);
  });

  it("returns null rather than a broken url for a non-Drive link", () => {
    expect(driveViewUrl("https://vimeo.com/12345")).toBeNull();
    expect(drivePreviewUrl("https://vimeo.com/12345")).toBeNull();
  });
});

describe("driveLinkWarning", () => {
  it("says nothing about a good Drive link, an empty field, or another host", () => {
    expect(driveLinkWarning(`https://drive.google.com/file/d/${ID}/view`)).toBeNull();
    expect(driveLinkWarning("")).toBeNull();
    expect(driveLinkWarning(null)).toBeNull();
    expect(driveLinkWarning("https://vimeo.com/12345")).toBeNull();
  });

  it("explains a folder link and a Google link with no id", () => {
    expect(driveLinkWarning(`https://drive.google.com/drive/folders/${ID}`)).toMatch(/folder/i);
    expect(driveLinkWarning("https://drive.google.com/drive/my-drive")).toMatch(/file id/i);
  });

  it("flags something that is not a url at all", () => {
    expect(driveLinkWarning("just some text")).toMatch(/web address/i);
  });
});

describe("isDriveLink", () => {
  it("is true only for a resolvable file link", () => {
    expect(isDriveLink(`https://drive.google.com/file/d/${ID}/view`)).toBe(true);
    expect(isDriveLink(`https://drive.google.com/drive/folders/${ID}`)).toBe(false);
  });
});
