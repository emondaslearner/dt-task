const {deleteEvent: deleteEventLib} = require('@lib/v3/event')

const deleteEvent = async (req, res, next) => {
    try {
        await deleteEventLib({id: req.params.id});

        res.status(204).end()
    } catch(err) {
        console.log(err);
        next(err);
    }
}

module.exports = deleteEvent;
