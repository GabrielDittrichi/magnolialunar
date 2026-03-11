const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
      reject(err);
    });
  });
};

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
  }
};

// Function to try to get original image URL by removing dimensions
const getOriginalUrl = (url) => {
    return url.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
};

const therapists = [
  {
    name: 'Beatriz',
    slug: 'beatriz',
    bio: 'Loira dos olhos castanhos\naltura:1,57\npeso:60kg\nidade:32 anos\nbrasileira',
    mainImageRemote: 'https://magnolialunar.pt/wp-content/uploads/2026/01/beatriz4-768x1129.jpeg',
    galleryRemotes: [
      'https://magnolialunar.pt/wp-content/uploads/2025/12/Btr6-1.png',
      'https://magnolialunar.pt/wp-content/uploads/2025/12/Btr5.png',
      'https://magnolialunar.pt/wp-content/uploads/2025/12/Btr4.png',
      'https://magnolialunar.pt/wp-content/uploads/2025/12/Btr3-768x1156.png',
      'https://magnolialunar.pt/wp-content/uploads/2025/12/Btr1-768x1163.png',
      'https://magnolialunar.pt/wp-content/uploads/2025/12/Btr2-768x1151.png',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/beatriz8-768x1133.jpeg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/beatriz7-768x1101.jpeg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/beatriz6-768x1126.jpeg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/beatriz5-768x1128.jpeg'
    ]
  },
  {
    name: 'Luiza',
    slug: 'luiza',
    bio: '',
    mainImageRemote: 'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0012-1-768x1153.jpg',
    galleryRemotes: [
      'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0006-1-768x1153.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0009-768x1153.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0007-768x1153.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0011-768x1153.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0010-768x1153.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2026/01/IMG-20260115-WA0012-768x1153.jpg'
    ]
  },
  {
    name: 'Mariha',
    slug: 'mariha',
    bio: 'Loira dos olhos verdes\naltura:1,66\npeso:55kg\nidade:26 anos\nbrasileira\n\nMariha é especialista em massagens eróticas e sensuais, oferecendo uma experiência exclusiva de relaxamento, prazer e conexão. Com técnica refinada e uma abordagem cuidadosa, ela proporciona momentos de intensa sensação e bem-estar',
    mainImageRemote: 'https://magnolialunar.pt/wp-content/uploads/2025/10/mylher.jpg',
    galleryRemotes: [
      'https://magnolialunar.pt/wp-content/uploads/2025/10/Mariha.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2025/11/mariha2.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2025/11/mariha3-768x1137.jpg',
      'https://magnolialunar.pt/wp-content/uploads/2025/11/mariha4-768x1171.jpg'
    ]
  }
];

const baseDir = path.join(__dirname, 'web/public/images/therapists');
ensureDir(baseDir);

const processTherapists = async () => {
  const finalData = [];

  for (const t of therapists) {
    console.log(`Processing ${t.name}...`);
    const tDir = path.join(baseDir, t.slug);
    ensureDir(tDir);

    const therapistData = {
      name: t.name,
      slug: t.slug,
      bio: t.bio,
      mainImage: '',
      gallery: []
    };

    // Download Main Image
    // Try original URL first, then fallback to resized
    let mainUrl = getOriginalUrl(t.mainImageRemote);
    let mainFilename = `main${path.extname(mainUrl)}`;
    let mainDest = path.join(tDir, mainFilename);
    
    try {
        console.log(`Downloading main image: ${mainUrl}`);
        await downloadFile(mainUrl, mainDest);
        therapistData.mainImage = `/images/therapists/${t.slug}/${mainFilename}`;
    } catch (e) {
        console.log(`Failed original, trying resized: ${t.mainImageRemote}`);
        mainUrl = t.mainImageRemote;
        mainFilename = `main${path.extname(mainUrl)}`;
        mainDest = path.join(tDir, mainFilename);
        try {
            await downloadFile(mainUrl, mainDest);
            therapistData.mainImage = `/images/therapists/${t.slug}/${mainFilename}`;
        } catch (e2) {
            console.error(`Failed to download main image for ${t.name}`);
        }
    }

    // Download Gallery
    for (let i = 0; i < t.galleryRemotes.length; i++) {
        const url = t.galleryRemotes[i];
        let galleryUrl = getOriginalUrl(url);
        let galleryFilename = `gallery-${i + 1}${path.extname(galleryUrl)}`;
        let galleryDest = path.join(tDir, galleryFilename);

        try {
            await downloadFile(galleryUrl, galleryDest);
            therapistData.gallery.push(`/images/therapists/${t.slug}/${galleryFilename}`);
        } catch (e) {
             // Fallback to resized
             galleryUrl = url;
             galleryFilename = `gallery-${i + 1}${path.extname(galleryUrl)}`;
             galleryDest = path.join(tDir, galleryFilename);
             try {
                await downloadFile(galleryUrl, galleryDest);
                therapistData.gallery.push(`/images/therapists/${t.slug}/${galleryFilename}`);
             } catch (e2) {
                 console.error(`Failed gallery image ${i+1} for ${t.name}`);
             }
        }
    }

    finalData.push(therapistData);
  }

  const jsonPath = path.join(__dirname, 'web/src/data/therapists_scraped.json');
  fs.writeFileSync(jsonPath, JSON.stringify(finalData, null, 2));
  console.log(`Saved data to ${jsonPath}`);
};

processTherapists();
