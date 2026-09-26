import bcrypt from "bcryptjs";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from "vitest";

// Thiết lập môi trường test trước khi import Express app.
vi.hoisted(() => {
  process.env.JWT_SECRET = "integration-test-secret";
  process.env.NODE_ENV = "test";
  process.env.DOMAIN_FE = "http://localhost:3000";
});

// Không sử dụng Cloudinary thật trong integration test.
vi.mock("../../helpers/cloudinary.helper", async () => {
  const { fakeUploadStorage } = await import(
    "../helpers/fake-upload-storage"
  );

  return {
    storage: fakeUploadStorage
  };
});

import app from "../../app";
import AccountCompany from "../../models/account-company.model";
import AccountUser from "../../models/account-user.model";
import CV from "../../models/cv.model";
import Job from "../../models/job.model";
import {
  clearMemoryDatabase,
  startMemoryDatabase,
  stopMemoryDatabase
} from "../helpers/memory-database";

const PASSWORD = "Password1!";

const createUser = async () => {
  return AccountUser.create({
    fullName: "Nguyen Van Test",
    email: "user@example.com",
    password: await bcrypt.hash(PASSWORD, 10),
    status: "active",
    phone: "0900000000"
  });
};

const createCompany = async () => {
  return AccountCompany.create({
    companyName: "Test Company",
    email: "company@example.com",
    password: await bcrypt.hash(PASSWORD, 10),
    status: "active",
    description: "<p>Giới thiệu an toàn</p><script>alert(1)</script>"
  });
};

const loginCompany = async () => {
  await createCompany();
  const agent = request.agent(app);

  const response = await agent
    .post("/company/login")
    .send({
      email: "company@example.com",
      password: PASSWORD
    });

  expect(response.body.code).toBe("success");
  return agent;
};

beforeAll(async () => {
  await startMemoryDatabase();
});

afterEach(async () => {
  await clearMemoryDatabase();
});

afterAll(async () => {
  await stopMemoryDatabase();
});

describe("API xác thực", () => {
  it("đăng nhập user và tạo cookie bảo mật", async () => {
    await createUser();

    const response = await request(app)
      .post("/user/login")
      .send({
        email: "user@example.com",
        password: PASSWORD
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe("success");

    const cookie = response.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toContain("token=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
  });

  it("từ chối khi user nhập sai mật khẩu", async () => {
    await createUser();

    const response = await request(app)
      .post("/user/login")
      .send({
        email: "user@example.com",
        password: "WrongPassword1!"
      });

    expect(response.body.code).toBe("error");
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("trả thông tin user khi cookie hợp lệ", async () => {
    await createUser();
    const agent = request.agent(app);

    await agent.post("/user/login").send({
      email: "user@example.com",
      password: PASSWORD
    });

    const response = await agent.get("/auth/check");

    expect(response.body.code).toBe("success");
    expect(response.body.infoUser.email).toBe("user@example.com");
    expect(response.body.infoUser.fullName).toBe("Nguyen Van Test");
  });

  it("lọc HTML cũ khi trả thông tin company", async () => {
    const agent = await loginCompany();

    const response = await agent.get("/auth/check");

    expect(response.body.code).toBe("success");
    expect(response.body.infoCompany.description).toContain(
      "<p>Giới thiệu an toàn</p>"
    );
    expect(response.body.infoCompany.description).not.toContain("script");
  });
});

describe("API upload ảnh TinyMCE", () => {
  it("chặn upload khi company chưa đăng nhập", async () => {
    const response = await request(app)
      .post("/upload/image")
      .attach("file", Buffer.from("fake-image"), {
        filename: "image.png",
        contentType: "image/png"
      });

    expect(response.body.code).toBe("error");
    expect(response.body.location).toBeUndefined();
  });

  it("cho phép company đã đăng nhập upload ảnh", async () => {
    const agent = await loginCompany();

    const response = await agent
      .post("/upload/image")
      .attach("file", Buffer.from("fake-image"), {
        filename: "image.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(200);
    expect(response.body.location).toBe("https://test.local/image.png");
  });
});

describe("API tạo công việc", () => {
  it("lưu mô tả đã được loại bỏ mã JavaScript", async () => {
    const agent = await loginCompany();

    const response = await agent
      .post("/company/job/create")
      .field("title", "Backend Developer")
      .field("salaryMin", "1000")
      .field("salaryMax", "2000")
      .field("technologies", "Node.js, MongoDB")
      .field(
        "description",
        "<p>Công việc an toàn</p><script>alert(1)</script>"
      );

    expect(response.body.code).toBe("success");

    const job = await Job.findOne({ title: "Backend Developer" });
    expect(job).not.toBeNull();
    expect(job?.description).toContain("<p>Công việc an toàn</p>");
    expect(job?.description).not.toContain("script");
  });
});

describe("API nộp CV", () => {
  it("từ chối khi không gửi file CV", async () => {
    const response = await request(app)
      .post("/job/apply")
      .field("jobId", "job-001")
      .field("email", "candidate@example.com");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
  });

  it("từ chối file không phải PDF", async () => {
    const response = await request(app)
      .post("/job/apply")
      .field("jobId", "job-001")
      .field("email", "candidate@example.com")
      .attach("fileCV", Buffer.from("not-pdf"), {
        filename: "cv.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
  });

  it("lưu CV hợp lệ vào database", async () => {
    const response = await request(app)
      .post("/job/apply")
      .field("jobId", "job-001")
      .field("fullName", "Candidate Test")
      .field("email", "candidate@example.com")
      .field("phone", "0900000001")
      .attach("fileCV", Buffer.from("%PDF-1.4 fake-pdf"), {
        filename: "candidate-cv.pdf",
        contentType: "application/pdf"
      });

    expect(response.body.code).toBe("success");

    const cv = await CV.findOne({
      jobId: "job-001",
      email: "candidate@example.com"
    });
    expect(cv).not.toBeNull();
    expect(cv?.fileCV).toBe("https://test.local/candidate-cv.pdf");
  });

  it("không tạo bản ghi thứ hai khi ứng viên nộp trùng", async () => {
    const submitCv = () => request(app)
      .post("/job/apply")
      .field("jobId", "job-001")
      .field("fullName", "Candidate Test")
      .field("email", "candidate@example.com")
      .field("phone", "0900000001")
      .attach("fileCV", Buffer.from("%PDF-1.4 fake-pdf"), {
        filename: "candidate-cv.pdf",
        contentType: "application/pdf"
      });

    const firstResponse = await submitCv();
    const secondResponse = await submitCv();

    expect(firstResponse.body.code).toBe("success");
    expect(secondResponse.body.code).toBe("error");
    expect(await CV.countDocuments({})).toBe(1);
  });
});
