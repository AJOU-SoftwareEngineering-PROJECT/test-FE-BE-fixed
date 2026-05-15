import { request } from "./api";

export async function getCommentsBySentence(sentenceId) {
  return request(`/sentences/${sentenceId}/comments`);
}

export async function createComment(sentenceId, content) {
  return request(`/sentences/${sentenceId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content })
  });
}
