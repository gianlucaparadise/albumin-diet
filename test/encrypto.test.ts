import { encrypt, decrypt } from "./../src/config/encrypto";

describe("Encrypting methods test", () => {
  it("should create user and update it", async () => {
    const text = "text to encrypt";

    const encrypted = encrypt(text);
    expect(text).not.toEqual(encrypted);

    const decrypted = decrypt(encrypted);
    expect(text).toEqual(decrypted);
  });
});