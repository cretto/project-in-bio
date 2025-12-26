"use server";

import { FieldValue } from "firebase-admin/firestore";
import { db } from "../lib/firebase";

export async function increaseProjectVisits(
  profileId: string,
  projectId: string
) {
  const projectRef = db
    .collection("profiles")
    .doc(profileId)
    .collection("projects")
    .doc(projectId);

  await db.runTransaction(async (transaction) => {
    const project = await transaction.get(projectRef);

    if (!project.exists) {
      return;
    }

    transaction.update(projectRef, {
      totalVisits: FieldValue.increment(1),
    });
  });
}
