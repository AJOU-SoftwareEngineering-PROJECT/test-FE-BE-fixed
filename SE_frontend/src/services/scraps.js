import { request } from "./api";

export async function getMyScraps() {
  return request("/users/me/scraps");
}

export async function createScrap(sentenceId) {
  return request("/scraps", {
    method: "POST",
    body: JSON.stringify({ sentence_id: sentenceId })
  });
}

export async function deleteScrap(scrapId) {
  return request(`/scraps/${scrapId}`, {
    method: "DELETE"
  });
}
