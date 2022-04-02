import { Amplify, API, withSSRContext } from "aws-amplify";
import awsExports from "../../aws-exports";

import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../../styles/Home.module.css";

import { deleteTodo } from "../../src/graphql/mutations";
import { getTodo, listTodos } from "../../src/graphql/queries";

Amplify.configure({ ...awsExports, ssr: true });

export async function getStaticPaths() {
  const SSR = withSSRContext();
  const { data } = await SSR.API.graphql({ query: listTodos });
  const paths = data.listTodos.items.map((todo) => ({
    params: { id: todo.id },
  }));

  return {
    fallback: true,
    paths,
  };
}

export async function getStaticProps({ params }) {
  const SSR = withSSRContext();
  const { data } = await SSR.API.graphql({
    query: getTodo,
    variables: {
      id: params.id,
    },
  });

  return {
    props: {
      todo: data.getTodo,
    },
  };
}

export default function Todo({ todo }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Loading...</h1>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await API.graphql({
        authMode: "AMAZON_COGNITO_USER_POOLS",
        query: deleteTodo,
        variables: {
          input: { id: todo.id },
        },
      });

      window.location.href = "/";
    } catch ({ errors }) {
      console.error(...errors);
      throw new Error(errors[0].message);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{todo.title} - Todo App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>{todo.title}</h1>
        <p className={styles.description}>{todo.content}</p>
      </main>
      <footer className={styles.footer}>
        <button onClick={handleDelete}>Delete Post</button>
      </footer>
    </div>
  );
}
