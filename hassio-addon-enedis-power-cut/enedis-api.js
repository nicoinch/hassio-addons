const axios = require('/usr/src/app/node_modules/axios');

const getEnedisToken = async () => {
  try {
    const response = await axios.post(
      'https://megacache.p.web-enedis.fr/v2/g/trace',
      {
        step: '592e01b8f2d25cd72e377c38fa542a4573165f3a1e43a003164093fa7b9b060d',
      },
      {
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Could not get Enedis token', error);
  }
};

const getEnedisForecasts = async (
  token,
  { street = 'Rue%20Guynemer%20(imp)', citycode = '59553' },
) => {
  try {
    const response = await axios.get(
      `https://megacache.p.web-enedis.fr/v2/shedding?street=${street}&insee_code=${citycode}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
          'Authorization': 'Bearer ' + token,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Could not get Enedis forecats', error.response.status);
    if (error.response && error.response.status === 401) {
      console.log('Token expired, getting a new one');
      const data = await getEnedisToken();
      return await getEnedisForecasts(data.token, { street, citycode });
    }
  }
};

module.exports = {
  getEnedisToken,
  getEnedisForecasts,
};
