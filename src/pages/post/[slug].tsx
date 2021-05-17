import React, { useEffect } from 'react';
import { Fragment } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';
import { Comments } from '../../components/Comments';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';



interface PostBody {
  text: string;
}


interface PostContent {
  heading: string;
  body: PostBody[];
}


interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: PostContent[];
  };
}


interface NavigationPost {
  uid: string;
  data: {
    title: string;
  };
};


interface PostProps {
  post: Post;
  preview: boolean;
  previousPost?: NavigationPost;
  nextPost?: NavigationPost;
  repo: string;
}


export default function Post({
  post,
  preview,
  repo,
  previousPost,
  nextPost,
}: PostProps) {

  const { isFallback } = useRouter();

  if (isFallback) {
    return <p>Carregando...</p>;
  }

  /** Calcular o tempo de leitura */
  function calculateReadingTime(content: PostContent[]) {

    const wordCount = content.reduce((acc, item) => {
      // Conta as palavras do cabeçalho e acumula
      acc += item.heading?.split(' ').length | 0;
      // Conta as palavras do corpo
      const bodyWords = item.body.map(bodyItem =>
        bodyItem.text.split(' ').length,
      );
      bodyWords.map(word =>
        acc += word,
      );

      return acc;
    }, 0);

    return Math.ceil(wordCount / 200);
  }

  /** Formatar data para exibição. */
  function formatDate(dateString: string) {

    const formattedDate = format(
      new Date(dateString),
      'd MMM yyyy',
      { locale: ptBR },
    );

    return formattedDate;
  }

  /** Formatar hora para exibição. */
  function formatTime(dateString: string) {

    const formattedDate = format(
      new Date(dateString),
      'HH:mm',
      { locale: ptBR },
    );

    return formattedDate;
  }

  // Verifica se o post foi editado após a primeira apublicação
  const isPostEdited =
    formatDate(post.first_publication_date) !== formatDate(post.last_publication_date);

  return (
    <>
      <Header />

      <Head>
        <title>Post | spacetraveling</title>
      </Head>

      <div className={styles.banner}>
        <img
          src={post.data.banner.url}
          alt="banner"
        />
      </div>

      <main className={styles.container}>
        <h1>{post.data.title}</h1>

        <div className={styles.about}>
          <span>
            <p>
              <FiCalendar />
            </p>

            <p>
              {formatDate(post.first_publication_date)}
            </p>
          </span>

          <span>
            <p>
              <FiUser />
            </p>

            <p>
              {post.data.author}
            </p>
          </span>

          <span>
            <p>
              <FiClock />
            </p>

            <p>
              {`${calculateReadingTime(post.data.content)} min`}
            </p>
          </span>
        </div>

        {isPostEdited && (
          <div className={styles.lastEdited}>
            {`* editado em ${formatDate(post.last_publication_date)} às ${formatTime(post.last_publication_date)}`}
          </div>
        )}

        <div className={styles.postContent}>
          {post.data.content.map(({ heading, body }) => (
            <Fragment key={heading}>
              <h2>{heading}</h2>

              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(body) }}
              />
            </Fragment>
          ))}
        </div>

        <section className={`${styles.navigation} ${commonStyles.container}`}>
          <div>
            {previousPost && (
              <>
                <h5>{previousPost.data.title}</h5>
                <Link href={`/post/${previousPost.uid}`}>
                  <a>Post anterior</a>
                </Link>
              </>
            )}
          </div>

          <div>
            {nextPost && (
              <>
                <h5>{nextPost.data.title}</h5>
                <Link href={`/post/${nextPost.uid}`}>
                  <a>Próximo post</a>
                </Link>
              </>
            )}
          </div>
        </section>

        <Comments
          repo={repo}
        />

        {preview && (
          <aside className={commonStyles.previewButton}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}


export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};


export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {

  const prismic = getPrismicClient();
  const { slug } = params;

  // Busca o post
  const response = await prismic.getByUID(
    'posts',
    String(slug),
    { ref: previewData?.ref || null },
  );

  // Busca todos os posts
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: [
      'posts.title',
    ],
  });
  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
      },
    };
  });

  // Busca o índice do post atual no array de results
  const currentPostIndex = results.findIndex(post => post.uid === response.uid);

  // Busca o post anterior, caso exista
  let previousItem: NavigationPost = null;
  if (currentPostIndex !== results.length - 1) {
    // Qualquer post, exceto o mais antigo
    previousItem = results[currentPostIndex + 1];
  }

  // Busca o post seguinte, caso exista
  let nextItem: NavigationPost = null;
  if (currentPostIndex !== 0) {
    // Qualquer post, exceto o mais recente
    nextItem = results[currentPostIndex - 1];
  }

  return {
    props: {
      post: response,
      preview,
      repo: process.env.GITHUB_REPO_NAME,
      previousPost: previousItem,
      nextPost: nextItem,
    },
    // revalidate: 60 * 30,  // Validade: 30 minutos
  };
};
