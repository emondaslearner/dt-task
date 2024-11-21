const { getCollection } = require("@db");
const { error } = require("@utils");
const { getAll } = require("@lib/v3/event");

jest.mock("@db", () => ({
  getCollection: jest.fn(),
}));

jest.mock("@utils", () => ({
  error: {
    badRequest: jest.fn((msg) => new Error(msg)),
  },
}));

describe("getAll", () => {
  let mockEventsCollection;

  beforeEach(() => {
    mockEventsCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      countDocuments: jest.fn(),
    };

    getCollection.mockReturnValue({ events: mockEventsCollection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return events and counts when no filters are provided", async () => {
    const mockData = [
      { name: "Event 1", tagline: "Tech Event", description: "Description 1" },
      {
        name: "Event 2",
        tagline: "AI Conference",
        description: "Description 2",
      },
    ];
    mockEventsCollection.toArray.mockResolvedValue(mockData);
    mockEventsCollection.countDocuments.mockResolvedValue(mockData.length);

    const result = await getAll({
      sortType: "asc",
      sortBy: "name",
      limit: 10,
      page: 1,
    });

    expect(result).toEqual({ data: mockData, counts: mockData.length });
    expect(mockEventsCollection.find).toHaveBeenCalledWith({});
    expect(mockEventsCollection.sort).toHaveBeenCalledWith({ name: 1 });
    expect(mockEventsCollection.skip).toHaveBeenCalledWith(0);
    expect(mockEventsCollection.limit).toHaveBeenCalledWith(10);
  });

  it("should apply filters for strict and non-strict fields", async () => {
    const mockData = [{ name: "Filtered Event", tagline: "Special Event" }];
    mockEventsCollection.toArray.mockResolvedValue(mockData);
    mockEventsCollection.countDocuments.mockResolvedValue(mockData.length);

    const result = await getAll({
      sortType: "dsc",
      sortBy: "updatedAt",
      searchFields: "name|tagline|rigor_rank_range",
      searchValues: "Event|Special|1_5",
      limit: 5,
      page: 1,
    });

    expect(mockEventsCollection.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: "Event", $options: "i" } },
        { tagline: { $regex: "Special", $options: "i" } },
      ],
      rigor_rank: { $gte: 1, $lte: 5 },
    });
    expect(mockEventsCollection.sort).toHaveBeenCalledWith({ updatedAt: -1 });
    expect(mockEventsCollection.skip).toHaveBeenCalledWith(0);
    expect(mockEventsCollection.limit).toHaveBeenCalledWith(5);
    expect(result).toEqual({ data: mockData, counts: mockData.length });
  });

  it("should throw an error when searchFields and searchValues mismatch", async () => {
    await expect(
      getAll({
        searchFields: "name|tagline",
        searchValues: "Event",
        sortType: "asc",
        sortBy: "name",
        limit: 10,
        page: 1,
      })
    ).rejects.toThrow("Mismatch between search fields and values");

    expect(error.badRequest).toHaveBeenCalledWith(
      "Mismatch between search fields and values"
    );
  });

  it("should handle no searchFields and searchValues gracefully", async () => {
    const mockData = [{ name: "Event Without Filter" }];
    mockEventsCollection.toArray.mockResolvedValue(mockData);
    mockEventsCollection.countDocuments.mockResolvedValue(mockData.length);

    const result = await getAll({
      sortType: "asc",
      sortBy: "name",
      limit: 10,
      page: 1,
    });

    expect(mockEventsCollection.find).toHaveBeenCalledWith({});
    expect(result).toEqual({ data: mockData, counts: mockData.length });
  });
});
