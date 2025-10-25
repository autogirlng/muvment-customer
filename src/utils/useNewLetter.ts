import axios from "axios";
import { toast } from "react-toastify";

const senderAPItoken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZWU4NDhmYjE5MzgzNWVkYjBkMWU1NDUyYWVlNzk5MzRlNWE3Y2EwNzBmNzU5ZGY5MmNhNzNkODljM2E5Mzk2MDMzYjk4MzJlNWNjZDRhNzYiLCJpYXQiOiIxNzM2NTAwMDk4LjM0OTQ4OCIsIm5iZiI6IjE3MzY1MDAwOTguMzQ5NDkwIiwiZXhwIjoiNDg5MDEwMDA5OC4zNDgyMzQiLCJzdWIiOiI4Nzc0MDIiLCJzY29wZXMiOltdfQ.OuONo9ot3oocHcBlpEHIgTquFkwiLrFNiHvnizBIVuJj9CEWZuxiXwI5tRvNyldjucA75tbYhDtSUHFYt0-mlw";

export default function useNewsletter() {
  const addSubscriber = async ({ email }: { email: string }) => {
    try {
      const response = await axios.post(
        `https://api.sender.net/v2/subscribers`,
        {
          email,
          groups: ["bkBR0K"],
        },
        {
          headers: {
            Authorization: `Bearer ${senderAPItoken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log(response);

      toast.success("Successful!");
    } catch (err) {
      console.log(err);
    } finally {
    }
  };

  // ej5R9B - Autogirl Hosts
  // bkBR0K - Autogirl Customers

  return { addSubscriber };
}
