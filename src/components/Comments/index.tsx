import { HTMLAttributes, useEffect, useRef } from 'react';


type CommentsProps = HTMLAttributes<HTMLScriptElement> & {
  repo: string;
}


export function Comments({ repo }: CommentsProps) {

  const reference = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    const scriptElement = document.createElement('script');

    scriptElement.src = 'https://utteranc.es/client.js';
    scriptElement.crossOrigin = 'anonymous';
    scriptElement.async = true;
    scriptElement.setAttribute('repo', repo);
    scriptElement.setAttribute('issue-term', 'pathname');
    scriptElement.setAttribute('label', 'blog-comment');
    scriptElement.setAttribute('theme', 'photon-dark');

    reference.current.appendChild(scriptElement);
  }, []);

  return (
    <>
      <section ref={reference} />
    </>
  );
}
