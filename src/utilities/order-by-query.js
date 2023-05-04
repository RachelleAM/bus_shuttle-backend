const orderQuery = (queryConditions, orderBy, descending) => {
  if (!orderBy) return queryConditions;
  let output = queryConditions;
  output = output.concat(
    ` ORDER BY ${orderBy} ${descending == "true" ? "DESC" : ""}`
  );
  return output;
};

export default orderQuery;
