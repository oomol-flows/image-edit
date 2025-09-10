import type { Context } from "@oomol/types/oocana";
import sharp from "sharp";
import path from "path";
import fs from "fs";

//#region generated meta
type Inputs = {
    image_path: string;
    title: string | null;
    description: string | null;
    author: string | null;
    copyright: string | null;
    keywords: string | null;
};
type Outputs = {
    image_path: string;
};
//#endregion

export default async function(
    params: Inputs, 
    context: Context<Inputs, Outputs>
): Promise<Outputs> {
    try {
        const inputPath = params.image_path;
        
        if (!fs.existsSync(inputPath)) {
            throw new Error(`Input file does not exist: ${inputPath}`);
        }
        
        const outputDir = "/oomol-driver/oomol-storage";
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const ext = path.extname(inputPath);
        const outputPath = path.join(outputDir, `meta_${Date.now()}${ext}`);
        
        // Build EXIF metadata object
        const exifData: any = {};
        
        if (params.title) {
            exifData['0th'] = exifData['0th'] || {};
            exifData['0th'][270] = params.title; // ImageDescription
        }
        
        if (params.author) {
            exifData['0th'] = exifData['0th'] || {};
            exifData['0th'][315] = params.author; // Artist
        }
        
        if (params.copyright) {
            exifData['0th'] = exifData['0th'] || {};
            exifData['0th'][33432] = params.copyright; // Copyright
        }
        
        // For Sharp, we'll use withMetadata to preserve and add metadata
        const image = sharp(inputPath);
        
        // Build metadata for Sharp
        const metadata: any = {};
        
        if (params.title || params.description || params.author || params.copyright || params.keywords) {
            // Create IPTC data
            const iptcData: any = {};
            
            if (params.title) {
                metadata.title = params.title;
            }
            
            if (params.description) {
                metadata.description = params.description;
            }
            
            if (params.author) {
                metadata.artist = params.author;
            }
            
            if (params.copyright) {
                metadata.copyright = params.copyright;
            }
            
            if (params.keywords) {
                metadata.keywords = params.keywords;
            }
        }
        
        // Process the image with metadata
        await image
            .withMetadata(metadata)
            .toFile(outputPath);
        
        return { image_path: outputPath };
    } catch (error) {
        throw new Error(`Failed to write metadata: ${error.message}`);
    }
}