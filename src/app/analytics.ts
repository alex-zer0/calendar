export function initGA(userId: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-555-27';
  document.head.appendChild(script);

  window['dataLayer'] = window['dataLayer'] || [];
  const googleTag = function (key: string, value: any, opt?: {}) {
    window['dataLayer'].push(arguments);
  };
  googleTag('set', { user_id: userId });
  googleTag('js', new Date());
  googleTag('config', 'UA-555-27', { user_id: userId });
  window['gtag'] = googleTag;
}
