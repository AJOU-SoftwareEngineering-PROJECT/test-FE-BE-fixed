import { request } from "./api";

export async function createAuthor(payload) {
  return request("/authors", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
