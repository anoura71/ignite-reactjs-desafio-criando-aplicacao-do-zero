import { HTMLAttributes, useEffect } from 'react';


type UtterancesScriptProps = HTMLAttributes<HTMLScriptElement> & {
  parentElement: HTMLElement,
  repo: string,
  label?: string,
  isIssueNumber: boolean,
  issueTerm: string,
  theme: string,
}


type CommentsProps = HTMLAttributes<HTMLScriptElement> & {
  repo: string;
}


const addUtterancesScript = ({
  parentElement,
  repo,
  label,
  isIssueNumber,
  issueTerm,
  theme,
}: UtterancesScriptProps) => {

  const script = document.createElement('script');
  script.src = 'https://utteranc.es/client.js';
  script.crossOrigin = 'anonymous';
  script.async = true;
  script.setAttribute('repo', repo);
  if (label) {
    script.setAttribute('label', label);
  }
  if (isIssueNumber) {
    script.setAttribute('issue-number', issueTerm);
  } else {
    script.setAttribute('issue-term', issueTerm);
  }
  script.setAttribute('theme', theme);

  parentElement.appendChild(script);
};


export function Comments({ repo }: CommentsProps) {

  const label = 'blog-comment';
  const issueTerm = 'pathname';
  const theme = 'photon-dark';

  useEffect(() => {
    // Caixa de comentários
    const commentsBox = document.getElementById('commentsBox');
    if (!commentsBox) {
      // A caixa de comentários ainda não foi carregada
      return;
    }

    // Utterances
    const utterances = document.getElementsByClassName('utterances')[0];
    if (utterances) {
      // Remove o Utterances se já existir
      utterances.remove();
    }

    // Script do Utterances
    addUtterancesScript({
      parentElement: commentsBox,
      repo,
      label,
      isIssueNumber: false,
      issueTerm,
      theme,
    });
  });

  return (
    <div id="commentsBox" />
  );
}
