const express = require('express');
const morgan = require('morgan');
const rp = require('request-promise');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3000;

const app = express();

const cache = {
  updated: 0,
  data: null,
};

app.use(morgan('combined'));

app.get('/data', async (req, res) => {
  const now = timestamp();
  if (now - cache.updated > 10 * 60 || !cache.data) {
    cache.updated = now;
    cache.data = await fetch();
  }

  if (typeof req.query.device != 'string') {
    return res.status(400).json({ 'error': `missing query 'device'` });
  }

  const device = req.query.device.toLowerCase();

  if (!cache.data[device]) {
    return res.status(404).json({ 'error': `device not found: ${device}` });
  }

  res.json({
    device: device,
    count: cache.data[device],
    updated: cache.updated,
  });
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));

async function fetch() {
  const html = await rp.get('https://stats.mokeedev.com');
  const $ = cheerio.load(html);

  const data = {};

  $('tr').each((i, tr) => {
    const tds = $(tr).find('> td');
    if (tds.length != 2) return;
    const td0 = $(tds.get(0));
    const td1 = $(tds.get(1));

    const name = td0.text().toLowerCase();

    data[name] = parseInt(td1.text().replace(/,/g,''));
  });

  return data;
}

function timestamp() {
  return parseInt(Number(new Date()) / 1000);
}
