const buildQueryConditions = (...args) => {
  if (args.length === 0) return "";
  let output = "";
  let between = false
  args.forEach((arg) => {
    if (!arg) return;
    const [key, value, comparator = "="] = arg;
    if (
      !value ||
      (value.length === 2 &&
        (value.includes(undefined) || value.includes("undefined")))
    )
      return;
    if (!output.includes("WHERE")) output = output.concat(" WHERE ");
    else if(value.length === 2) between = true;
    else output = output.concat(" AND ");
    
    if(between){
      if(value[0] != 'null' && value[1] != 'null') {
        output = output.concat(`AND ${key} BETWEEN '${value[0]}' AND '${value[1]}'`);}
    }else
    output = output.concat(`${key} ${comparator} '${value}'`);
  });
  return output;
};

export default buildQueryConditions;
