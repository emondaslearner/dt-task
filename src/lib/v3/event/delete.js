const { getCollection } = require("@db");
const { error } = require("@utils");
const { ObjectId } = require("mongodb");

const deleteEvent = async ({ id }) => {
  const { events } = getCollection();

  const data = await events.deleteOne({ _id: new ObjectId(id) });
  
  if (!data) {
    throw error.notFound("Resource not found");
  }

  return true;
};

module.exports = deleteEvent;
