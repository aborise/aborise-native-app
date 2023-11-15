import { Err, Ok, fromPromise } from '~/shared/Result';
import Parser from 'react-native-html-parser';
import { parse } from '~/shared/parser';

export const stringToDocument = async (html: string) => {
  const parser = new Parser.DOMParser();

  return parser.parseFromString(html, 'text/html') as Document & {
    querySelect: (selector: string) => Element | null;
  };
};

// export const getJsonFromHtmlResponse = <T>(html: string, selector: string) => {
//   return fromPromise(stringToDocument(html))
//     .map((document) => document.querySelect(selector))
//     .andThen((script) => {
//       if (!script) {
//         return Err({
//           custom: 'Script tag to read auth token wasnt found',
//           errorMessage: 'Script tag to read auth token wasnt found',
//           message: 'Unauthorized',
//           statusCode: 401,
//         });
//       }

//       console.log(script);
//       console.log(script.innerHTML);

//       return Ok(JSON.parse(script.innerHTML) as T);
//     });
// };

export const getJsonFromHtmlResponse = <T>(html: string, selector: string) => {
  const code = /* javascript */ `
    const fn = () => {
      const script = document.querySelector('${selector}');
      if (!script) {
        throw new Error('Script tag to read auth token wasnt found');
      }
  
      return JSON.parse(script.innerHTML)
    }
  `;

  return fromPromise(parse(html, code)).andThen((data) => {
    if (data.type === 'error') {
      return Err({
        custom: 'Script tag to read auth token wasnt found',
        errorMessage: 'Script tag to read auth token wasnt found',
        message: 'Unauthorized',
        statusCode: 401,
      });
    }

    return Ok(data.result as T);
  });
};

export const numberToDecimal = (num: number) => {
  const [integer, decimal] = num.toFixed(2).split('.').map(Number);
  return { integer, decimal };
};
