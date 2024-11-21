const { eventUtils } = require("@utils");
const { ObjectId } = require("mongodb");
const { getCollection } = require("@db");
const updateOrCreate = require("@lib/v3/event/updateOrCreate");

jest.mock("@db", () => ({
  getCollection: jest.fn(),
}));

jest.mock("@utils", () => ({
  eventUtils: {
    validateEvent: jest.fn(),
    checkFileAndUpload: jest.fn(),
  },
}));

describe("updateOrCreate", () => {
  let mockEventsCollection;

  beforeEach(() => {
    mockEventsCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
    };

    getCollection.mockReturnValue({ events: mockEventsCollection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new event if it does not exist", async () => {
    const mockData = {
      type: "conference",
      uid: "12345",
      name: "Test Event",
      tagline: "This is a test",
      schedule: new Date().toISOString(),
      description: "Event description",
      moderator: "John Doe",
      category: "Education",
      sub_category: "Online",
      rigor_rank: 5,
      attendees: JSON.stringify(["user1", "user2"]),
      files: ["file1.jpg", "file2.jpg"],
    };

    eventUtils.checkFileAndUpload.mockResolvedValue(["file1.jpg", "file2.jpg"]);
    mockEventsCollection.findOne.mockResolvedValue(null);
    mockEventsCollection.insertOne.mockResolvedValue({ insertedId: "new_id" });

    const result = await updateOrCreate({ data: mockData, id: "6370cf39f6f0ed001d901e17" });

    expect(eventUtils.validateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "conference",
        uid: "12345",
        name: "Test Event",
        tagline: "This is a test",
        description: "Event description",
        category: "Education",
        sub_category: "Online",
        rigor_rank: 5,
        attendees: ["user1", "user2"],
      })
    );
    expect(eventUtils.checkFileAndUpload).toHaveBeenCalledWith(mockData.files);
    expect(mockEventsCollection.findOne).toHaveBeenCalledWith({
      _id: new ObjectId("6370cf39f6f0ed001d901e17"),
    });
    expect(mockEventsCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Event",
        files: ["file1.jpg", "file2.jpg"],
      })
    );
    expect(result).toEqual({ data: { insertedId: "new_id" }, status: "created" });
  });

  it("should update an existing event if it exists", async () => {
    const mockData = {
      type: "conference",
      uid: "12345",
      name: "Updated Event",
      tagline: "Updated tagline",
      schedule: new Date().toISOString(),
      description: "Updated description",
      moderator: "Jane Doe",
      category: "Tech",
      sub_category: "Workshop",
      rigor_rank: 3,
      attendees: JSON.stringify(["user3"]),
      files: ["file3.jpg"],
    };

    eventUtils.checkFileAndUpload.mockResolvedValue(["file3.jpg"]);
    mockEventsCollection.findOne.mockResolvedValue({ _id: "6370cf39f6f0ed001d901e17" });
    mockEventsCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await updateOrCreate({ data: mockData, id: "6370cf39f6f0ed001d901e17" });

    expect(eventUtils.validateEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "conference",
        name: "Updated Event",
        moderator: "Jane Doe",
        attendees: ["user3"],
      })
    );
    expect(eventUtils.checkFileAndUpload).toHaveBeenCalledWith(mockData.files);
    expect(mockEventsCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId("6370cf39f6f0ed001d901e17") },
      expect.objectContaining({
        $set: expect.objectContaining({
          name: "Updated Event",
          files: ["file3.jpg"],
        }),
      })
    );
    expect(result).toEqual({ data: { modifiedCount: 1 }, status: "updated" });
  });

});
