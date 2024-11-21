const { getCollection } = require("@db");
const { ObjectId } = require("mongodb");
const { error } = require("@utils");
const getSingle = require("@lib/v3/event/getSingle");

jest.mock("@db", () => ({
  getCollection: jest.fn(),
}));

jest.mock("@utils", () => ({
  error: {
    notFound: jest.fn((msg) => new Error(msg)),
  },
}));

describe("getSingle", () => {
  let mockEventsCollection;

  beforeEach(() => {
    mockEventsCollection = {
      findOne: jest.fn(),
    };

    getCollection.mockReturnValue({ events: mockEventsCollection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the event data for a valid ID", async () => {
    const mockData = {
      _id: "6370cf39f6f0ed001d901e17",
      name: "Event Name",
      description: "Event Description",
    };

    mockEventsCollection.findOne.mockResolvedValue(mockData);

    const result = await getSingle({ id: "6370cf39f6f0ed001d901e17" });

    expect(mockEventsCollection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId("6370cf39f6f0ed001d901e17"),
    });
    expect(result).toEqual(mockData);
  });

  it("should throw a not found error if the event does not exist", async () => {
    mockEventsCollection.findOne.mockResolvedValue(null);

    await expect(getSingle({ id: "6370cf39f6f0ed001d901e17" })).rejects.toThrow(
      "Resource not found"
    );

    expect(mockEventsCollection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId("6370cf39f6f0ed001d901e17"),
    });
    expect(error.notFound).toHaveBeenCalledWith("Resource not found");
  });
});
