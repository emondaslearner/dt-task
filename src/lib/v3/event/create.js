const { eventUtils } = require("@utils");
const { getCollection } = require("@db");

const create = async (data) => {
  const { events } = getCollection();

  const {
    type,
    uid,
    name,
    tagline,
    schedule,
    description,
    moderator,
    category,
    sub_category,
    rigor_rank,
    attendees,
  } = data;

  const parsedRigorRank =
    typeof rigor_rank === "number" ? rigor_rank : parseInt(rigor_rank, 10);
  const parsedAttendees = Array.isArray(attendees)
    ? attendees
    : JSON.parse(attendees);

  // run data validation of event
  eventUtils.validateEvent({
    type,
    uid,
    name,
    tagline,
    schedule: new Date(schedule),
    description,
    moderator,
    category,
    sub_category,
    rigor_rank: parsedRigorRank,
    attendees: parsedAttendees,
  });

  // check files exist or not. if exist then upload to cloudinary
  const images = await eventUtils.checkFileAndUpload(data?.files);

  // upload data to mongodb
  const uploadedData = await events.insertOne({
    type,
    uid,
    name,
    tagline,
    schedule,
    description,
    moderator,
    category,
    sub_category,
    rigor_rank: parsedRigorRank,
    attendees: parsedAttendees,
    files: images,
  });

  return uploadedData;
};

module.exports = create;

