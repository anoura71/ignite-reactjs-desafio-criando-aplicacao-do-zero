import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}


interface PostPagination {
  page: number;
  next_page: string;
  results: Post[];
}


interface HomeProps {
  postsPagination: PostPagination;
}


export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState<string>(postsPagination.next_page);

  async function handleLoadMorePosts() {
    // Se não tiver mais nada a carregar, retorna
    if (currentPage !== 1 && nextPage === null) {
      return;
    }
    // Carrega a próxima página
    const morePostsResponse: PostPagination = await fetch(`${nextPage}`)
      .then(response => response.json());

    setCurrentPage(morePostsResponse.page);
    setNextPage(morePostsResponse.next_page);
    setPosts([...posts, ...(morePostsResponse.results)]);
  }

  return (
    <>
      <Header />

      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link
              href={`/post/${post.uid}`}
              key={post.uid}
            >
              <a>
                <strong>
                  {post.data.title}
                </strong>

                <p>
                  {post.data.subtitle}
                </p>

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
                </div>
              </a>
            </Link>
          ))}
        </div>

        {nextPage && (
          <button
            type="button"
            onClick={() => handleLoadMorePosts()}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}


export const getStaticProps: GetStaticProps = async () => {

  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts'),
  ], {
    fetch: [
      'posts.title',
      'posts.subtitle',
      'posts.author',
    ],
    pageSize: 3,
  });

  //   const postsPagination = postsResponse.results.map(post => {
  //     return {
  //       uid: post.uid,
  //       first_publication_date: post.first_publication_date,
  //       data: {
  //         title: post.data.title,
  //         subtitle: post.data.subtitle,
  //         author: post.data.author,
  //       },
  //     };
  //   });

  const postsPagination: PostPagination = {
    page: postsResponse.page,
    next_page: postsResponse.next_page,
    results: postsResponse.results,
  }

  return {
    props: {
      postsPagination,
    }
  };
};
