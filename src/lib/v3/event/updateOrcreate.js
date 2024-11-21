const { eventUtils } = require("@utils");
const { ObjectId } = require("mongodb");
const { getCollection } = require("@db");

const updateOrCreate = async ({ data, id }) => {
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
    schedule,
    description,
    moderator,
    category,
    sub_category,
    rigor_rank: parsedRigorRank,
    attendees: parsedAttendees,
  });

  const checkData = await events.findOne({ _id: new ObjectId(id) });

  // check files exist or not. if exist then upload to cloudinary
  const images = await eventUtils.checkFileAndUpload(data?.files);

  // if data not exist then create the data in database otherwise update it
  if (!checkData) {
    const createdData = await events.insertOne({
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

    return { data: createdData, status: "created" };
  }

  const updatedData = await events.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
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
      },
    }
  );

  return {
    data: updatedData,
    status: "updated",
  };
};

module.exports = updateOrCreate;
