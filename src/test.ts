import { parseCategories, scrapeCategoryProducts } from './modules/scraper/scraper.service';

const CATEGORIES_FILE_PATH = './categories';

async function main() {
  try {
    console.log('📖 Reading categories file...');
    
    // Read the categories file
    const categoriesFile = Bun.file(CATEGORIES_FILE_PATH);
    const categoriesContent = await categoriesFile.text();
    
    // Parse categories
    const categories = parseCategories(categoriesContent);
    console.log(`✅ Found ${categories.length} categories\n`);
    
    // Scrape only the first category for testing
    console.log('🧪 Test mode: Scraping only first category...\n');
    await scrapeCategoryProducts(categories[0]);
    
    console.log('\n✅ Test complete!');
  } catch (error) {
    console.error('❌ Error running test:', error);
    process.exit(1);
  }
}

main();
