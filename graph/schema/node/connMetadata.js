function ConnectionNodeMeta({
  id,
  type,
  hostname,
  port,
  database,
  name,
  description,
}) {
  return {
    id,
    type,
    hostname,
    port,
    database,
    name,
    description,
  };
}

module.exports = { ConnectionNodeMeta };
