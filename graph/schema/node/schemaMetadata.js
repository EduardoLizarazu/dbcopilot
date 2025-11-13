function TableMetadata({ id, name, description, aliases: [] }) {
  return {
    id,
    name,
    aliases,
    description,
  };
}

module.exports = { TableMetadata };
