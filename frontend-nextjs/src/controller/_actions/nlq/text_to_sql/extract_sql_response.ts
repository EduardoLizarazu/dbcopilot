// Extract SQL from AI response
export function extractSqlFromResponse(response: string): string {
  // Try to extract from SQL code block
  const sqlBlockRegex = /```sql\n([\s\S]*?)\n```/;
  const blockMatch = response.match(sqlBlockRegex);

  if (blockMatch && blockMatch[1]) {
    return blockMatch[1].trim();
  }

  // Try to extract from generic code block
  const genericBlockRegex = /```\n([\s\S]*?)\n```/;
  const genericMatch = response.match(genericBlockRegex);

  if (genericMatch && genericMatch[1]) {
    return genericMatch[1].trim();
  }

  // Fallback: Find first SELECT statement
  const selectRegex = /(SELECT\s+[\s\S]+?;)/gi;
  const selectMatch = selectRegex.exec(response);

  if (selectMatch && selectMatch[1]) {
    return selectMatch[1].trim();
  }

  // Final fallback: Return entire response
  return response.trim();
}
