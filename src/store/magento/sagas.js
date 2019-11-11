import { takeLatest, call, put } from 'redux-saga/effects';
import AsyncStorage from '@react-native-community/async-storage';
import { magento, CUSTOMER_TOKEN } from '../../magento';
import Status from '../../magento/Status';
import { MAGENTO, USER_LOGGED_IN_STATUS } from '../../constants';
import { magentoOptions } from '../../../config/magento';

// worker saga: Add Description
function* initMagento() {
  if (magento.isConfigured()) return;

  try {
    yield put({ type: MAGENTO.INIT_APP_LOADING });
    // Set magento base url
    magento.setOptions(magentoOptions);
    // Set magento integration token
    magento.init();
    // Get Customer token from local db
    const customerToken = yield AsyncStorage.getItem(CUSTOMER_TOKEN);
    magento.setCustomerToken(customerToken);
    // Fetch store config, containing base media url path
    const storeConfig = yield call({ context: magento, fn: magento.admin.getStoreConfig });
    magento.setStoreConfig(storeConfig);
    yield put({ type: MAGENTO.INIT_APP_SUCCESS, payload: { storeConfig } });
    // fetch currency data
    yield put({ type: MAGENTO.CURRENCY_REQUEST });
    // fetch HomeBanner and featured product
    yield put({ type: MAGENTO.HOME_DATA_REQUEST });
    if (customerToken) {
      yield put({ type: MAGENTO.CUSTOMER_CART_REQUEST }); // Fetch cart details
      yield put({ type: USER_LOGGED_IN_STATUS, payload: { status: Status.SUCCESS } });
    }
  } catch (error) {
    yield put({
      type: MAGENTO.INIT_APP_FAILURE,
      payload: {
        errorCode: error.name,
        errorMessage: error.message
      }
    });
  }
}

// worker saga: Add Description
function* getCountries() {
  try {
    yield put({ type: MAGENTO.COUNTRIES_LOADING });
    const countries = yield call({ content: magento, fn: magento.admin.getCountries });
    yield put({ type: MAGENTO.COUNTRIES_SUCCESS, payload: { countries } });
  } catch (error) {
    yield put({ type: MAGENTO.COUNTRIES_FAILURE, payload: { errorMessage: error.message } });
  }
}

// worker saga: fetch available currency support with their exchange rates.
function* getCurrency() {
  try {
    yield put({ type: MAGENTO.CURRENCY_LOADING });
    const currencyData = yield call({ content: magento, fn: magento.guest.getCurrency });
    const displayCurrency = getCurrencyToBeDisplayed(currencyData);
    yield put({ type: MAGENTO.CURRENCY_SUCCESS, payload: { currencyData, displayCurrency } });
  } catch (error) {
    yield put({ type: MAGENTO.CURRENCY_FAILURE, payload: { errorMessage: error.message } });
  }
}

const getCurrencyToBeDisplayed = (currencyData) => {
  let code = currencyData.default_display_currency_code;
  let symbol = currencyData.default_display_currency_symbol;
  let rate = 1;

  if (currencyData.base_currency_code !== currencyData.default_display_currency_code && 'exchange_rates' in currencyData) {
    const exchangeRate = currencyData.exchange_rates.find(_exchangeRate => _exchangeRate.currency_to === code);
    if (exchangeRate && 'rate' in exchangeRate) {
      rate = exchangeRate.rate;
    }
  }
  if ('available_currency_codes' in currencyData && currencyData.available_currency_codes.length > 0) {
    // TODO(1): Check if user has selected any other currency, from AsyncStorage key
    // and set code, symbol and rate according to that
    // TODO(2): If not and currency get from RNLocalize is supported, then set that and update AsyncStorage
  }

  return {
    code,
    symbol,
    rate,
  };
};


// watcher saga: watches for actions dispatched to the store, starts worker saga
export default function* watcherSaga() {
  yield takeLatest(MAGENTO.INIT_APP_REQUEST, initMagento);
  yield takeLatest(MAGENTO.CURRENCY_REQUEST, getCurrency);
  yield takeLatest(MAGENTO.COUNTRIES_REQUEST, getCountries);
}
