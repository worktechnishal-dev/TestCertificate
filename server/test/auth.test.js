const assert = require("node:assert/strict");
const test = require("node:test");
const { hashPassword, signToken, verifyPassword, verifyToken } = require("../utils/auth");

test("hashPassword stores verifiable passwords without keeping plain text", () => {
  const hashed = hashPassword("secret123");

  assert.notEqual(hashed, "secret123");
  assert.equal(verifyPassword("secret123", hashed), true);
  assert.equal(verifyPassword("wrong-password", hashed), false);
});

test("signToken creates verifiable expiring auth tokens", () => {
  const { token, expiresAt } = signToken({ userId: "abc123" }, true);
  const payload = verifyToken(token);

  assert.equal(payload.userId, "abc123");
  assert.equal(payload.exp, expiresAt);
  assert.ok(expiresAt > Date.now());
  assert.equal(verifyToken(`${token}tampered`), null);
});
