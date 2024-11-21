const generateQueryString = ({ queryObject = {} }) => {
  const queryString = Object.keys(queryObject)
    .filter(
      (key) =>
        queryObject[key] !== undefined &&
        queryObject[key] !== null &&
        queryObject[key] !== ""
    )
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(queryObject[key])}`
    )
    .join("&");

  return queryString ? `?${queryString}` : "";
};

const getPagination = ({ totalItems = 0, limit = 10, page = 1 }) => {
  const pagination = {
    page,
    limit,
  };
  const totalPage = Math.ceil(totalItems / limit);

  if (page > 1) pagination.prvPage = page - 1;
  if (page < totalPage) pagination.nxtPage = page + 1;

  pagination.totalPage = totalPage;
  pagination.totalResource = totalItems;

  return pagination;
};

const getHATEOASForAllItems = async ({
  path = "/",
  page = 1,
  query = {},
  hasPrev = false,
  hasNext = false,
}) => {
  const links = {};

  if (hasPrev) {
    const queryString = await generateQueryString({
      queryObject: { ...query, page: page - 1 },
    });
    links.prvPage = `/${path}/${queryString}`;
  }

  if (hasNext) {
    const queryString = await generateQueryString({
      queryObject: { ...query, page: page + 1 },
    });
    links.nxtPage = `/${path}/${queryString}`;
  }

  return links;
};

module.exports = {
  getPagination,
  getHATEOASForAllItems,
};
