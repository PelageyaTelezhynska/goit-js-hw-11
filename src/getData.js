const axios = require('axios').default;

const BASE_URL = 'https://pixabay.com/api/';

async function onSearch(input, page = 1) {
  const query = await axios.get(BASE_URL, {
    params: {
      key: '30950897-80d6e23e9a51a92c0c7387081',
      q: input,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page: page,
      per_page: 40,
    },
  });
  const results = await query.data;
  return results;
}

export { onSearch };
