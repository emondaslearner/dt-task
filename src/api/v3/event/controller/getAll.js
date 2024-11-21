const { getAll: getAllLib } = require("@lib/v3/event");
const { pagination } = require("@utils");

const getAll = async (req, res, next) => {
  try {
    const filter = {
      limit: parseInt(req.query.limit) || 10,
      page: parseInt(req.query?.page) || 1,
      sortType: req.query?.sortType || "dsc",
      sortBy: req.query?.sortBy || "updatedAt",
      searchFields: req.query?.searchFields || "",
      searchValues: req.query?.searchValues || "",
    };

    const { data, counts } = await getAllLib(filter);

    const paginationDetails = await pagination.getPagination({
      totalItems: counts,
      limit: filter.limit,
      page: filter.page,
    });

    // hateoas
    const hateoas = await pagination.getHATEOASForAllItems({
      path: req.path,
      page: filter.page,
      query: {
        ...req.query,
        limit: filter.limit,
        page: filter.page,
      },
      hasPrev: !!paginationDetails.prvPage,
      hasNext: !!paginationDetails.nxtPage,
    });

    const response = {
      code: 200,
      message: "Data fetched successfully",
      data,
      self: req.path,
      links: hateoas,
      pagination: paginationDetails,
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = getAll;
