import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { services } from '~/shared/allServices';
import gplay from 'google-play-scraper';
const service = services.joyn;
// Object.entries(services).forEach(([id, service]) => {

gplay
  .app({ appId: 'de.sky.online' })
  .then((data) => {
    console.log('sadas');
    const artworkUrl = data.icon;

    const filename = service.id + '-' + path.basename(artworkUrl);
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
// });
