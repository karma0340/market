const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

/**
 * Service to handle file storage and optimization.
 * Prepared for local storage and future CDN/S3 integration.
 */
class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../uploads');
    this.cdnUrl = process.env.CDN_URL || ''; // Prefix for CDN if available
  }

  /**
   * Optimizes and saves an image file.
   * @param {Object} file - Multer file object
   * @param {String} type - 'productImages' or other
   * @returns {String} - Public path to the optimized image
   */
  async optimizeImage(file) {
    try {
      const filename = `${Date.now()}-${uuidv4()}.webp`;
      const outputPath = path.join(this.uploadDir, filename);

      // Initialize sharp with the buffer or file path
      let pipeline = sharp(file.path);

      // Metadata check
      const metadata = await pipeline.metadata();

      // Resize if too large (Max width 1920px for high quality)
      if (metadata.width > 1920) {
        pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
      }

      // Compress and convert to WebP for best performance
      await pipeline
        .webp({ quality: 80, effort: 6 })
        .toFile(outputPath);

      // Delete the original temporary file from multer
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error('Failed to delete original file:', err);
      }

      // Return relative path for DB
      return `uploads/${filename}`;
    } catch (error) {
      console.error('Image optimization failed:', error);
      // Fallback to original path if optimization fails
      return file.path.replace(/\\/g, '/');
    }
  }

  /**
   * Handles non-image files like ZIPs or PDFs.
   * @param {Object} file - Multer file object
   * @returns {String} - Path to the file
   */
  async saveFile(file) {
    // For now, we just return the path provided by multer
    // In S3 integration, this would upload to an S3 bucket
    return file.path.replace(/\\/g, '/');
  }

  /**
   * Resolves a stored path to a full URL (Local or CDN).
   * @param {String} storedPath - Path from DB
   * @returns {String} - Full URL
   */
  resolveUrl(storedPath) {
    if (!storedPath) return '';
    if (storedPath.startsWith('http') || storedPath.startsWith('data:')) return storedPath;

    if (this.cdnUrl) {
      return `${this.cdnUrl.replace(/\/$/, '')}/${storedPath.replace(/^uploads\//, '')}`;
    }

    // Fallback to local server (should be handled by frontend usually)
    return storedPath;
  }
}

module.exports = new StorageService();
