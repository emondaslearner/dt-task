const { getCollection } = require("@db");
const { ObjectId } = require("mongodb");
const { error } = require('@utils');

const getSingle = async ({ id }) => {
  const { events } = getCollection();

  const data = await events.findOne({ _id: new ObjectId(id) });

  // if data not exist then throw a 404 error 
  if(!data) {
    throw error.notFound('Resource not found');
  }

  return data;
};

module.exports = getSingle;
