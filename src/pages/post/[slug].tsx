import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../../services/prismic';
import Header from '../../components/Header';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Fragment } from 'react';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';


interface PostBody {
  text: string;
}


interface PostContent {
  heading: string;
  body: PostBody[];
}


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: PostContent[];
  };
}


interface PostProps {
  post: Post;
}


export default function Post({ post }: PostProps) {

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
              {format(
                new Date(post.first_publication_date),
                'd MMM yyyy',
                { locale: ptBR },
              )}
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
  }

};


export const getStaticProps: GetStaticProps = async context => {

  const prismic = getPrismicClient();
  const { slug } = context.params;

  const response = await prismic.getByUID(
    'posts',
    String(slug),
    {},
  );

  return {
    props: {
      post: response,
    }
  };
};
