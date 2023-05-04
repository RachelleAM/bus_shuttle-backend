const formatUTCDate = (dateTime) => {
  const date = dateTime.toISOString().substring(0, 10);
  const time = dateTime.toLocaleTimeString("en-GB", { timeZone: "UTC" }).substring(0, 8);
  return `${date} ${time}`;
};

export default formatUTCDate;
