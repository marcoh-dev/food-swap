type User = {username: string}

export async function getUserByUsername(username: string): Promise<User | null> {
   const response = await fetch(
    `${process.env.API_URL}/users/${encodeURIComponent(username)}`,
  );

   if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  const user: User = await response.json();
  return user;
}