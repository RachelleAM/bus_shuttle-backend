export function generateCreateQuery(attributes, values, table) {
  let sqlQuery = `INSERT INTO ${table} (`;
  for (let i = 0; i < attributes.length; i++) {
    sqlQuery += attributes[i];
    if (i != attributes.length - 1) {
      sqlQuery += ", ";
    }
  }
  sqlQuery += ") VALUES ";
  for (let i = 0; i < values.length; i++) {
    sqlQuery += "(";
    for (let j = 0; j < values[i].length; j++) {
      sqlQuery +=
        typeof values[i][j] != "string" ? values[i][j] : `'${values[i][j]}'`;
      if (j < values[i].length - 1) sqlQuery += ", ";
    }
    if (i < values.length - 1) {
      sqlQuery += "), ";
    } else sqlQuery += ");";
  }
  return sqlQuery;
}

export function generateDeleteQuery(value, attribute, table) {
  let sqlQuery = `DELETE FROM ${table} WHERE ${attribute}=${value};`;
  return sqlQuery;
}

export function fetchData(par) {
  var attributes = [];
  var values = [];
  for (const [key, value] of Object.entries(par)) {
    attributes.push(key);
    values.push(value);
  }
  return [attributes, values];
}
