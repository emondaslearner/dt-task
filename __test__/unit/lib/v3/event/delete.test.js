const { getCollection } = require("@db");
const { error } = require("@utils");
const { deleteEvent } = require("@lib/v3/event"); // Update path if different
const { ObjectId } = require("mongodb");

jest.mock("@db", () => ({
  getCollection: jest.fn(),
}));

jest.mock("@utils", () => ({
  error: {
    notFound: jest.fn((message) => new Error(message)),
  },
}));

describe("deleteEvent", () => {
  let mockEventsCollection;

  beforeEach(() => {
    mockEventsCollection = {
      deleteOne: jest.fn(),
    };

    getCollection.mockReturnValue({ events: mockEventsCollection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete an event and return true if the event exists", async () => {
    const mockId = "6370cf39f6f0ed001d901e17";
    mockEventsCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

    const result = await deleteEvent({ id: mockId });

    expect(mockEventsCollection.deleteOne).toHaveBeenCalledWith({
      _id: new ObjectId(mockId),
    });
    expect(result).toBe(true);
  });

});
