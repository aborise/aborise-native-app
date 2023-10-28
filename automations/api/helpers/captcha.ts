import { Solver } from '2captcha-ts';
import type { Cookie } from 'playwright-core';
import { Err, Ok, wrapAsync } from '~/shared/Result';

export const solveCaptcha = ({
  siteKey,
  url,
  enterprise = 1,
  action = 'verify',
}: {
  siteKey: string;
  url: string;
  enterprise?: 0 | 1;
  action?: string;
  cookies?: Cookie[];
}) => {
  return wrapAsync(async () => {
    const solver = new Solver('05cf4a22eefb49f3936d5da76b5912b9');
    const timer = new Date();
    console.log('solving captcha...');
    try {
      const response = await solver.recaptcha({
        pageurl: url,
        googlekey: siteKey,
        min_score: 0.9,
        enterprise,
        version: 'v3',
        action,
        // userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/117.0',
        // cookies: cookies ? cookiesToString(cookies) : undefined,
      });

      console.log('done in ', new Date().getTime() - timer.getTime(), 'ms');

      return Ok(response.data);
    } catch (e) {
      return Err(e as Error);
    }
  });
};
