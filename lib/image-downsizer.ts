// Function to downscale an image if needed
import sharp from "sharp"

export async function processImage(file: File, max_image_size: number): Promise<Buffer> {
  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Check file size
  if (buffer.length <= max_image_size) {
    return buffer // Return original if under the size limit
  }

  // Resize the image
  console.log(`Resizing image from ${buffer.length} bytes (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`)

  // Start with 80% quality
  let quality = 80
  let resizedImage = await sharp(buffer).jpeg({ quality }).toBuffer()

  // If still too large, reduce quality or dimensions further
  while (resizedImage.length > max_image_size && quality > 30) {
    quality -= 10
    resizedImage = await sharp(buffer).jpeg({ quality }).toBuffer()
  }

  // If still too big after quality reduction, reduce dimensions
  if (resizedImage.length > max_image_size) {
    const metadata = await sharp(buffer).metadata()
    const width = metadata.width || 1000
    const height = metadata.height || 1000

    // Reduce to 70% of original size
    const newWidth = Math.round(width * 0.7)
    const newHeight = Math.round(height * 0.7)

    resizedImage = await sharp(buffer).resize(newWidth, newHeight).jpeg({ quality }).toBuffer()
  }

  console.log(`Resized to ${resizedImage.length} bytes (${(resizedImage.length / 1024 / 1024).toFixed(2)}MB)`)
  return resizedImage
}
