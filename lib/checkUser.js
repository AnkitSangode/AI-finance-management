import { currentUser } from "@clerk/nextjs/server";
import { db } from "../lib/prisma"; // Ensure you have the correct path to your db module

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    let loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (!loggedInUser) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      const email = user.emailAddresses?.[0]?.emailAddress || '';

      loggedInUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email,
        },
      });
    }

    return loggedInUser;

  } catch (error) {
    console.error("Error checking user:", error);
    return null;
  }
};