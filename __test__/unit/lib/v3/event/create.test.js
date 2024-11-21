const { create } = require("@lib/v3/event");
const { getCollection } = require("@db");
const { eventUtils } = require("@utils");

jest.mock("@db", () => ({
  getCollection: jest.fn(),
}));

jest.mock("@utils", () => ({
  eventUtils: {
    validateEvent: jest.fn(),
    checkFileAndUpload: jest.fn(),
  },
}));

describe("create", () => {
  let mockEventsCollection;

  beforeEach(() => {
    mockEventsCollection = {
      insertOne: jest.fn(),
    };

    getCollection.mockReturnValue({ events: mockEventsCollection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should validate event data, upload files, and insert data into the database", async () => {
    const mockData = {
      type: "event",
      uid: 1,
      name: "Sample Event",
      tagline: "A tagline",
      schedule: "2023-12-01",
      description: "Sample description",
      moderator: "moderator_id",
      category: "Technology",
      sub_category: "AI",
      rigor_rank: "5",
      attendees: JSON.stringify(["attendee1", "attendee2"]),
      files: { image: "mock_image" },
    };

    const mockImages = ["uploaded_image_url"];
    const mockInsertResult = { insertedId: "mockInsertedId" };

    eventUtils.validateEvent.mockReturnValue(true);
    eventUtils.checkFileAndUpload.mockResolvedValue(mockImages);
    mockEventsCollection.insertOne.mockResolvedValue(mockInsertResult);

    const result = await create(mockData);

    expect(eventUtils.validateEvent).toHaveBeenCalledTimes(1);
    expect(eventUtils.validateEvent).toHaveBeenCalledWith({
      type: "event",
      uid: 1,
      name: "Sample Event",
      tagline: "A tagline",
      schedule: new Date("2023-12-01"),
      description: "Sample description",
      moderator: "moderator_id",
      category: "Technology",
      sub_category: "AI",
      rigor_rank: 5,
      attendees: ["attendee1", "attendee2"],
    });

    expect(eventUtils.checkFileAndUpload).toHaveBeenCalledTimes(1);
    expect(eventUtils.checkFileAndUpload).toHaveBeenCalledWith(mockData.files);

    expect(mockEventsCollection.insertOne).toHaveBeenCalledTimes(1);
    expect(mockEventsCollection.insertOne).toHaveBeenCalledWith({
      type: "event",
      uid: 1,
      name: "Sample Event",
      tagline: "A tagline",
      schedule: "2023-12-01",
      description: "Sample description",
      moderator: "moderator_id",
      category: "Technology",
      sub_category: "AI",
      rigor_rank: 5,
      attendees: ["attendee1", "attendee2"],
      files: mockImages,
    });

    expect(result).toEqual(mockInsertResult);
  });

  it("should throw an error if validation fails", async () => {
    const mockData = {
      type: "event",
      uid: 1,
      name: "Invalid Event",
      tagline: "Invalid tagline",
      schedule: "invalid_date",
      description: "Invalid description",
      moderator: "moderator_id",
      category: "Technology",
      sub_category: "AI",
      rigor_rank: "invalid_rigor_rank",
      attendees: JSON.stringify(["attendee1", "attendee2"]),
    };

    eventUtils.validateEvent.mockImplementation(() => {
      throw new Error("Validation failed");
    });

    await expect(create(mockData)).rejects.toThrow("Validation failed");

    expect(eventUtils.validateEvent).toHaveBeenCalledTimes(1);
    expect(eventUtils.checkFileAndUpload).not.toHaveBeenCalled();
    expect(mockEventsCollection.insertOne).not.toHaveBeenCalled();
  });
});
