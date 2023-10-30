import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { services } from '~/shared/allServices';

Object.entries(services).forEach(([id, service]) => {
  const url = `https://itunes.apple.com/lookup?id=${service.appleId}`;
  axios
    .get(url)
    .then((response) => {
      const data = response.data;

      if (data.resultCount === 0) {
        console.log('No app icon found for ' + service.title);
        return;
      }

      let artworkUrl = data.results[0].artworkUrl512;

      // replace extension to png
      artworkUrl = artworkUrl.replace('512x512bb.jpg', '512x512bb.png');

      const filename = service.id + '.png';
      const iconsDir = path.join(__dirname, '..', 'assets/icons');
      const filepath = path.join(iconsDir, filename);

      // make sure the icons directory exists
      if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir);
      }

      axios({
        method: 'get',
        url: artworkUrl,
        responseType: 'stream',
      })
        .then((response) => {
          const writer = fs.createWriteStream(filepath);
          response.data.pipe(writer);
          writer.on('finish', () => {
            console.log(`File saved at ${filepath}`);
          });
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch((error) => {
      console.error(error);
    });
});
