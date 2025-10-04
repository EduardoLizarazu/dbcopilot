export default function VbdIndexClient({
  initialRows,
}: {
  initialRows: any[];
}) {
  return (
    <div>
      <h1>VBD Index Client</h1>
      <pre>{JSON.stringify(initialRows, null, 2)}</pre>
    </div>
  );
}
