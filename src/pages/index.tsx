import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "<redux>/styles/Home.module.css";

import { useEffect, useState, FormEvent } from "react";

type Food = {
  food: string;
  eaten: boolean;
};

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [food, setFood] = useState("");
  const [message, setMessage] = useState("");

  /**
   * Universal error handler.
   */
  const errorHandler = function (error: any) {
    window.location.reload();
    // console.error(error);
    // alert("Some error occurred :(");
  };

  /**
   * useEffect mainly to retrieve any data.
   * Here, whenever the list of foods updates, it will fectch the data again.
   */
  useEffect(() => {
    //This function fetches the list of foods from the AWS DynamoDB via AWS API Gateway.
    try {
      const fetchFoodList = async () => {
        const res = await fetch(
          "https://smq0v7nrq9.execute-api.us-east-1.amazonaws.com/summer2023planner-stage/summer2023-food-retrieve",
          { method: "GET" }
        );
        const foodsList = await res.json();
        setFoods(foodsList);
      };

      // Retrieve the update foods list
      fetchFoodList();
    } catch (error) {
      errorHandler(error);
    }
  }, [foods]);

  /**
   * This function appends some food to the list of foods.
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // Default HTML refresh prevented.
    event.preventDefault();
    try {
      const response = await fetch(
        "https://smq0v7nrq9.execute-api.us-east-1.amazonaws.com/summer2023planner-stage/summer2023-food-append",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ food }),
        }
      );

      // Response decoded to Korean.
      const message = await response.json();
      const messageDecodedToKorean = decodeURIComponent(
        JSON.parse('"' + message.replace(/\"/g, '\\"') + '"')
      );
      setMessage(JSON.parse(messageDecodedToKorean).message);

      // Reset the form
      setFood("");
    } catch (error) {
      errorHandler(error);
    }
  };

  /**
   * This function removes some food to the list of foods.
   */
  const removeFoodItem = async (foodname: string) => {
    try {
      const responseFromRemoveAPI = await fetch(
        "https://smq0v7nrq9.execute-api.us-east-1.amazonaws.com/summer2023planner-stage/summer2023-food-delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ food: foodname }),
        }
      );

      // Response decoded to Korean.
      const message = await responseFromRemoveAPI.json();
      console.log(message);
      const messageDecodedToKorean = decodeURIComponent(
        JSON.parse('"' + message.replace(/\"/g, '\\"') + '"')
      );
      setMessage(JSON.parse(messageDecodedToKorean).message);
    } catch (error) {
      errorHandler(error);
    }
  };

  return (
    <>
      <Head>
        <title>고동이네 여름계획</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${styles.main} ${inter.className}`}>
        <h1>Summer 2023 Planner</h1>
        <h2>{message}</h2>
        <ul>
          {foods.map((food, index) => (
            <li key={index}>
              <h2>{food.food}</h2>
              <p>{!food.eaten ? <>먹어야 될 것</> : <>먹은 것</>}</p>
              <button onClick={() => removeFoodItem(food.food)}>
                Delete
              </button>{" "}
            </li>
          ))}
        </ul>

        <form onSubmit={handleSubmit}>
          <label>
            Food:
            <input
              type="text"
              value={food}
              onChange={(event) => setFood(event.target.value)}
            />
          </label>
          <button type="submit">Append</button>
        </form>
      </main>
    </>
  );
}
