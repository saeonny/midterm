/** Global Declarations */
let  queryString = '';
let queryParams = [];

const initQueryVars = (queryString, queryParams) => {
  queryString = '';
  queryParams = [];
};

const getdataFromDb = (db) => {
  initQueryVars(queryString, queryParams);
  queryString = `
  SELECT *
  FROM items
  ORDER BY date_posted DESC;
  `;
  return db.query(queryString);
};

module.exports = {
  getdataFromDb,
};
