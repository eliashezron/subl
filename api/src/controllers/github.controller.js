import axios from "axios";
import dotenv from 'dotenv';

dotenv.config();

export const getAccessToken = async (req, res) => {
  await axios
    .post(
      `${process.env.GITHUB_ACCESS_TOKEN_URL}?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${req.query.code}`,
      {},
      {
        headers: {
          Accept: "application/json",
        },
      }
    )
    .then((response) => {
      res.json(response.data);
    });
};

export const getUserData = async (req, res) => {
  await axios
    .get(process.env.GITHUB_USER_API, {
      headers: {
        Authorization: req.get("Authorization"),
      },
    })
    .then((response) => {
      res.json(response.data);
    });
};
