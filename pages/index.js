//pages/index.js

import { AmplifyAuthenticator } from "@aws-amplify/ui-react";
import { Amplify, API, Auth, withSSRContext } from "aws-amplify";

import Head from "next/head";
import styles from "../styles/Home.module.css";

import awsExports from "../aws-exports.js";

import { createTodo } from "../src/graphql/mutations";
import { listTodos } from "../src/graphql/queries";

// Tell amplify to use our configured backend
Amplify.configure({ ...awsExports, ssr: true });

// We want to query our GraphQL API before sending the page to the client
export async function getServerSideProps({ req }) {
  const SSR = withSSRContext({ req });
  const response = await SSR.API.graphql({ query: listTodos });

  return {
    props: {
      todos: response.data.listTodos.items,
    },
  };
}

async function handleCreateTodo(event) {
  event.preventDefault();

  const form = new FormData(event.target);

  try {
    const { data } = await API.graphql({
      authMode: "AMAZON_COGNITO_USER_POOLS",
      query: createTodo,
      variables: {
        input: {
          title: form.get("title"),
          content: form.get("content"),
        },
      },
    });
    window.location.href = `/todos/${data.createTodo.id}`;
  } catch ({ errors }) {
    console.error(...errors);
    throw new Error(errors[0].message);
  }
}

export default function Home({ todos = [] }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Todo Super App</title>
        <link rel='icon' href='./favicon.ico' />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Todo App with AWS</h1>
        <AmplifyAuthenticator className={styles.auth}>
          <p className={styles.description}>
            <code className={styles.code}>{todos.length}</code> todos
          </p>

          <div className={styles.grid}>
            {todos.map((todo) => (
              <a
                className={styles.card}
                href={`/todos/${todo.id}`}
                key={todo.id}>
                <h3>{todo.title}</h3>
                <p>{todo.content}</p>
              </a>
            ))}
          </div>

          <div className={styles.card}>
            <h3>New Todo</h3>
            <form onSubmit={handleCreateTodo}>
              <fieldset>
                <legend>Task name</legend>
                <input defaultValue={"Enter a name..."} name='title' />
              </fieldset>
              <fieldset>
                <legend>Task description</legend>
                <input defaultValue='What is the task?' name='content' />
              </fieldset>

              <button>Create Post</button>
              <button type='button' onClick={() => Auth.signOut()}>
                Sign out
              </button>
            </form>
          </div>
        </AmplifyAuthenticator>
      </main>
    </div>
  );
}
