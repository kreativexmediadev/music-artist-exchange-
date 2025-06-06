import { artistService } from '../services/artistService';

async function testArtistAPI() {
  try {
    // Test 1: Search for artists
    console.log('Testing artist search...');
    const searchResults = await artistService.getArtists({
      search: 'Drake',
      pageSize: 5
    });
    console.log('Search Results:', JSON.stringify(searchResults, null, 2));

    if (searchResults.artists.length > 0) {
      const artistId = searchResults.artists[0].id;

      // Test 2: Get specific artist details
      console.log('\nTesting get artist by ID...');
      const artistDetails = await artistService.getArtistById(artistId);
      console.log('Artist Details:', JSON.stringify(artistDetails, null, 2));

      // Test 3: Get artist price
      console.log('\nTesting get artist price...');
      const priceData = await artistService.getArtistPrice(artistId);
      console.log('Price Data:', JSON.stringify(priceData, null, 2));

      // Test 4: Get artist metrics
      console.log('\nTesting get artist metrics...');
      const metrics = await artistService.getArtistMetrics(artistId);
      console.log('Metrics:', JSON.stringify(metrics, null, 2));

      // Test 5: Get order book
      console.log('\nTesting get order book...');
      const orderBook = await artistService.getOrderBook(artistId);
      console.log('Order Book:', JSON.stringify(orderBook, null, 2));

      // Test 6: Get trade history
      console.log('\nTesting get trade history...');
      const tradeHistory = await artistService.getTradeHistory(artistId);
      console.log('Trade History:', JSON.stringify(tradeHistory, null, 2));
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

// Run the tests
testArtistAPI(); 