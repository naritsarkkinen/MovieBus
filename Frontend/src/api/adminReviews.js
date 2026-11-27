
import { apiRequest } from "./client";

export async function fetchAdminReviews(token) {
  const reviews = await apiRequest("/admin/reviews", { token });

  if (!Array.isArray(reviews)) {
    throw new Error("Invalid admin review list");
  }

  return reviews;
}

export function deleteAdminReview(reviewId, token) {
  return apiRequest(`/admin/reviews/${encodeURIComponent(reviewId)}`, {
    method: "DELETE",
    token,
  });
}
