function TableMetadata({ id, name, description, aliases: [] }) {
  return {
    id,
    name,
    description,
    aliases,
  };
}
