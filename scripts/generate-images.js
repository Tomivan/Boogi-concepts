// Run this script to generate responsive images
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const images = [
    'background.webp',
    'background-1.webp',
    'background-2.webp',
    'background-3.webp',
    'background-5.webp'
];

const sizes = {
    mobile: 640,
    tablet: 1024,
    desktop: 1920
};

async function generateResponsiveImages() {
    for (const image of images) {
        const inputPath = path.join(__dirname, '../src/assets/images', image);
        const fileName = path.parse(image).name;
        
        // Generate mobile version
        await sharp(inputPath)
            .resize(sizes.mobile)
            .webp({ quality: 80 })
            .toFile(path.join(__dirname, '../src/assets/images', `${fileName}-mobile.webp`));
        
        // Generate tablet version
        await sharp(inputPath)
            .resize(sizes.tablet)
            .webp({ quality: 85 })
            .toFile(path.join(__dirname, '../src/assets/images', `${fileName}-tablet.webp`));
        
        // Keep desktop version as is but optimize
        await sharp(inputPath)
            .webp({ quality: 90 })
            .toFile(path.join(__dirname, '../src/assets/images', `${fileName}-desktop.webp`));
        
        console.log(`Generated responsive images for ${image}`);
    }
}

generateResponsiveImages();