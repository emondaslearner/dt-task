const { getCollection } = require("@db");
const { error } = require("@utils");

const getAll = async ({
  sortType,
  sortBy,
  searchFields,
  searchValues,
  limit,
  page,
}) => {
  // Initialize an empty filter
  const filter = {};
  const { events } = getCollection();

  if (searchFields && searchValues) {
    // Parse searchFields and searchValues if provided
    const fields = searchFields.split("|");
    const values = searchValues.split("|");

    if (fields.length !== values.length) {
      throw error.badRequest("Mismatch between search fields and values");
    }

    // Separate strict and non-strict fields
    const nonStrictFields = ["name", "tagline", "description"];
    const strictFields = [];

    // Build the filter object for MongoDB
    fields.forEach((field, index) => {
      if (field.includes("_range")) {
        const [min, max] = values[index].split("_");
        filter[field.replace("_range", "")] = {
          $gte: parseInt(min, 10),
          $lte: parseInt(max, 10),
        };
      } else if (nonStrictFields.includes(field)) {
        if (!filter.$or) filter.$or = [];
        filter.$or.push({
          [field]: { $regex: values[index], $options: "i" },
        });
      } else {
        strictFields.push(field);
        filter[field] = values[index];
      }
    });
  }

  // Determine the sorting order
  const sortOrder = sortType === "asc" ? 1 : -1;

  // Fetch events from the database
  const eventsData = await events
    .find(filter)
    .sort({ [sortBy]: sortOrder })
    .skip(page * limit - limit)
    .limit(limit)
    .toArray();

  const counts = await events.countDocuments(filter);

  return { data: eventsData, counts };
};

module.exports = getAll;
