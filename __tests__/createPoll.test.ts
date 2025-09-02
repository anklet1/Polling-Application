// __tests__/createPoll.test.js
import { createPoll } from "../lib/pollService"; // adjust path to where your function lives
import { supabase } from "../lib/supabaseClient";

// Mock Supabase
jest.mock("../lib/supabaseClient", () => {
  return {
    supabase: {
      from: jest.fn(() => ({
        insert: jest.fn(),
      })),
    },
  };
});

describe("createPoll", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should insert poll into database successfully", async () => {
    // Arrange
    const mockInsert = jest.fn().mockResolvedValue({ data: [{ id: 1, question: "Test poll" }], error: null });
    supabase.from.mockReturnValueOnce({ insert: mockInsert });

    // Act
    const result = await createPoll("Test poll");

    // Assert
    expect(supabase.from).toHaveBeenCalledWith("polls");
    expect(mockInsert).toHaveBeenCalledWith([{ question: "Test poll" }]);
    expect(result.data[0].question).toBe("Test poll");
  });

  test("should handle errors when inserting poll", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: null, error: { message: "DB error" } });
    supabase.from.mockReturnValueOnce({ insert: mockInsert });

    const result = await createPoll("Bad poll");

    expect(result.error.message).toBe("DB error");
  });
});

// Integration-style test
describe("Integration: API route for createPoll", () => {
  test("should return success response when poll created", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: [{ id: 1, question: "Integration poll" }], error: null });
    supabase.from.mockReturnValueOnce({ insert: mockInsert });

    // Simulate API handler
    const req = { body: { question: "Integration poll" }, method: "POST" };
    const res = { status: jest.fn(() => res), json: jest.fn() };

    const { default: handler } = await import("../pages/api/polls/create"); // adjust path

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, poll: { id: 1, question: "Integration poll" } });
  });
});
