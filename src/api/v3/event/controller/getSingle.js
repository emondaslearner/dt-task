const { getSingle: getSingleLib } = require("@lib/v3/event");

const getSingle = async (req, res, next) => {
  try {
    const data = await getSingleLib({ id: req.params.id });
  
    res.status(200).json({
      success: true,
      message: "Fetched event data successfully",
      data,
      links: {
        createEvent: `/api/v3/app/events`, 
        getEvents: `/api/v3/app/events`, 
        deleteEvent: `/api/v3/app/event/${data._id}`,
        updateEvent: `/api/v3/app/event/${data._id}` 
      }
    })
  } catch (err) {
    console.log("err", err);
    next(err);
  }
};

module.exports = getSingle;
