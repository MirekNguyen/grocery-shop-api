import { parseCategories, scrapeAllCategories } from './modules/scraper/scraper.service';

const CATEGORIES_FILE_PATH = './categories';

async function main() {
  try {
    console.log('📖 Reading categories file...');
    
    // Read the categories file
    const categoriesFile = Bun.file(CATEGORIES_FILE_PATH);
    const categoriesContent = await categoriesFile.text();
    
    // Parse categories
    const categories = parseCategories(categoriesContent);
    console.log(`✅ Found ${categories.length} categories to scrape\n`);
    
    // Start scraping
    await scrapeAllCategories(categories);
    
    console.log('\n🎉 All done!');
  } catch (error) {
    console.error('❌ Error running scraper:', error);
    process.exit(1);
  }
}

main();
