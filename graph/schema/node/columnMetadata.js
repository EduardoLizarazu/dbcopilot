function columnMetadata({
  id,
  name,
  aliases: [], // array of string
  description,
  datatype,
  profile: {
    distinctValue: [],
    nullCounter,
    maxValue,
    minValue,
  },
}) {
  return {
    id,
    name,
    aliases,
    description,
    datatype,
    profile: {
      distinctValue,
      nullCounter,
      maxValue,
      minValue,
    },
  };
}
