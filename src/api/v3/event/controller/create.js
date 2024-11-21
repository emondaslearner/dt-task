const { create: createLib } = require("@lib/v3/event");

const create = async (req, res, next) => {
  try {
    const data = await createLib({ ...req.body, files: req.files?.images});

    res.status(201).json({
      success: true,
      message: "Uploaded data successfully",
      self: req.path,
      links: {
        getEvent: `/api/v3/app/events/${data.insertedId}`, 
        deleteEvent: `/api/v3/app/event/${data.insertedId}` 
      }
    })
  } catch (err) {
    next(err);
  }
};

module.exports = create;
