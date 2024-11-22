const { updateOrCreate: updateOrCreateLib } = require("@lib/v3/event");

const updateOrCreate = async (req, res, next) => {
  try {
    const { data, status } = await updateOrCreateLib({
      data: {
        ...req.body,
        files: req.files?.images,
      },
      id: req.params.id,
    });

    if (status === "created") {
      res.status(201).json({
        success: true,
        message: "Uploaded data successfully",
        self: req.path,
        links: {
          getEvent: `/api/v3/app/events/${data.insertedId}`,
          deleteEvent: `/api/v3/app/event/${data.insertedId}`,
          updateEvent: `/api/v3/app/event/${data.insertedId}`,
          getAllEvent: `/api/v3/app/events`,
        },
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Data updated successfully",
        self: req.path,
        links: {
          getEvent: `/api/v3/app/events/${req.params.id}`,
          deleteEvent: `/api/v3/app/event/${req.params.id}`,
          createEvent: `/api/v3/app/events`,
          getAllEvent: `/api/v3/app/events`,
        },
      });
    }
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

module.exports = updateOrCreate;
