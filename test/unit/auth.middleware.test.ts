import type { NextFunction, Response } from "express";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi
} from "vitest";
import type { AccountRequest } from "../../interfaces/request.interface";

const mocks = vi.hoisted(() => ({
  verifyJwt: vi.fn(),
  findUser: vi.fn(),
  findCompany: vi.fn()
}));

vi.mock("jsonwebtoken", () => ({
  default: { verify: mocks.verifyJwt }
}));

vi.mock("../../models/account-user.model", () => ({
  default: { findOne: mocks.findUser }
}));

vi.mock("../../models/account-company.model", () => ({
  default: { findOne: mocks.findCompany }
}));

import {
  verifyTokenCompany,
  verifyTokenUser
} from "../../middlewares/auth.middleware";

// Tạo request giả có hoặc không có cookie token.
const createRequest = (token?: string): AccountRequest => {
  return {
    cookies: token ? { token } : {}
  } as AccountRequest;
};

// Chỉ mock những hàm Response mà middleware đang sử dụng.
const createResponse = (): Response => {
  return {
    json: vi.fn(),
    clearCookie: vi.fn()
  } as unknown as Response;
};

const createNext = (): NextFunction => vi.fn();

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret";
  mocks.verifyJwt.mockReset();
  mocks.findUser.mockReset();
  mocks.findCompany.mockReset();

  // Không in lỗi giả lập ra terminal khi kiểm tra nhánh catch.
  vi.spyOn(console, "log").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verifyTokenUser", () => {
  it("từ chối khi request không có token", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await verifyTokenUser(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: "error"
    }));
    expect(mocks.verifyJwt).not.toHaveBeenCalled();
    expect(mocks.findUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("từ chối khi JWT không hợp lệ hoặc hết hạn", async () => {
    const req = createRequest("token-khong-hop-le");
    const res = createResponse();
    const next = createNext();
    mocks.verifyJwt.mockImplementation(() => {
      throw new Error("Token expired");
    });

    await verifyTokenUser(req, res, next);

    expect(mocks.verifyJwt).toHaveBeenCalledWith(
      "token-khong-hop-le",
      "test-secret"
    );
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: "error"
    }));
    expect(mocks.findUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("từ chối company token truy cập API của user", async () => {
    const req = createRequest("company-token");
    const res = createResponse();
    const next = createNext();
    mocks.verifyJwt.mockReturnValue({
      id: "company-id",
      email: "company@example.com",
      type: "company"
    });

    await verifyTokenUser(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(mocks.findUser).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("từ chối khi tài khoản user không còn tồn tại", async () => {
    const req = createRequest("user-token");
    const res = createResponse();
    const next = createNext();
    mocks.verifyJwt.mockReturnValue({
      id: "user-id",
      email: "user@example.com",
      type: "user"
    });
    mocks.findUser.mockResolvedValue(null);

    await verifyTokenUser(req, res, next);

    expect(mocks.findUser).toHaveBeenCalledWith({
      _id: "user-id",
      email: "user@example.com"
    });
    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(next).not.toHaveBeenCalled();
  });

  it("gắn tài khoản vào request khi token hợp lệ", async () => {
    const req = createRequest("user-token");
    const res = createResponse();
    const next = createNext();
    const account = {
      _id: "user-id",
      email: "user@example.com"
    };
    mocks.verifyJwt.mockReturnValue({
      id: account._id,
      email: account.email,
      type: "user"
    });
    mocks.findUser.mockResolvedValue(account);

    await verifyTokenUser(req, res, next);

    expect(req.account).toBe(account);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("verifyTokenCompany", () => {
  it("từ chối khi request không có token", async () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await verifyTokenCompany(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: "error"
    }));
    expect(mocks.verifyJwt).not.toHaveBeenCalled();
    expect(mocks.findCompany).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("từ chối khi JWT không hợp lệ hoặc hết hạn", async () => {
    const req = createRequest("token-khong-hop-le");
    const res = createResponse();
    const next = createNext();
    mocks.verifyJwt.mockImplementation(() => {
      throw new Error("Token expired");
    });

    await verifyTokenCompany(req, res, next);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: "error"
    }));
    expect(mocks.findCompany).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("từ chối user token truy cập API của company", async () => {
    const req = createRequest("user-token");
    const res = createResponse();
    const next = createNext();
    mocks.verifyJwt.mockReturnValue({
      id: "user-id",
      email: "user@example.com",
      type: "user"
    });

    await verifyTokenCompany(req, res, next);

    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(mocks.findCompany).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("từ chối khi tài khoản company không còn tồn tại", async () => {
    const req = createRequest("company-token");
    const res = createResponse();
    const next = createNext();
    mocks.verifyJwt.mockReturnValue({
      id: "company-id",
      email: "company@example.com",
      type: "company"
    });
    mocks.findCompany.mockResolvedValue(null);

    await verifyTokenCompany(req, res, next);

    expect(mocks.findCompany).toHaveBeenCalledWith({
      _id: "company-id",
      email: "company@example.com"
    });
    expect(res.clearCookie).toHaveBeenCalledWith("token");
    expect(next).not.toHaveBeenCalled();
  });

  it("gắn tài khoản vào request khi token hợp lệ", async () => {
    const req = createRequest("company-token");
    const res = createResponse();
    const next = createNext();
    const account = {
      _id: "company-id",
      email: "company@example.com"
    };
    mocks.verifyJwt.mockReturnValue({
      id: account._id,
      email: account.email,
      type: "company"
    });
    mocks.findCompany.mockResolvedValue(account);

    await verifyTokenCompany(req, res, next);

    expect(req.account).toBe(account);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
  });
});
